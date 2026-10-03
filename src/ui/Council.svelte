<script lang="ts">
  import { CHECK, X_ON } from '../constants';
  import { t, tf } from '../i18n';
  import { factions, type Faction } from '../pitax/pitax';
  import { candidatesOf, thumbPath } from '../roster';
  import { ruling, tally, type Vote } from '../state';

  interface Props {
    stagedIds: string[];
    shownFactionId: string | null;
    results: Record<string, Vote[]>;
    onpreview: (factionId: string) => void;
    onstage: (ids: string[]) => void;
    onclear: () => void;
  }

  let { stagedIds, shownFactionId, results, onpreview, onstage, onclear }: Props = $props();

  const slates = factions.map((faction, i) => ({ faction, rank: i + 1, candidates: candidatesOf(faction) })).filter((s) => s.candidates.length);
  const onStage = (f: Faction) => candidatesOf(f).every((n) => stagedIds.includes(n.id));

  const heard = $derived(slates.flatMap((s) => (results[s.faction.id] ? [ruling(results[s.faction.id])] : [])));
  const appointed = $derived(heard.filter((r) => r === 'appointed').length);
</script>

<div class="bar">
  <span class="tally">
    <span class="appointed">{tf('council.appointed', { n: String(appointed) })}</span>
    <span class="rejected">{tf('council.rejected', { n: String(heard.length - appointed) })}</span>
    <span>{tf('council.unheard', { n: String(slates.length - heard.length) })}</span>
  </span>
  <button type="button" class="wipe" disabled={!Object.keys(results).length} onclick={onclear}>
    <i class="fa-solid fa-eraser"></i>
    {t('council.clear')}
  </button>
</div>

<ul class="council">
  {#each slates as { faction, rank, candidates } (faction.id)}
    {@const votes = results[faction.id]}
    {@const ruled = votes ? ruling(votes) : null}
    <li
      class="card"
      class:staged={onStage(faction)}
      class:shown={faction.id === shownFactionId}
      class:appointed={ruled === 'appointed'}
      class:rejected={ruled === 'rejected'}
    >
      <button type="button" class="pick" onclick={() => onpreview(faction.id)}>
        <span class="faces">
          {#each candidates as npc (npc.id)}
            <img src={thumbPath(npc)} alt="" loading="lazy" />
          {/each}
          {#if ruled}
            <img class="stamp" src={ruled === 'appointed' ? CHECK : X_ON} alt="" />
          {/if}
        </span>
        <span class="text">
          <span class="rank">{tf('director.rank', { rank: String(rank), of: String(factions.length) })}</span>
          <span class="name">{faction.name}</span>
          <span class="meta">
            {faction.type}
            {#if onStage(faction)}<span class="tag">{t('director.onStage')}</span>{/if}
            {#if votes && ruled}
              {@const { yes, no } = tally(votes)}
              <span class="verdict">
                {t(`director.${ruled}`)}
                <small>{tf('council.score', { yes: String(yes), no: String(no) })}</small>
              </span>
            {/if}
          </span>
          <span class="who">{candidates.map((n) => n.name).join(' · ')}</span>
        </span>
      </button>
      <button
        type="button"
        class="send"
        aria-label={tf('director.bringOnNamed', { name: faction.name })}
        data-tooltip={tf('director.bringOnNamed', { name: faction.name })}
        onclick={() => onstage(candidates.map((n) => n.id))}
      >
        <i class="fa-solid fa-person-walking"></i>
      </button>
    </li>
  {/each}
</ul>

<style>
  .bar {
    display: flex;
    flex: none;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px 16px;
    padding: 12px 16px 0;
  }

  .tally {
    display: flex;
    flex-wrap: wrap;
    gap: 0 14px;
    color: var(--pt-muted);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 600;
  }

  .tally .appointed {
    color: var(--pt-emerald);
  }

  .tally .rejected {
    color: var(--pt-ruby-soft);
  }

  .wipe {
    flex: none;
    gap: 7px;
    width: auto;
    height: 30px;
    min-height: 0;
    padding: 0 12px;
    border: 1px solid var(--pt-gilt-dim);
    border-radius: 15px;
    background: none;
    box-shadow: none;
    color: var(--pt-gilt);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 600;
    transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
  }

  .wipe:hover:not(:disabled) {
    border-color: var(--pt-ruby);
    background: var(--pt-ruby);
    color: white;
  }

  .wipe:disabled {
    opacity: 0.4;
  }

  .council {
    display: grid;
    flex: 1;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    align-content: start;
    gap: 8px;
    min-height: 0;
    margin: 0;
    overflow-y: auto;
    padding: 10px 16px 18px;
    list-style: none;
  }

  .card {
    position: relative;
    display: flex;
    margin: 0;
    border: 1px solid rgb(255 255 255 / 0.07);
    border-radius: 6px;
    background: var(--pt-ink-raised);
    transition: border-color 140ms ease, background 140ms ease;
  }

  .card:hover,
  .card:focus-within {
    border-color: var(--pt-gilt-dim);
    background: #26142e;
  }

  .card.shown {
    border-color: var(--pt-gilt);
  }

  .card.staged {
    border-color: var(--pt-gilt);
    background: linear-gradient(100deg, rgb(220 180 99 / 0.2), transparent 70%), var(--pt-ink-raised);
  }

  .card.appointed {
    box-shadow: inset 3px 0 0 var(--pt-emerald);
  }

  .card.rejected .faces img:not(.stamp) {
    opacity: 0.5;
    filter: grayscale(1);
  }

  .card.rejected .name {
    color: var(--pt-muted);
    text-decoration: line-through;
    text-decoration-color: var(--pt-ruby);
    text-decoration-thickness: 2px;
  }

  .pick {
    flex: 1;
    justify-content: flex-start;
    gap: 12px;
    min-width: 0;
    height: auto;
    padding: 8px 40px 8px 8px;
    border: none;
    background: none;
    box-shadow: none;
    color: var(--pt-paper);
    font-size: inherit;
    text-align: left;
  }

  .faces {
    position: relative;
    display: flex;
    flex: none;
    align-items: flex-end;
  }

  .faces img {
    width: 54px;
    height: 72px;
    border: none;
    object-fit: contain;
  }

  /* A pair stands shoulder to shoulder, the second half a step behind. */
  .faces img + img {
    margin-left: -22px;
    transform: scale(0.9);
    transform-origin: bottom;
  }

  .faces .stamp {
    position: absolute;
    bottom: -2px;
    left: -4px;
    width: 28px;
    height: 28px;
    margin: 0;
    transform: rotate(-10deg);
    filter: drop-shadow(0 2px 3px rgb(0 0 0 / 0.8));
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .rank {
    color: var(--pt-muted);
    font-family: var(--font-sans);
    font-size: 12px;
  }

  .name {
    font-family: var(--pt-display);
    font-size: 20px;
    font-weight: 600;
    line-height: 1.15;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0 10px;
    color: var(--pt-gilt);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 600;
  }

  .tag {
    padding: 0 6px;
    border-radius: 3px;
    background: var(--pt-gilt);
    color: var(--pt-ink);
  }

  .verdict {
    padding: 0 6px;
    border: 1px solid currentcolor;
    border-radius: 3px;
  }

  .appointed .verdict {
    color: var(--pt-emerald);
  }

  .rejected .verdict {
    color: var(--pt-ruby-soft);
  }

  .verdict small {
    margin-left: 3px;
    font-size: inherit;
    font-weight: 400;
    opacity: 0.8;
  }

  .who {
    color: var(--pt-muted);
    font-family: var(--pt-body);
    font-size: 14px;
    line-height: 1.3;
  }

  .send {
    position: absolute;
    top: 50%;
    right: 8px;
    width: 30px;
    height: 30px;
    min-height: 0;
    padding: 0;
    border: 1px solid var(--pt-gilt-dim);
    border-radius: 50%;
    background: var(--pt-ink);
    box-shadow: none;
    color: var(--pt-gilt);
    font-size: 14px;
    opacity: 0;
    translate: 0 -50%;
    transition: opacity 140ms ease, background 140ms ease, color 140ms ease;
  }

  .card:hover .send,
  .send:focus-visible {
    opacity: 1;
  }

  .send:hover {
    border-color: var(--pt-ruby);
    background: var(--pt-ruby);
    color: white;
  }
</style>
