<script lang="ts">
  import { backOut } from 'svelte/easing';
  import { fade, scale } from 'svelte/transition';
  import { t, tf } from '../i18n';
  import { actName, contestant, outcome, portraitPath, REGENT_ID } from '../roster';
  import { awaitingRegent, verdict } from '../state';
  import { talent } from '../talentStore.svelte';

  // Springs up just after the deciding vote pops on the stage.
  const POP = { delay: 420, duration: 650, start: 0, easing: backOut };
  const FADE = { duration: 400 };

  const regent = contestant(REGENT_ID);
  const closeLabel = t('notice.close');
  const decided = $derived(verdict(talent.state));
  const said = $derived(decided && outcome(decided, talent.state.contestantIds));
  const deciding = $derived(awaitingRegent(talent.state));
  // Each client closes its own copy; the next tie-break or verdict reruns this and reopens it.
  let closed = $derived(!said && !deciding);
</script>

{#snippet close()}
  <button type="button" class="close" aria-label={closeLabel} title={closeLabel} onclick={() => (closed = true)}>
    <i class="fa-solid fa-xmark"></i>
  </button>
{/snippet}

{#if talent.sceneId}
  {#if said && !closed}
    <div class="notice {said}" role="status" in:scale={POP} out:fade={FADE}>
      {tf(`verdict.${said}`, { name: actName(talent.state.contestantIds) })}
      {@render close()}
    </div>
  {:else if regent && deciding && !closed}
    <div class="notice regent" role="status" in:scale={POP} out:fade={FADE}>
      <span class="face"><img src={portraitPath(regent)} alt="" /></span>
      {tf('regent.decides', { name: regent.name })}
      {@render close()}
    </div>
  {/if}
{/if}

<style>
  .notice {
    position: fixed;
    bottom: calc(var(--pt-vote-bottom) + var(--pt-vote-size) / 2);
    left: 50%;
    translate: -50% 50%;
    z-index: 71;
    display: flex;
    align-items: center;
    gap: 18px;
    width: max-content;
    max-width: min(80vw, 900px);
    padding: 18px 44px;
    border: 3px solid var(--pt-gilt);
    border-radius: 18px;
    background: rgb(26 10 18 / 0.92);
    box-shadow: 0 14px 40px rgb(0 0 0 / 0.6);
    color: #f3d27a;
    font-family: var(--pt-display);
    font-size: 44px;
    font-weight: 600;
    line-height: 1.15;
    text-align: center;
    text-shadow: 0 2px 6px rgb(0 0 0 / 0.8);
    text-wrap: balance;
    pointer-events: auto;
  }

  .notice.rejected {
    border-color: var(--pt-ruby);
    color: #fff;
  }

  .notice.regent {
    padding: 12px 36px 12px 14px;
    font-size: 36px;
  }

  .close {
    position: absolute;
    top: -14px;
    right: -14px;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    min-height: 0;
    margin: 0;
    padding: 0;
    border: 2px solid var(--pt-gilt);
    border-radius: 50%;
    background: var(--pt-ink);
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.6);
    color: var(--pt-gilt);
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
  }

  .close:hover {
    background: var(--pt-velvet);
    color: #fff;
  }

  .rejected .close {
    border-color: var(--pt-ruby);
  }

  /* Crops Valerie's full-length portrait to her head, as her token on the stage does. */
  .face {
    position: relative;
    flex: none;
    width: 76px;
    height: 76px;
    overflow: hidden;
    border: 3px solid var(--pt-gilt);
    border-radius: 50%;
    background: var(--pt-ink);
  }

  .face img {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 196%;
    max-width: none;
    border: none;
    translate: -62% -19%;
  }
</style>
