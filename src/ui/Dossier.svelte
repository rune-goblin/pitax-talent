<script lang="ts">
  import { t } from '../i18n';
  import { dossier, thumbPath } from '../roster';

  interface Props {
    id: string | null;
    stagedId: string | null;
    onstage: (id: string) => void;
    onbrowse: () => void;
  }

  let { id, stagedId, onstage, onbrowse }: Props = $props();

  let scroller = $state<HTMLElement>();
  let nav = $state<HTMLElement>();

  const d = $derived(dossier(id ?? ''));
  const onStage = $derived(!!d && d.npc.id === stagedId);
  const sections = $derived.by(() => {
    if (!d) return [];
    const present: [string, unknown][] = [
      ['faction', d.faction],
      ['bio', d.bio || d.background],
      ['case', d.case],
      ['agenda', d.agenda],
      ['consequences', d.consequences],
    ];
    return present.filter(([, has]) => has).map(([key]) => key);
  });

  $effect(() => {
    void id;
    if (scroller) scroller.scrollTop = 0;
  });

  function jump(key: string) {
    const target = scroller?.querySelector<HTMLElement>(`[data-section="${key}"]`);
    if (!scroller || !target) return;
    scroller.scrollTo({ top: target.offsetTop - (nav?.offsetHeight ?? 0) - 4, behavior: 'smooth' });
  }

  function stageShown() {
    if (d) onstage(d.npc.id);
  }
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

<article class="dossier" bind:this={scroller}>
  {#if !d}
    <div class="empty">
      <p>{t('dossier.empty')}</p>
      <button type="button" class="action" onclick={onbrowse}>
        <i class="fa-solid fa-users"></i>
        {t('director.tabs.cast')}
      </button>
    </div>
  {:else}
    <header>
      <img src={thumbPath(d.npc)} alt="" />
      <div class="identity">
        <span class="status" class:live={onStage}>{onStage ? t('dossier.onStage') : t('dossier.preview')}</span>
        <h2>{d.npc.name}</h2>
        <p class="role">{d.npc.role}</p>
        {#if d.npc.stats}<p class="stats">{d.npc.stats}</p>{/if}
        {#if d.npc.fate}<p class="fate">{d.npc.fate}</p>{/if}
        {#if !onStage}
          <button type="button" class="action" onclick={stageShown}>
            <i class="fa-solid fa-person-walking"></i>
            {t('director.bringOn')}
          </button>
        {/if}
      </div>
    </header>

    <nav bind:this={nav}>
      {#each sections as key (key)}
        <button type="button" onclick={() => jump(key)}>{t(`dossier.${key}`)}</button>
      {/each}
    </nav>

    {#if d.faction}
      <section data-section="faction">
        <h3>{d.faction.name}</h3>
        <p class="meta">{d.faction.type} · {d.faction.colors} · {d.faction.symbol} · {d.faction.clothing}</p>
        <p>{d.faction.summary}</p>
      </section>
    {/if}

    {#if d.bio || d.background}
      <section data-section="bio">
        <h3>{t('dossier.bio')}</h3>
        {#if d.bio}<p>{d.bio}</p>{/if}
        {#if d.background}<p>{d.background}</p>{/if}
      </section>
    {/if}

    {#if d.case}
      <section data-section="case">
        <h3>{t('dossier.case')}</h3>
        <blockquote>{d.case.pitch}</blockquote>
        <div class="lists">
          {@render list(t('dossier.offers'), d.case.offers)}
          {@render list(t('dossier.asks'), d.case.asks)}
          {@render list(t('dossier.hides'), d.case.hides, true)}
          {@render list(t('dossier.probes'), d.case.probes)}
        </div>
      </section>
    {/if}

    {#if d.agenda}
      <section data-section="agenda">
        <h3>{t('dossier.agenda')}</h3>
        {#if d.agenda.goal}
          <p class="goal">
            <strong>{d.agenda.goal}</strong>
            {#if d.agenda.clock}
              <span class="clock" role="img" aria-label="{d.agenda.progress ?? 0}/{d.agenda.clock}">
                {#each { length: d.agenda.clock }, i (i)}<i class:filled={i < (d.agenda.progress ?? 0)}></i>{/each}
              </span>
            {/if}
          </p>
        {/if}
        <div class="lists">
          {@render list(t('dossier.allies'), d.agenda.allies)}
          {@render list(t('dossier.enemies'), d.agenda.enemies)}
          {@render list(t('dossier.assets'), d.agenda.assets)}
          {@render list(t('dossier.vulnerabilities'), d.agenda.vulnerabilities, true)}
        </div>
      </section>
    {/if}

    {#if d.consequences}
      <section data-section="consequences">
        <h3>{t('dossier.consequences')}</h3>
        <p><em>{d.consequences.motive}</em></p>
        <div class="lists">
          {@render list(t('dossier.seated'), d.consequences.seated)}
          {@render list(t('dossier.refused'), d.consequences.refused)}
        </div>
        {@render list(t('dossier.conflicts'), d.consequences.conflicts)}
      </section>
    {/if}
  {/if}
</article>

<style>
  .dossier {
    /* Section jumps measure offsetTop against this box. */
    position: relative;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0 16px 20px;
    container-type: inline-size;
    font-size: 14px;
    line-height: 1.5;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding-top: 20px;
    color: var(--pt-muted);
    font-style: italic;
  }

  header {
    display: flex;
    align-items: flex-end;
    gap: 16px;
    padding: 14px 0 12px;
  }

  header img {
    flex: none;
    height: 168px;
    border: none;
    object-fit: contain;
    filter: drop-shadow(0 8px 10px rgb(0 0 0 / 0.65));
  }

  .identity {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    min-width: 0;
  }

  .status {
    padding: 2px 8px 1px;
    border: 1px solid var(--pt-gilt-dim);
    border-radius: 2px;
    color: var(--pt-gilt);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
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
    font-size: 40px;
    line-height: 0.95;
  }

  p {
    margin: 0 0 0.5em;
  }

  .role {
    margin: 0;
    font-family: var(--pt-serif);
    font-size: 17px;
    font-style: italic;
    line-height: 1.25;
  }

  .stats {
    margin: 0;
    color: var(--pt-muted);
    font-size: 12.5px;
  }

  .fate {
    margin: 0;
    color: var(--pt-ruby-soft);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .action {
    flex: none;
    gap: 8px;
    width: auto;
    height: 34px;
    margin-top: 8px;
    padding: 2px 16px 0;
    border: 1px solid var(--pt-gilt);
    border-radius: 3px;
    background: linear-gradient(180deg, #8a1730, #5a0f20);
    box-shadow: 0 3px 10px rgb(0 0 0 / 0.5), inset 0 1px 0 rgb(255 255 255 / 0.18);
    color: #fff3d6;
    font-family: var(--pt-display);
    font-size: 19px;
    font-style: normal;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: filter 140ms ease, transform 140ms ease;
  }

  .action i {
    font-size: 13px;
  }

  .action:hover {
    filter: brightness(1.25);
    transform: translateY(-1px);
  }

  nav {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin: 0 -16px;
    padding: 7px 16px;
    border-block: 1px solid var(--pt-ink-line);
    background: var(--pt-ink-raised);
  }

  nav button {
    flex: none;
    width: auto;
    height: 22px;
    min-height: 0;
    padding: 0 9px;
    border: 1px solid transparent;
    border-radius: 11px;
    background: none;
    box-shadow: none;
    color: var(--pt-muted);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: color 140ms ease, border-color 140ms ease;
  }

  nav button:hover {
    border-color: var(--pt-gilt-dim);
    color: var(--pt-gilt);
  }

  section {
    padding-top: 16px;
  }

  h3 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 6px;
    border: none;
    color: var(--pt-gilt);
    font-family: var(--pt-display);
    font-size: 24px;
    letter-spacing: 0.05em;
    line-height: 1;
    text-transform: uppercase;
  }

  h3::after {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--pt-ink-line), transparent);
    content: '';
  }

  .meta {
    color: var(--pt-muted);
    font-size: 12.5px;
  }

  blockquote {
    margin: 2px 0 10px;
    padding: 2px 0 2px 14px;
    border-left: 2px solid var(--pt-gilt);
    color: #fff3d6;
    font-family: var(--pt-serif);
    font-size: 19px;
    font-style: italic;
    line-height: 1.3;
  }

  .lists {
    display: grid;
    gap: 10px 20px;
    margin-bottom: 10px;
  }

  @container (min-width: 460px) {
    .lists {
      grid-template-columns: 1fr 1fr;
    }
  }

  h4 {
    margin: 0 0 2px;
    color: var(--pt-gilt);
    font-family: var(--font-sans);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
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
    padding: 2px 0 2px 14px;
    line-height: 1.35;
  }

  li::before {
    position: absolute;
    top: 0.62em;
    left: 2px;
    width: 5px;
    height: 5px;
    background: var(--pt-gilt-dim);
    content: '';
    rotate: 45deg;
  }

  .secret li::before {
    background: var(--pt-ruby);
  }

  .goal {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 12px;
  }

  .clock {
    display: inline-flex;
    gap: 3px;
  }

  .clock i {
    width: 9px;
    height: 9px;
    border: 1px solid var(--pt-gilt-dim);
    rotate: 45deg;
  }

  .clock i.filled {
    border-color: var(--pt-gilt);
    background: var(--pt-gilt);
  }
</style>
