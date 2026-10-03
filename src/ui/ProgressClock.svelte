<script lang="ts">
  import { t, tf } from '../i18n';
  import { MAX_CLOCK, type Clock } from '../state';

  interface Props {
    clock: Clock;
    onchange: (clock: Clock) => void;
  }

  let { clock, onchange }: Props = $props();

  const R = 46;
  const at = (a: number) => `${(R * Math.sin(a)).toFixed(3)} ${(-R * Math.cos(a)).toFixed(3)}`;

  // A one-segment clock is a whole disc; an arc from 12 o'clock back to 12 o'clock draws nothing.
  const wedges = $derived(
    clock.size === 1
      ? [`M0 ${-R}A${R} ${R} 0 1 1 0 ${R}A${R} ${R} 0 1 1 0 ${-R}Z`]
      : Array.from({ length: clock.size }, (_, i) => {
          const step = (2 * Math.PI) / clock.size;
          return `M0 0L${at(i * step)}A${R} ${R} 0 0 1 ${at((i + 1) * step)}Z`;
        }),
  );

  const set = (progress: number) => {
    if (progress >= 0 && progress <= clock.size && progress !== clock.progress) onchange({ ...clock, progress });
  };
  const resize = (size: number) => onchange({ ...clock, size });

  // Clicking the last filled segment empties it, so one click undoes a mis-tick.
  function pick(e: MouseEvent) {
    const i = (e.target as Element).getAttribute('data-wedge');
    if (i !== null) set(clock.progress === Number(i) + 1 ? Number(i) : Number(i) + 1);
  }

  function key(e: KeyboardEvent) {
    const next = { ArrowRight: clock.progress + 1, ArrowUp: clock.progress + 1, ArrowLeft: clock.progress - 1, ArrowDown: clock.progress - 1, Home: 0, End: clock.size }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    set(next);
  }
</script>

<div class="clock">
  <div class="dial">
    <svg
      viewBox="-50 -50 100 100"
      role="slider"
      tabindex="0"
      aria-label={t('dossier.clockLabel')}
      aria-valuemin={0}
      aria-valuemax={clock.size}
      aria-valuenow={clock.progress}
      aria-valuetext={tf('dossier.clock', { progress: String(clock.progress), size: String(clock.size) })}
      class:full={clock.progress === clock.size}
      onclick={pick}
      onkeydown={key}
    >
      {#each wedges as d, i (i)}
        <path {d} data-wedge={i} class:filled={i < clock.progress} />
      {/each}
      <circle class="rim" r={R} />
      <circle class="hub" r="3.5" />
    </svg>

    <div class="turn">
      <button type="button" class="tick major" aria-label={t('dossier.clockForward')} disabled={clock.progress === clock.size} onclick={() => set(clock.progress + 1)}>
        <i class="fa-solid fa-plus"></i>
      </button>
      <span class="count" aria-hidden="true">
        <b>{clock.progress}</b>
        {tf('dossier.clockOf', { size: String(clock.size) })}
      </span>
      <button type="button" class="tick major" aria-label={t('dossier.clockBack')} disabled={clock.progress === 0} onclick={() => set(clock.progress - 1)}>
        <i class="fa-solid fa-minus"></i>
      </button>
    </div>
  </div>

  <div class="size">
    <button type="button" class="tick" aria-label={t('dossier.fewerSegments')} disabled={clock.size === 1} onclick={() => resize(clock.size - 1)}>
      <i class="fa-solid fa-minus"></i>
    </button>
    {tf('dossier.segments', { n: String(clock.size) })}
    <button type="button" class="tick" aria-label={t('dossier.moreSegments')} disabled={clock.size === MAX_CLOCK} onclick={() => resize(clock.size + 1)}>
      <i class="fa-solid fa-plus"></i>
    </button>
  </div>
</div>

<style>
  .clock {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    width: 100%;
  }

  /* Equal outer columns keep the dial on the page's centre line with the turn controls hung off its right. */
  .dial {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 26px;
    width: 100%;
  }

  svg {
    grid-column: 2;
    width: 190px;
    height: 190px;
    overflow: visible;
    border-radius: 50%;
    background: radial-gradient(circle, rgb(220 180 99 / 0.1), transparent 70%);
    cursor: pointer;
    transition: filter 200ms ease;
  }

  svg:focus-visible {
    outline: 2px solid var(--pt-gilt);
    outline-offset: 6px;
  }

  svg.full {
    filter: drop-shadow(0 0 12px rgb(220 180 99 / 0.55));
  }

  path {
    fill: rgb(220 180 99 / 0.05);
    stroke: var(--pt-gilt-dim);
    stroke-width: 1.2;
    stroke-linejoin: round;
    transition: fill 160ms ease;
  }

  path:hover {
    fill: rgb(220 180 99 / 0.3);
  }

  path.filled {
    fill: var(--pt-gilt);
    stroke: var(--pt-ink);
  }

  path.filled:hover {
    fill: #ecc97e;
  }

  circle {
    pointer-events: none;
  }

  .rim {
    fill: none;
    stroke: var(--pt-gilt);
    stroke-width: 3;
  }

  .hub {
    fill: var(--pt-ink);
    stroke: var(--pt-gilt);
    stroke-width: 1.5;
  }

  .turn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-self: start;
    gap: 10px;
  }

  .count {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--pt-muted);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.2;
  }

  .count b {
    color: var(--pt-gilt);
    font-family: var(--pt-display);
    font-size: 36px;
    font-weight: 600;
    line-height: 1;
  }

  .size {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--pt-muted);
    font-family: var(--font-sans);
    font-size: 13px;
  }

  .tick {
    flex: none;
    width: 22px;
    height: 22px;
    min-height: 0;
    padding: 0;
    border: 1px solid var(--pt-gilt-dim);
    border-radius: 50%;
    background: none;
    box-shadow: none;
    color: var(--pt-gilt);
    font-size: 10px;
    transition: background 140ms ease, color 140ms ease, opacity 140ms ease;
  }

  .tick.major {
    width: 32px;
    height: 32px;
    border-color: var(--pt-gilt);
    font-size: 13px;
  }

  .tick:hover:not(:disabled) {
    background: var(--pt-gilt);
    color: var(--pt-ink);
  }

  .tick:disabled {
    opacity: 0.35;
    cursor: default;
  }
</style>
