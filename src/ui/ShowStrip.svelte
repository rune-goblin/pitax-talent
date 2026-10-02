<script lang="ts">
  import { X_OFF, X_ON } from '../constants';
  import { t, tf } from '../i18n';
  import { contestant, thumbPath } from '../roster';
  import { allVotesIn, assignSeat, castVote, clearStage, resetVotes, retractVote, type TalentState } from '../state';
  import { mutate } from '../sync';
  import { talent } from '../talentStore.svelte';

  let { onshow }: { onshow: () => void } = $props();

  const players = game.users.filter((u) => !u.isGM).map((u) => ({ id: u.id, name: u.name }));

  let seating = $state(talent.state.seats.every((id) => !id));

  const onStage = $derived(contestant(talent.state.contestantId));
  const out = $derived(allVotesIn(talent.state));
  const judges = $derived(
    talent.state.seats.map((id, i) => players.find((p) => p.id === id)?.name ?? tf('director.judge', { n: String(i + 1) })),
  );

  const update = (fn: (state: TalentState) => TalentState) => talent.sceneId && mutate(talent.sceneId, fn);

  function seat(index: number, event: Event) {
    const userId = (event.currentTarget as HTMLSelectElement).value || null;
    update((s) => assignSeat(s, index, userId));
  }
</script>

<header class="strip" class:out class:seating>
  <div class="now">
    {#if onStage}
      <button type="button" class="who" aria-label={tf('director.showDossier', { name: onStage.name })} data-tooltip={tf('director.showDossier', { name: onStage.name })} onclick={onshow}>
        <img src={thumbPath(onStage)} alt="" />
        <span class="lines">
          <span class="eyebrow">{out ? t('director.out') : t('director.onStage')}</span>
          <span class="name">{onStage.name}</span>
        </span>
      </button>
      <button type="button" class="tool" aria-label={t('director.clear')} data-tooltip={t('director.clear')} onclick={() => update(clearStage)}>
        <i class="fa-solid fa-door-open"></i>
      </button>
    {:else}
      <span class="lines">
        <span class="eyebrow">{t('director.onStage')}</span>
        <span class="name vacant">{t('director.stageEmpty')}</span>
      </span>
    {/if}
  </div>

  <div class="desk">
    {#each talent.state.seats as userId, i (i)}
      {@const lit = talent.state.votes[i]}
      <div class="seat" class:lit>
        <div class="x">
          <button
            type="button"
            class="light"
            disabled={lit || !onStage}
            aria-label={tf('director.light', { judge: judges[i] })}
            data-tooltip={tf('director.light', { judge: judges[i] })}
            onclick={() => update((s) => castVote(s, i))}
          >
            <img src={lit ? X_ON : X_OFF} alt="" />
          </button>
          {#if lit}
            <button
              type="button"
              class="undo"
              aria-label={tf('director.undo', { judge: judges[i] })}
              data-tooltip={tf('director.undo', { judge: judges[i] })}
              onclick={() => update((s) => retractVote(s, i))}
            >
              <i class="fa-solid fa-arrow-rotate-left"></i>
            </button>
          {/if}
        </div>
        {#if seating}
          <select value={userId ?? ''} aria-label={tf('director.judge', { n: String(i + 1) })} onchange={(e) => seat(i, e)}>
            <option value="">{t('director.empty')}</option>
            {#each players as p (p.id)}
              <option value={p.id}>{p.name}</option>
            {/each}
          </select>
        {:else}
          <span class="judge" class:unseated={!userId}>{judges[i]}</span>
        {/if}
      </div>
    {/each}

    <div class="tools">
      <button
        type="button"
        class="tool"
        disabled={!talent.state.votes.some(Boolean)}
        aria-label={t('director.reset')}
        data-tooltip={t('director.reset')}
        onclick={() => update(resetVotes)}
      >
        <i class="fa-solid fa-rotate"></i>
      </button>
      <button
        type="button"
        class="tool"
        class:pressed={seating}
        aria-pressed={seating}
        aria-label={t('director.seats')}
        data-tooltip={t('director.seats')}
        onclick={() => (seating = !seating)}
      >
        <i class="fa-solid fa-chair"></i>
      </button>
    </div>
  </div>
</header>

<style>
  .strip {
    position: relative;
    display: flex;
    flex: none;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px 18px;
    padding: 12px 14px 21px;
    background:
      repeating-linear-gradient(
        90deg,
        rgb(0 0 0 / 0.3) 0 3px,
        transparent 3px 27px,
        rgb(255 255 255 / 0.045) 27px 30px,
        transparent 30px 46px
      ),
      linear-gradient(180deg, var(--pt-velvet), var(--pt-velvet-deep));
    box-shadow: inset 0 -16px 18px -10px rgb(0 0 0 / 0.75);
  }

  /* Marquee bulbs along the valance; they turn ruby once every judge has buzzed. */
  .strip::after {
    position: absolute;
    inset: auto 0 0;
    height: 9px;
    border-top: 1px solid var(--pt-gilt-dim);
    background:
      radial-gradient(circle, #fff1c4 0 1.4px, rgb(255 196 84 / 0.4) 2px 3.4px, transparent 4px) 0 50% / 14px 9px repeat-x,
      #1a0a12;
    content: '';
  }

  .strip.out::after {
    background:
      radial-gradient(circle, #ffd0d0 0 1.4px, rgb(255 40 60 / 0.55) 2px 3.4px, transparent 4px) 0 50% / 14px 9px repeat-x,
      #1a0a12;
    animation: flicker 900ms steps(2, jump-none) 3;
  }

  .now {
    display: flex;
    flex: 1 1 180px;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .who {
    flex: 0 1 auto;
    justify-content: flex-start;
    gap: 10px;
    width: auto;
    min-width: 0;
    height: auto;
    padding: 0;
    border: none;
    background: none;
    box-shadow: none;
    color: inherit;
    text-align: left;
  }

  .who img {
    flex: none;
    width: 46px;
    height: 60px;
    border: none;
    object-fit: contain;
    filter: drop-shadow(0 3px 5px rgb(0 0 0 / 0.6));
    transition: transform 160ms ease;
  }

  .who:hover img {
    transform: translateY(-2px) scale(1.05);
  }

  .lines {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .eyebrow {
    color: var(--pt-gilt);
    font-family: var(--font-sans);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .out .eyebrow {
    color: var(--pt-ruby-soft);
  }

  .name {
    overflow: hidden;
    color: var(--pt-paper);
    font-family: var(--pt-display);
    font-size: 27px;
    line-height: 1;
    text-overflow: ellipsis;
    text-shadow: 0 2px 6px rgb(0 0 0 / 0.7);
    white-space: nowrap;
  }

  .name.vacant {
    color: var(--pt-muted);
  }

  .out .name:not(.vacant) {
    text-decoration: line-through;
    text-decoration-color: var(--pt-ruby);
    text-decoration-thickness: 2px;
  }

  .desk {
    display: flex;
    flex: 0 0 auto;
    align-items: flex-start;
    gap: 6px;
  }

  .seating .desk {
    flex: 1 0 100%;
  }

  .seat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    width: 64px;
  }

  .seating .seat {
    flex: 1;
    width: auto;
    min-width: 0;
  }

  .x {
    position: relative;
    width: 46px;
    height: 46px;
  }

  .light {
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    background: none;
    box-shadow: none;
    transition: transform 140ms ease;
  }

  .light img {
    width: 100%;
    height: 100%;
    border: none;
    object-fit: contain;
    opacity: 0.85;
    transition: opacity 140ms ease, filter 140ms ease;
  }

  .light:hover:not(:disabled) {
    transform: scale(1.1) rotate(-4deg);
  }

  .light:hover:not(:disabled) img {
    opacity: 1;
    filter: drop-shadow(0 0 6px rgb(255 60 80 / 0.75));
  }

  .light:active:not(:disabled) {
    transform: scale(0.92);
  }

  .light:disabled img {
    opacity: 0.35;
  }

  .lit .light:disabled img {
    opacity: 1;
    filter: drop-shadow(0 0 7px rgb(255 40 60 / 0.95));
    animation: stamp 320ms cubic-bezier(0.2, 1.4, 0.4, 1);
  }

  .undo {
    position: absolute;
    top: -5px;
    right: -9px;
    width: 22px;
    height: 22px;
    min-height: 0;
    padding: 0;
    border: 1px solid var(--pt-gilt);
    border-radius: 50%;
    background: var(--pt-ink);
    box-shadow: 0 2px 6px rgb(0 0 0 / 0.6);
    color: var(--pt-gilt);
    font-size: 10px;
    animation: stamp 260ms 120ms backwards cubic-bezier(0.2, 1.4, 0.4, 1);
    transition: background 140ms ease, color 140ms ease;
  }

  .undo:hover {
    background: var(--pt-gilt);
    color: var(--pt-ink);
  }

  .judge {
    overflow: hidden;
    max-width: 100%;
    color: var(--pt-paper);
    font-size: 11.5px;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .judge.unseated {
    color: var(--pt-muted);
    font-style: italic;
  }

  .seat select {
    width: 100%;
    height: 24px;
    padding: 0 4px;
    font-size: 12px;
  }

  .tools {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-left: 4px;
  }

  .tool {
    flex: none;
    width: 26px;
    height: 26px;
    min-height: 0;
    padding: 0;
    border: 1px solid rgb(220 180 99 / 0.4);
    border-radius: 4px;
    background: rgb(0 0 0 / 0.35);
    box-shadow: none;
    color: var(--pt-gilt);
    font-size: 12px;
    transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
  }

  .tool:hover:not(:disabled),
  .tool.pressed {
    border-color: var(--pt-gilt);
    background: var(--pt-gilt);
    color: var(--pt-ink);
  }

  .tool:disabled {
    opacity: 0.35;
  }

  @keyframes stamp {
    from {
      transform: scale(1.6);
      opacity: 0;
    }
  }

  @keyframes flicker {
    50% {
      opacity: 0.35;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .strip.out::after,
    .lit .light:disabled img,
    .undo {
      animation: none;
    }
  }
</style>
