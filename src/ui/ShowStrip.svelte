<script lang="ts">
  import { CHECK, X_OFF, X_ON } from '../constants';
  import { t, tf } from '../i18n';
  import { contestant, REGENT_ID, thumbPath } from '../roster';
  import { assignSeat, awaitingRegent, castVote, clearStage, resetVotes, retractVote, spotlight, verdict, type TalentState } from '../state';
  import { mutate } from '../sync';
  import { talent } from '../talentStore.svelte';

  let { onshow }: { onshow: (id: string) => void } = $props();

  const players = game.users.filter((u) => !u.isGM).map((u) => ({ id: u.id, name: u.name }));

  let seating = $state(talent.state.seats.every((id) => !id));

  const onStage = $derived(talent.state.contestantIds.map(contestant).filter((npc) => !!npc));
  const spotlightId = $derived(talent.state.spotlightId);
  const decided = $derived(verdict(talent.state));
  const out = $derived(decided === 'rejected');
  const eyebrow = $derived(
    decided
      ? t(`director.${decided}`)
      : awaitingRegent(talent.state)
        ? tf('regent.decides', { name: contestant(REGENT_ID)?.name ?? REGENT_ID })
        : t('director.onStage'),
  );
  const judges = $derived(
    talent.state.seats.map((id, i) => players.find((p) => p.id === id)?.name ?? tf('director.judge', { n: String(i + 1) })),
  );

  const update = (fn: (state: TalentState) => TalentState) => talent.sceneId && mutate(talent.sceneId, fn);

  // One contestant: open their dossier. A slate: the click also throws the spotlight on that one.
  function pick(id: string) {
    onshow(id);
    if (onStage.length > 1) update((s) => spotlight(s, id));
  }

  function seat(index: number, event: Event) {
    const userId = (event.currentTarget as HTMLSelectElement).value || null;
    update((s) => assignSeat(s, index, userId));
  }
</script>

<header class="strip" class:out class:seating>
  <div class="now">
    {#if onStage.length}
      <span class="lines">
        <span class="eyebrow">{eyebrow}</span>
        <span class="slate" class:many={onStage.length > 1}>
          {#each onStage as npc (npc.id)}
            <button
              type="button"
              class="who"
              class:aside={!!spotlightId && spotlightId !== npc.id}
              aria-pressed={spotlightId === npc.id}
              aria-label={tf('director.showDossier', { name: npc.name })}
              data-tooltip={tf('director.showDossier', { name: npc.name })}
              onclick={() => pick(npc.id)}
            >
              <img src={thumbPath(npc)} alt="" />
              <span class="name">{npc.name}</span>
            </button>
          {/each}
        </span>
      </span>
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
      {@const vote = talent.state.votes[i]}
      <div class="seat" class:lit={vote === 'x'} class:passed={vote === 'check'}>
        <div class="x">
          <button
            type="button"
            class="light"
            disabled={!!vote || !onStage.length}
            aria-label={tf('director.light', { judge: judges[i] })}
            data-tooltip={tf('director.light', { judge: judges[i] })}
            onclick={() => update((s) => castVote(s, i, 'x'))}
          >
            <img src={vote === 'check' ? CHECK : vote === 'x' ? X_ON : X_OFF} alt="" />
          </button>
          {#if vote}
            <button
              type="button"
              class="badge undo"
              aria-label={tf('director.undo', { judge: judges[i] })}
              data-tooltip={tf('director.undo', { judge: judges[i] })}
              onclick={() => update((s) => retractVote(s, i))}
            >
              <i class="fa-solid fa-arrow-rotate-left"></i>
            </button>
          {:else if onStage.length}
            <button
              type="button"
              class="badge approve"
              aria-label={tf('director.approve', { judge: judges[i] })}
              data-tooltip={tf('director.approve', { judge: judges[i] })}
              onclick={() => update((s) => castVote(s, i, 'check'))}
            >
              <i class="fa-solid fa-check"></i>
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

  .slate {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
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
    transition: opacity 200ms ease;
  }

  /* A slate's names share the block, so each chip shrinks and its name may wrap. */
  .many .who img {
    width: 38px;
    height: 50px;
  }

  .many .name {
    font-size: 18px;
    line-height: 1.1;
    white-space: normal;
  }

  .who.aside {
    opacity: 0.5;
  }

  .who img {
    flex: none;
    width: 50px;
    height: 66px;
    border: none;
    object-fit: contain;
    filter: drop-shadow(0 3px 5px rgb(0 0 0 / 0.6));
    transition: transform 160ms ease;
  }

  .who.aside img {
    transform: scale(0.75);
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
    font-size: 13px;
    font-weight: 600;
  }

  .out .eyebrow {
    color: var(--pt-ruby-soft);
  }

  .name {
    overflow: hidden;
    color: var(--pt-paper);
    font-family: var(--pt-display);
    font-size: 24px;
    font-weight: 600;
    line-height: 1.15;
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
    width: 72px;
  }

  .seating .seat {
    flex: 1;
    width: auto;
    min-width: 0;
  }

  .x {
    position: relative;
    width: 50px;
    height: 50px;
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

  .passed .light:disabled img {
    opacity: 1;
    filter: drop-shadow(0 0 7px rgb(40 220 110 / 0.9));
    animation: sprout 480ms cubic-bezier(0.3, 1.9, 0.5, 1);
  }

  .badge {
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

  .approve {
    border-color: var(--pt-emerald);
    color: var(--pt-emerald);
  }

  .approve:hover {
    background: var(--pt-emerald);
    color: var(--pt-ink);
  }

  .judge {
    overflow: hidden;
    max-width: 100%;
    color: var(--pt-paper);
    font-family: var(--font-sans);
    font-size: 13px;
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
    height: 26px;
    padding: 0 4px;
    font-size: 13px;
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

  @keyframes sprout {
    from {
      transform: scale(0);
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
    .passed .light:disabled img,
    .badge {
      animation: none;
    }
  }
</style>
