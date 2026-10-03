<script lang="ts">
  import { t } from '../i18n';
  import { actKey, factionOnStage, rosterGroups } from '../roster';
  import { bringOn, clearResults, dismiss, join, setClock, type Clock } from '../state';
  import { mutate } from '../sync';
  import { talent } from '../talentStore.svelte';
  import Cast, { type CastMember } from './Cast.svelte';
  import Council from './Council.svelte';
  import Dossier, { type Subject } from './Dossier.svelte';
  import Problems from './Problems.svelte';
  import ShowStrip from './ShowStrip.svelte';

  type Tab = 'dossier' | 'council' | 'cast' | 'problems';

  const cast: CastMember[] = rosterGroups(t('director.other')).flatMap((g) =>
    g.members.map((npc) => ({ npc, troupe: npc.faction ? g.name : t(`director.group.${npc.group}`) })),
  );
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'dossier', label: t('director.tabs.dossier') },
    { id: 'council', label: t('director.tabs.council') },
    { id: 'cast', label: t('director.tabs.cast'), count: cast.length },
    { id: 'problems', label: t('director.tabs.problems') },
  ];

  let tab = $state<Tab>(talent.state.contestantIds.length ? 'dossier' : 'council');
  // Derived apart from `preview` so only a real spotlight move resets it: every vote and clock
  // tick replaces `talent.state` wholesale.
  const spotlightId = $derived(talent.state.spotlightId);
  // A preview lasts until the spotlight moves, so a pick on the stage canvas brings the dossier along.
  let preview = $derived.by((): Subject | null => {
    void spotlightId;
    return null;
  });

  const stagedIds = $derived(talent.state.contestantIds);
  // With nothing previewed the dossier follows the stage: the spotlit contestant, else the faction
  // whose slate is out, else whoever stands first.
  const shown = $derived.by((): Subject | null => {
    if (preview) return preview;
    if (spotlightId) return { kind: 'npc', id: spotlightId };
    const faction = factionOnStage(stagedIds);
    if (faction) return { kind: 'faction', id: faction.id };
    return stagedIds[0] ? { kind: 'npc', id: stagedIds[0] } : null;
  });
  const shownId = $derived(shown?.kind === 'npc' ? shown.id : null);
  const shownFactionId = $derived(shown?.kind === 'faction' ? shown.id : null);

  function show(subject: Subject) {
    preview = subject;
    tab = 'dossier';
  }

  function stage(ids: string[]) {
    if (!talent.sceneId) return;
    preview = null;
    tab = 'dossier';
    void mutate(talent.sceneId, (s) => bringOn(s, ids, actKey(ids)));
  }

  function comeOn(id: string) {
    if (talent.sceneId) void mutate(talent.sceneId, (s) => join(s, id, actKey));
  }

  function leave(ids: string[]) {
    if (talent.sceneId) void mutate(talent.sceneId, (s) => dismiss(s, ids, actKey));
  }

  function tick(id: string, clock: Clock) {
    if (talent.sceneId) void mutate(talent.sceneId, (s) => setClock(s, id, clock));
  }

  async function clearVerdicts() {
    const sure = await foundry.applications.api.DialogV2.confirm({
      window: { title: t('council.clear') },
      content: `<p>${t('council.clearConfirm')}</p>`,
    });
    if (sure === true && talent.sceneId) void mutate(talent.sceneId, clearResults);
  }
</script>

<div class="director">
  {#if !talent.sceneId}
    <p class="notice">{t('director.noStage')}</p>
  {:else}
    <ShowStrip onshow={(id) => show({ kind: 'npc', id })} />

    <div class="tabs" role="tablist">
      {#each tabs as { id, label, count } (id)}
        <button type="button" role="tab" class="tab" class:current={tab === id} aria-selected={tab === id} onclick={() => (tab = id)}>
          {label}
          {#if count}<small>{count}</small>{/if}
        </button>
      {/each}
    </div>

    <div class="panel" role="tabpanel" data-tab="dossier" hidden={tab !== 'dossier'}>
      <Dossier
        subject={shown}
        {stagedIds}
        clocks={talent.state.clocks}
        onshow={(id) => show({ kind: 'npc', id })}
        onstage={stage}
        ondismiss={leave}
        onbrowse={() => (tab = 'council')}
        onclock={tick}
      />
    </div>
    <div class="panel" role="tabpanel" data-tab="council" hidden={tab !== 'council'}>
      <Council
        {stagedIds}
        {shownFactionId}
        results={talent.state.results}
        onpreview={(id) => show({ kind: 'faction', id })}
        onstage={stage}
        onclear={clearVerdicts}
      />
    </div>
    <div class="panel" role="tabpanel" data-tab="cast" hidden={tab !== 'cast'}>
      <Cast members={cast} {stagedIds} {shownId} onpreview={(id) => show({ kind: 'npc', id })} onstage={stage} onjoin={comeOn} />
    </div>
    <div class="panel" role="tabpanel" data-tab="problems" hidden={tab !== 'problems'}>
      <Problems />
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
    padding: 0 16px;
    border-bottom: 1px solid var(--pt-ink-line);
    background: var(--pt-ink-raised);
  }

  .tab {
    flex: none;
    gap: 8px;
    width: auto;
    height: 44px;
    margin-bottom: -1px;
    padding: 2px 14px 0;
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    background: none;
    box-shadow: none;
    color: var(--pt-muted);
    font-family: var(--pt-display);
    font-size: 19px;
    font-weight: 600;
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
    padding: 1px 7px;
    border: 1px solid currentcolor;
    border-radius: 10px;
    font-family: var(--font-sans);
    font-size: 12px;
    font-weight: 400;
    opacity: 0.7;
  }

  .panel:not([hidden]) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }
</style>
