<script lang="ts">
  import { X_OFF, X_ON } from '../constants';
  import { t } from '../i18n';
  import { contestant, rosterGroups, thumbPath } from '../roster';
  import { assignSeat, bringOn, clearStage, resetVotes } from '../state';
  import { mutate } from '../sync';
  import { talent } from '../talentStore.svelte';
  import { DossierApp } from './DossierApp';

  const groups = rosterGroups(t('director.other'));
  const players = game.users.filter((u) => !u.isGM).map((u) => ({ id: u.id, name: u.name }));

  let groupId = $state(groups[0].id);
  let selectedId = $state<string | null>(null);

  const group = $derived(groups.find((g) => g.id === groupId) ?? groups[0]);
  const onStage = $derived(contestant(talent.state.contestantId));

  const update = (fn: Parameters<typeof mutate>[1]) => talent.sceneId && mutate(talent.sceneId, fn);

  function select(id: string) {
    selectedId = id;
    talent.dossierId = id;
  }

  function stage() {
    if (!selectedId) return;
    const id = selectedId;
    talent.dossierId = null;
    update((s) => bringOn(s, id));
    DossierApp.open();
  }

  function seat(index: number, event: Event) {
    const userId = (event.currentTarget as HTMLSelectElement).value || null;
    update((s) => assignSeat(s, index, userId));
  }
</script>

<div class="director">
  {#if !talent.sceneId}
    <p class="notice">{t('director.noStage')}</p>
  {:else}
    <section class="seats">
      <h3>{t('director.seats')}</h3>
      <div class="seat-row">
        {#each talent.state.seats as userId, i (i)}
          <label class="seat">
            <img src={talent.state.votes[i] ? X_ON : X_OFF} alt="" />
            <select value={userId ?? ''} onchange={(e) => seat(i, e)}>
              <option value="">{t('director.empty')}</option>
              {#each players as p (p.id)}
                <option value={p.id}>{p.name}</option>
              {/each}
            </select>
          </label>
        {/each}
      </div>
    </section>

    <section class="now">
      <span>{t('director.onStage')}</span>
      <strong>{onStage?.name ?? '—'}</strong>
      <div class="actions">
        <button type="button" disabled={!selectedId} onclick={stage}>
          <i class="fa-solid fa-person-walking"></i>
          {t('director.bringOn')}
        </button>
        <button type="button" disabled={!onStage} onclick={() => update(clearStage)}>
          <i class="fa-solid fa-door-closed"></i>
          {t('director.clear')}
        </button>
        <button type="button" onclick={() => update(resetVotes)}>
          <i class="fa-solid fa-rotate-left"></i>
          {t('director.reset')}
        </button>
        <button type="button" onclick={() => DossierApp.open()}>
          <i class="fa-solid fa-scroll"></i>
          {t('director.dossier')}
        </button>
      </div>
    </section>

    <nav class="factions">
      {#each groups as g (g.id)}
        <button type="button" class:active={g.id === groupId} onclick={() => (groupId = g.id)}>{g.name}</button>
      {/each}
    </nav>

    <ul class="roster">
      {#each group.members as npc (npc.id)}
        <li>
          <button
            type="button"
            class="card"
            class:selected={npc.id === selectedId}
            class:staged={npc.id === talent.state.contestantId}
            onclick={() => select(npc.id)}
            ondblclick={stage}
          >
            <img src={thumbPath(npc)} alt="" loading="lazy" />
            <span class="name">{npc.name}</span>
            <span class="role">{npc.role}</span>
            {#if npc.fate}<span class="fate">{npc.fate}</span>{/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .director {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    height: 100%;
  }

  .notice {
    font-style: italic;
  }

  h3 {
    margin: 0 0 0.25rem;
    border: none;
  }

  .seat-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }

  .seat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .seat img {
    width: 40px;
    height: 40px;
    border: none;
  }

  .now {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .now strong {
    flex: 1;
    font-size: 1.1em;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    width: 100%;
  }

  .actions button {
    flex: 1;
    white-space: nowrap;
  }

  .factions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .factions button {
    flex: 0 0 auto;
    width: auto;
    padding: 0 0.6rem;
  }

  .factions button.active {
    background: var(--color-warm-2, #6b21a8);
    color: white;
  }

  .roster {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
    overflow-y: auto;
  }

  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    width: 100%;
    height: 100%;
    padding: 0.4rem;
    line-height: 1.2;
    text-align: center;
  }

  .card img {
    height: 140px;
    border: none;
    object-fit: contain;
  }

  .card.selected {
    outline: 2px solid gold;
  }

  .card.staged {
    box-shadow: 0 0 10px rgb(255 200 60 / 0.8);
  }

  .name {
    font-weight: bold;
  }

  .role,
  .fate {
    font-size: 0.8em;
    opacity: 0.8;
  }

  .fate {
    color: #c33;
  }
</style>
