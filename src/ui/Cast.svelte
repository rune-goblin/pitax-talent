<script lang="ts">
  import { t, tf } from '../i18n';
  import { thumbPath, type RosterGroup } from '../roster';

  interface Props {
    groups: RosterGroup[];
    stagedId: string | null;
    shownId: string | null;
    onpreview: (id: string) => void;
    onstage: (id: string) => void;
  }

  let { groups, stagedId, shownId, onpreview, onstage }: Props = $props();

  const cast = $derived(
    groups.flatMap((g) => g.members.map((npc) => ({ npc, troupe: npc.faction ? g.name : t(`director.group.${npc.group}`) }))),
  );
</script>

<ul class="cast">
  {#each cast as { npc, troupe } (npc.id)}
    <li class="card" class:staged={npc.id === stagedId} class:shown={npc.id === shownId}>
      <button type="button" class="pick" onclick={() => onpreview(npc.id)}>
        <img src={thumbPath(npc)} alt="" loading="lazy" />
        <span class="text">
          <span class="name">{npc.name}</span>
          <span class="troupe">
            {troupe}
            {#if npc.id === stagedId}
              <span class="tag">{t('director.onStage')}</span>
            {:else if npc.fate}
              <span class="fate">{npc.fate}</span>
            {/if}
          </span>
          <span class="role">{npc.role}</span>
        </span>
      </button>
      <button
        type="button"
        class="send"
        aria-label={tf('director.bringOnNamed', { name: npc.name })}
        data-tooltip={tf('director.bringOnNamed', { name: npc.name })}
        onclick={() => onstage(npc.id)}
      >
        <i class="fa-solid fa-person-walking"></i>
      </button>
    </li>
  {/each}
</ul>

<style>
  .cast {
    display: grid;
    flex: 1;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    align-content: start;
    gap: 6px;
    min-height: 0;
    margin: 0;
    overflow-y: auto;
    padding: 12px 14px 16px;
    list-style: none;
  }

  .card {
    position: relative;
    display: flex;
    margin: 0;
    border: 1px solid rgb(255 255 255 / 0.07);
    border-radius: 5px;
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

  .pick {
    flex: 1;
    justify-content: flex-start;
    gap: 10px;
    min-width: 0;
    height: auto;
    padding: 5px 34px 5px 6px;
    border: none;
    background: none;
    box-shadow: none;
    color: var(--pt-paper);
    text-align: left;
  }

  .pick img {
    flex: none;
    width: 44px;
    height: 58px;
    border: none;
    object-fit: contain;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .name {
    font-family: var(--pt-display);
    font-size: 19px;
    line-height: 1.05;
  }

  .role {
    display: -webkit-box;
    overflow: hidden;
    color: var(--pt-muted);
    font-size: 11.5px;
    line-height: 1.25;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .troupe {
    display: flex;
    flex-wrap: wrap;
    gap: 0 8px;
    color: var(--pt-gilt);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .fate {
    color: var(--pt-ruby-soft);
  }

  .tag {
    padding: 0 5px;
    border-radius: 2px;
    background: var(--pt-gilt);
    color: var(--pt-ink);
  }

  .send {
    position: absolute;
    top: 50%;
    right: 6px;
    width: 26px;
    height: 26px;
    min-height: 0;
    padding: 0;
    border: 1px solid var(--pt-gilt-dim);
    border-radius: 50%;
    background: var(--pt-ink);
    box-shadow: none;
    color: var(--pt-gilt);
    font-size: 12px;
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
