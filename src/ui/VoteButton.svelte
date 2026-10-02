<script lang="ts">
  import { MODULE_ID, X_OFF, X_ON } from '../constants';
  import { seatOf } from '../state';
  import { vote } from '../sync';
  import { talent } from '../talentStore.svelte';

  const seat = $derived(seatOf(talent.state, game.user.id));
  const lit = $derived(seat >= 0 && talent.state.votes[seat]);
  const ready = $derived(!!talent.state.contestantId && !lit);
  const label = game.i18n.localize(`${MODULE_ID}.vote`);
</script>

{#if talent.sceneId && seat >= 0}
  <button type="button" class="x-button" class:lit disabled={!ready} aria-label={label} title={label} onclick={vote}>
    <img src={lit ? X_ON : X_OFF} alt="" />
  </button>
{/if}

<style>
  .x-button {
    position: fixed;
    left: 50%;
    bottom: 150px;
    translate: -50% 0;
    z-index: 70;
    width: 96px;
    height: 96px;
    padding: 6px;
    border: 2px solid rgb(212 175 55 / 0.7);
    border-radius: 50%;
    background: radial-gradient(circle, rgb(40 10 50 / 0.9), rgb(10 0 20 / 0.95));
    box-shadow: 0 0 18px rgb(0 0 0 / 0.6);
    pointer-events: auto;
    cursor: pointer;
    transition: transform 120ms ease, box-shadow 200ms ease;
  }

  .x-button:hover:not(:disabled) {
    transform: scale(1.06);
    box-shadow: 0 0 24px rgb(255 60 60 / 0.6);
  }

  .x-button:active:not(:disabled) {
    transform: scale(0.94);
  }

  .x-button:disabled {
    cursor: default;
  }

  .x-button:disabled:not(.lit) {
    opacity: 0.45;
  }

  .x-button.lit {
    border-color: rgb(255 60 60);
    box-shadow: 0 0 32px rgb(255 30 30 / 0.85);
    animation: pop 380ms ease-out;
  }

  img {
    width: 100%;
    height: 100%;
    border: none;
    object-fit: contain;
  }

  @keyframes pop {
    from {
      transform: scale(1.4);
    }
  }
</style>
