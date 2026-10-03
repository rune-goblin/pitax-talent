<script lang="ts" module>
  /** What the dossier is about: one character, or a faction whose candidates audition as a slate. */
  export type Subject = { kind: 'npc'; id: string } | { kind: 'faction'; id: string };
</script>

<script lang="ts">
  import { t, tf } from '../i18n';
  import { factions } from '../pitax/pitax';
  import { candidatesOf, contestant, dossier, factionById, thumbPath, type Dossier } from '../roster';
  import type { Clock } from '../state';
  import ProgressClock from './ProgressClock.svelte';

  interface Props {
    subject: Subject | null;
    stagedIds: string[];
    clocks: Record<string, Clock>;
    onshow: (id: string) => void;
    onstage: (ids: string[]) => void;
    onbrowse: () => void;
    onclock: (id: string, clock: Clock) => void;
  }

  let { subject, stagedIds, clocks, onshow, onstage, onbrowse, onclock }: Props = $props();

  const clockOf = (d: Dossier): Clock | undefined =>
    clocks[d.npc.id] ?? (d.agenda?.clock ? { size: d.agenda.clock, progress: d.agenda.progress ?? 0 } : undefined);

  const faction = $derived(subject?.kind === 'faction' ? factionById(subject.id) : undefined);
  const entries = $derived.by((): Dossier[] => {
    if (!subject) return [];
    if (faction) return candidatesOf(faction).map((n) => dossier(n.id)).filter((d) => !!d);
    const d = dossier(subject.id);
    return d ? [d] : [];
  });
  const lead = $derived(entries[0]);
  const shownFaction = $derived(faction ?? lead?.faction);
  const slateIds = $derived(entries.map((d) => d.npc.id));
  const onStage = $derived(slateIds.length > 0 && slateIds.every((id) => stagedIds.includes(id)));
  const others = $derived(stagedIds.filter((id) => !slateIds.includes(id)).map(contestant).filter((npc) => !!npc));

  const sections = $derived.by(() => {
    if (!lead) return [];
    const has = (pick: (d: Dossier) => unknown) => entries.some(pick);
    const present: [string, unknown][] = [
      ['faction', shownFaction],
      ['bio', has((d) => d.bio || d.background)],
      ['case', has((d) => d.case)],
      ['goal', has((d) => d.agenda?.goal)],
      ['position', has((d) => d.agenda)],
      ['consequences', has((d) => d.consequences)],
    ];
    return present.filter(([, ok]) => ok).map(([key]) => key);
  });

  // The GM's choice of page survives switching subjects, so comparing the factions' cases is one click each.
  let chosen = $state('case');
  const section = $derived(sections.includes(chosen) ? chosen : sections[0]);

  let body = $state<HTMLElement>();
  $effect(() => {
    void subject;
    void section;
    if (body) body.scrollTop = 0;
  });
</script>

{#snippet list(label: string, items: string[] | undefined, secret = false)}
  {#if items?.length}
    <div class="list" class:secret>
      <h4>{label}</h4>
      <ul>
        {#each items as item, i (i)}<li>{item}</li>{/each}
      </ul>
    </div>
  {/if}
{/snippet}

{#snippet byName(d: Dossier)}
  {#if entries.length > 1}
    <h3>
      <button type="button" class="person" onclick={() => onshow(d.npc.id)}>{d.npc.name}</button>
    </h3>
  {/if}
{/snippet}

<article class="dossier">
  {#if !lead}
    <div class="empty">
      <p>{t('dossier.empty')}</p>
      <button type="button" class="action" onclick={onbrowse}>
        <i class="fa-solid fa-users"></i>
        {t('director.tabs.council')}
      </button>
    </div>
  {:else}
    <header>
      <span class="faces">
        {#each entries as d (d.npc.id)}
          <img src={thumbPath(d.npc)} alt="" />
        {/each}
      </span>
      <div class="identity">
        <span class="status" class:live={onStage}>{onStage ? t('dossier.onStage') : t('dossier.preview')}</span>
        {#if faction}
          <h2>{faction.name}</h2>
          <p class="role">{faction.type} · {tf('director.rank', { rank: String(factions.indexOf(faction) + 1), of: String(factions.length) })}</p>
          <p class="stats">
            {t('dossier.candidates')}:
            {#each entries as d, i (d.npc.id)}
              {#if i}·{/if}
              <button type="button" class="person" onclick={() => onshow(d.npc.id)}>{d.npc.name}</button>
            {/each}
          </p>
        {:else}
          <h2>{lead.npc.name}</h2>
          <p class="role">{lead.npc.role}</p>
          {#if lead.npc.stats}<p class="stats">{lead.npc.stats}</p>{/if}
          {#if lead.npc.fate}<p class="fate">{lead.npc.fate}</p>{/if}
        {/if}
        {#if !onStage}
          <button type="button" class="action" onclick={() => onstage(slateIds)}>
            <i class="fa-solid fa-person-walking"></i>
            {t('director.bringOn')}
          </button>
        {:else if others.length}
          <span class="others">
            {t('dossier.alsoOnStage')}
            {#each others as npc (npc.id)}
              <button type="button" class="chip" onclick={() => onshow(npc.id)}>{npc.name}</button>
            {/each}
          </span>
        {/if}
      </div>
    </header>

    <div class="pages" role="tablist">
      {#each sections as key (key)}
        <button type="button" role="tab" class:current={key === section} aria-selected={key === section} onclick={() => (chosen = key)}>
          {t(`dossier.${key}`)}
        </button>
      {/each}
    </div>

    <div class="body" bind:this={body}>
      {#if section === 'faction' && shownFaction}
        <h3>{shownFaction.name}</h3>
        <p class="meta">{shownFaction.type} · {shownFaction.colors} · {shownFaction.symbol} · {shownFaction.clothing}</p>
        <p>{shownFaction.summary}</p>
      {:else if section === 'bio'}
        {#each entries as d (d.npc.id)}
          {@render byName(d)}
          {#if d.bio}<p>{d.bio}</p>{/if}
          {#if d.background}<p>{d.background}</p>{/if}
        {/each}
      {:else if section === 'case'}
        {#each entries as d (d.npc.id)}
          {#if d.case}
            {@render byName(d)}
            <blockquote>{d.case.pitch}</blockquote>
            <div class="lists">
              {@render list(t('dossier.offers'), d.case.offers)}
              {@render list(t('dossier.asks'), d.case.asks)}
              {@render list(t('dossier.hides'), d.case.hides, true)}
              {@render list(t('dossier.probes'), d.case.probes)}
            </div>
          {/if}
        {/each}
      {:else if section === 'goal'}
        {#each entries as d (d.npc.id)}
          {#if d.agenda?.goal}
            {@const clock = clockOf(d)}
            {@render byName(d)}
            <div class="goal">
              <p class="objective">{d.agenda.goal}</p>
              {#if clock}<ProgressClock {clock} onchange={(next) => onclock(d.npc.id, next)} />{/if}
            </div>
          {/if}
        {/each}
      {:else if section === 'position'}
        {#each entries as d (d.npc.id)}
          {#if d.agenda}
            {@render byName(d)}
            <div class="lists">
              {@render list(t('dossier.allies'), d.agenda.allies)}
              {@render list(t('dossier.enemies'), d.agenda.enemies)}
              {@render list(t('dossier.assets'), d.agenda.assets)}
              {@render list(t('dossier.vulnerabilities'), d.agenda.vulnerabilities, true)}
            </div>
          {/if}
        {/each}
      {:else if section === 'consequences'}
        {#each entries as d (d.npc.id)}
          {#if d.consequences}
            {@render byName(d)}
            <p><em>{d.consequences.motive}</em></p>
            <div class="lists">
              {@render list(t('dossier.seated'), d.consequences.seated)}
              {@render list(t('dossier.refused'), d.consequences.refused)}
            </div>
            {@render list(t('dossier.conflicts'), d.consequences.conflicts)}
          {/if}
        {/each}
      {/if}
    </div>
  {/if}
</article>

<style>
  .dossier {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    font-family: var(--pt-body);
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 20px 16px;
    color: var(--pt-muted);
    font-style: italic;
  }

  header {
    display: flex;
    flex: none;
    align-items: flex-end;
    gap: 18px;
    padding: 14px 16px 12px;
  }

  .faces {
    display: flex;
    flex: none;
    align-items: flex-end;
  }

  .faces img {
    height: 150px;
    border: none;
    object-fit: contain;
    filter: drop-shadow(0 8px 10px rgb(0 0 0 / 0.65));
  }

  .faces img + img {
    margin-left: -40px;
    transform: scale(0.9);
    transform-origin: bottom;
  }

  .identity {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    min-width: 0;
  }

  .status {
    padding: 1px 9px;
    border: 1px solid var(--pt-gilt-dim);
    border-radius: 3px;
    color: var(--pt-gilt);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 600;
  }

  .status.live {
    border-color: var(--pt-gilt);
    background: var(--pt-gilt);
    color: var(--pt-ink);
  }

  h2 {
    margin: 4px 0 0;
    border: none;
    color: var(--pt-paper);
    font-family: var(--pt-display);
    font-size: 30px;
    font-weight: 600;
    line-height: 1.1;
  }

  p {
    margin: 0 0 0.6em;
  }

  .role {
    margin: 0;
    font-size: 17px;
    font-style: italic;
    line-height: 1.3;
  }

  .stats {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 6px;
    margin: 0;
    color: var(--pt-muted);
    font-family: var(--font-sans);
    font-size: 14px;
  }

  .fate {
    margin: 0;
    color: var(--pt-ruby-soft);
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 600;
  }

  .person {
    display: inline;
    width: auto;
    height: auto;
    min-height: 0;
    padding: 0;
    border: none;
    background: none;
    box-shadow: none;
    color: inherit;
    font: inherit;
    text-decoration: underline dotted var(--pt-gilt-dim);
    text-underline-offset: 3px;
    transition: color 140ms ease;
  }

  .person:hover {
    color: var(--pt-gilt);
  }

  .action {
    flex: none;
    gap: 8px;
    width: auto;
    height: 36px;
    margin-top: 8px;
    padding: 0 16px;
    border: 1px solid var(--pt-gilt);
    border-radius: 4px;
    background: linear-gradient(180deg, #8a1730, #5a0f20);
    box-shadow: 0 3px 10px rgb(0 0 0 / 0.5), inset 0 1px 0 rgb(255 255 255 / 0.18);
    color: #fff3d6;
    font-family: var(--pt-display);
    font-size: 17px;
    font-style: normal;
    font-weight: 600;
    transition: filter 140ms ease, transform 140ms ease;
  }

  .action i {
    font-size: 14px;
  }

  .action:hover {
    filter: brightness(1.25);
    transform: translateY(-1px);
  }

  .others {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    color: var(--pt-muted);
    font-family: var(--font-sans);
    font-size: 14px;
  }

  .chip {
    flex: none;
    width: auto;
    height: 26px;
    min-height: 0;
    padding: 0 10px;
    border: 1px solid var(--pt-gilt-dim);
    border-radius: 13px;
    background: none;
    box-shadow: none;
    color: var(--pt-gilt);
    font-family: var(--font-sans);
    font-size: 14px;
    transition: background 140ms ease, color 140ms ease;
  }

  .chip:hover {
    background: var(--pt-gilt);
    color: var(--pt-ink);
  }

  .pages {
    display: flex;
    flex: none;
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px 16px;
    border-block: 1px solid var(--pt-ink-line);
    background: var(--pt-ink-raised);
  }

  .pages button {
    flex: none;
    width: auto;
    height: 28px;
    min-height: 0;
    padding: 0 12px;
    border: 1px solid transparent;
    border-radius: 14px;
    background: none;
    box-shadow: none;
    color: var(--pt-muted);
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 600;
    transition: color 140ms ease, border-color 140ms ease, background 140ms ease;
  }

  .pages button:hover {
    border-color: var(--pt-gilt-dim);
    color: var(--pt-gilt);
  }

  .pages button.current {
    border-color: var(--pt-gilt);
    background: rgb(220 180 99 / 0.12);
    color: var(--pt-gilt);
  }

  .body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 14px 16px 20px;
    container-type: inline-size;
  }

  h3 {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 0 6px;
    border: none;
    color: var(--pt-gilt);
    font-family: var(--pt-display);
    font-size: 22px;
    font-weight: 600;
    line-height: 1.2;
  }

  .body > h3:not(:first-child) {
    margin-top: 18px;
  }

  h3::after {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--pt-ink-line), transparent);
    content: '';
  }

  h3 .person {
    text-decoration: none;
  }

  .meta {
    color: var(--pt-muted);
    font-family: var(--font-sans);
    font-size: 14px;
  }

  blockquote {
    margin: 2px 0 14px;
    padding: 2px 0 2px 16px;
    border-left: 2px solid var(--pt-gilt);
    color: #fff3d6;
    font-size: 19px;
    font-style: italic;
    line-height: 1.4;
  }

  .lists {
    display: grid;
    gap: 12px 24px;
    margin-bottom: 12px;
  }

  @container (min-width: 540px) {
    .lists {
      grid-template-columns: 1fr 1fr;
    }
  }

  h4 {
    margin: 0 0 3px;
    color: var(--pt-gilt);
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 600;
  }

  .secret h4 {
    color: var(--pt-ruby-soft);
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    position: relative;
    margin: 0;
    padding: 2px 0 2px 16px;
    line-height: 1.4;
  }

  li::before {
    position: absolute;
    top: 0.7em;
    left: 2px;
    width: 6px;
    height: 6px;
    background: var(--pt-gilt-dim);
    content: '';
    rotate: 45deg;
  }

  .secret li::before {
    background: var(--pt-ruby);
  }

  .goal {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 10px 0 24px;
  }

  .objective {
    max-width: 30ch;
    margin: 0;
    color: #fff3d6;
    font-family: var(--pt-display);
    font-size: 26px;
    font-weight: 600;
    line-height: 1.25;
    text-align: center;
    text-wrap: balance;
  }
</style>
