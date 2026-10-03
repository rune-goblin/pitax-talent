<script lang="ts">
  import { CHECK, CHECK_OFF, X_OFF, X_ON } from '../constants';
  import { t } from '../i18n';
  import { seatOf } from '../state';
  import { sendVote } from '../sync';
  import { talent } from '../talentStore.svelte';

  const seat = $derived(seatOf(talent.state, game.user.id));
  const cast = $derived(seat >= 0 ? talent.state.votes[seat] : null);
  const ready = $derived(talent.state.contestantIds.length > 0 && !cast);
  const xLabel = t('vote.x');
  const checkLabel = t('vote.check');
</script>

{#if talent.sceneId && seat >= 0}
  <div class="vote-row">
    <button
      type="button"
      class="x-button"
      class:lit={cast === 'x'}
      disabled={!ready}
      aria-label={xLabel}
      title={xLabel}
      onclick={() => sendVote('x')}
    >
      <img src={cast === 'x' ? X_ON : X_OFF} alt="" />
    </button>
    <button
      type="button"
      class="check-button"
      class:lit={cast === 'check'}
      disabled={!ready}
      aria-label={checkLabel}
      title={checkLabel}
      onclick={() => sendVote('check')}
    >
      <img src={cast === 'check' ? CHECK : CHECK_OFF} alt="" />
    </button>
  </div>
{/if}

<style>
  .vote-row {
    position: fixed;
    left: 50%;
    bottom: var(--pt-vote-bottom);
    translate: -50% 0;
    z-index: 70;
    display: flex;
    gap: 20px;
    pointer-events: none;
  }

  button {
    width: var(--pt-vote-size);
    height: var(--pt-vote-size);
    padding: 6px;
    border: 2px solid rgb(212 175 55 / 0.7);
    border-radius: 50%;
    background: radial-gradient(circle, rgb(40 10 50 / 0.9), rgb(10 0 20 / 0.95));
    box-shadow: 0 0 18px rgb(0 0 0 / 0.6);
    pointer-events: auto;
    cursor: pointer;
    transition: transform 120ms ease, box-shadow 200ms ease;
  }

  button:hover:not(:disabled) {
    transform: scale(1.06);
  }

  .x-button:hover:not(:disabled) {
    box-shadow: 0 0 24px rgb(255 60 60 / 0.6);
  }

  .check-button:hover:not(:disabled) {
    box-shadow: 0 0 24px rgb(60 220 130 / 0.6);
  }

  button:active:not(:disabled) {
    transform: scale(0.94);
  }

  button:disabled {
    cursor: default;
  }

  button:disabled:not(.lit) {
    opacity: 0.45;
  }

  .x-button.lit {
    border-color: rgb(255 60 60);
    box-shadow: 0 0 32px rgb(255 30 30 / 0.85);
    animation: pop 380ms ease-out;
  }

  .check-button.lit {
    border-color: rgb(70 230 140);
    box-shadow: 0 0 32px rgb(40 220 110 / 0.85);
    animation: bounce 600ms ease-out;
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

  @keyframes bounce {
    0% {
      transform: scale(0.5);
    }
    40% {
      transform: scale(1.15);
    }
    70% {
      transform: scale(0.96);
    }
    100% {
      transform: scale(1);
    }
  }
</style>
