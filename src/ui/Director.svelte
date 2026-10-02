<script lang="ts">
  import { t } from '../i18n';
  import { rosterGroups } from '../roster';
  import { bringOn } from '../state';
  import { mutate } from '../sync';
  import { talent } from '../talentStore.svelte';
  import Cast from './Cast.svelte';
  import Dossier from './Dossier.svelte';
  import ShowStrip from './ShowStrip.svelte';

  type Tab = 'dossier' | 'cast';

  const groups = rosterGroups(t('director.other'));
  const castSize = groups.reduce((n, g) => n + g.members.length, 0);

  let tab = $state<Tab>(talent.state.contestantId ? 'dossier' : 'cast');
  let previewId = $state<string | null>(null);

  const stagedId = $derived(talent.state.contestantId);
  const shownId = $derived(previewId ?? stagedId);

  function preview(id: string) {
    previewId = id === stagedId ? null : id;
    tab = 'dossier';
  }

  function showStaged() {
    previewId = null;
    tab = 'dossier';
  }

  function stage(id: string) {
    if (!talent.sceneId) return;
    showStaged();
    void mutate(talent.sceneId, (s) => bringOn(s, id));
  }
</script>

<div class="director">
  {#if !talent.sceneId}
    <p class="notice">{t('director.noStage')}</p>
  {:else}
    <ShowStrip onshow={showStaged} />

    <div class="tabs" role="tablist">
      <button type="button" role="tab" class="tab" class:current={tab === 'dossier'} aria-selected={tab === 'dossier'} onclick={() => (tab = 'dossier')}>
        {t('director.tabs.dossier')}
      </button>
      <button type="button" role="tab" class="tab" class:current={tab === 'cast'} aria-selected={tab === 'cast'} onclick={() => (tab = 'cast')}>
        {t('director.tabs.cast')}
        <small>{castSize}</small>
      </button>
    </div>

    <div class="panel" role="tabpanel" hidden={tab !== 'dossier'}>
      <Dossier id={shownId} {stagedId} onstage={stage} onbrowse={() => (tab = 'cast')} />
    </div>
    <div class="panel" role="tabpanel" hidden={tab !== 'cast'}>
      <Cast {groups} {stagedId} {shownId} onpreview={preview} onstage={stage} />
    </div>
  {/if}
</div>

<style>
  .director {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    background: radial-gradient(120% 60% at 50% 0%, rgb(84 16 31 / 0.25), transparent 70%), var(--pt-ink);
  }

  .notice {
    margin: 0;
    padding: 1.25rem;
    color: var(--pt-muted);
    font-style: italic;
  }

  .tabs {
    display: flex;
    flex: none;
    gap: 4px;
    padding: 0 14px;
    border-bottom: 1px solid var(--pt-ink-line);
    background: var(--pt-ink-raised);
  }

  .tab {
    flex: none;
    gap: 8px;
    width: auto;
    height: 40px;
    margin-bottom: -1px;
    padding: 4px 14px 0;
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    background: none;
    box-shadow: none;
    color: var(--pt-muted);
    font-family: var(--pt-display);
    font-size: 21px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: color 150ms ease, border-color 150ms ease;
  }

  .tab:hover {
    color: var(--pt-paper);
  }

  .tab.current {
    border-bottom-color: var(--pt-gilt);
    color: var(--pt-gilt);
  }

  .tab small {
    padding: 1px 6px;
    border: 1px solid currentcolor;
    border-radius: 9px;
    font-family: var(--font-sans);
    font-size: 11px;
    letter-spacing: 0;
    opacity: 0.7;
  }

  .panel:not([hidden]) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }
</style>
