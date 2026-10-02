<script lang="ts">
  import { t } from '../i18n';
  import { dossier, thumbPath } from '../roster';
  import { talent } from '../talentStore.svelte';

  const d = $derived(dossier(talent.dossierId ?? talent.state.contestantId ?? ''));
  const onStage = $derived(!!d && d.npc.id === talent.state.contestantId);
</script>

{#snippet list(label: string, items: string[] | undefined)}
  {#if items?.length}
    <h4>{label}</h4>
    <ul>
      {#each items as item, i (i)}<li>{item}</li>{/each}
    </ul>
  {/if}
{/snippet}

<article class="dossier">
  {#if !d}
    <p class="empty">{t('dossier.empty')}</p>
  {:else}
    <header>
      <img src={thumbPath(d.npc)} alt="" />
      <div>
        <h2>{d.npc.name}</h2>
        {#if d.npc.stats}<p class="stats">{d.npc.stats}</p>{/if}
        <p>{d.npc.role}</p>
        {#if d.npc.fate}<p class="fate">{d.npc.fate}</p>{/if}
        <p class="status">{onStage ? t('dossier.onStage') : t('dossier.preview')}</p>
      </div>
    </header>

    {#if d.faction}
      <section>
        <h3>{d.faction.name}</h3>
        <p class="meta">{d.faction.type} · {d.faction.colors} · {d.faction.symbol} · {d.faction.clothing}</p>
        <p>{d.faction.summary}</p>
      </section>
    {/if}

    {#if d.bio || d.background}
      <section>
        <h3>{t('dossier.bio')}</h3>
        {#if d.bio}<p>{d.bio}</p>{/if}
        {#if d.background}<p>{d.background}</p>{/if}
      </section>
    {/if}

    {#if d.case}
      <section>
        <h3>{t('dossier.case')}</h3>
        <blockquote>{d.case.pitch}</blockquote>
        {@render list(t('dossier.offers'), d.case.offers)}
        {@render list(t('dossier.asks'), d.case.asks)}
        {@render list(t('dossier.hides'), d.case.hides)}
        {@render list(t('dossier.probes'), d.case.probes)}
      </section>
    {/if}

    {#if d.agenda}
      <section>
        <h3>{t('dossier.agenda')}</h3>
        {#if d.agenda.goal}
          <p>
            <strong>{d.agenda.goal}</strong>
            {#if d.agenda.clock}<span class="clock">{d.agenda.progress ?? 0}/{d.agenda.clock}</span>{/if}
          </p>
        {/if}
        {@render list(t('dossier.allies'), d.agenda.allies)}
        {@render list(t('dossier.enemies'), d.agenda.enemies)}
        {@render list(t('dossier.assets'), d.agenda.assets)}
        {@render list(t('dossier.vulnerabilities'), d.agenda.vulnerabilities)}
      </section>
    {/if}

    {#if d.consequences}
      <section>
        <h3>{t('dossier.consequences')}</h3>
        <p><em>{d.consequences.motive}</em></p>
        {@render list(t('dossier.seated'), d.consequences.seated)}
        {@render list(t('dossier.refused'), d.consequences.refused)}
        {@render list(t('dossier.conflicts'), d.consequences.conflicts)}
      </section>
    {/if}
  {/if}
</article>

<style>
  .dossier {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    height: 100%;
    overflow-y: auto;
    padding-right: 0.25rem;
  }

  header {
    display: flex;
    gap: 0.75rem;
  }

  header img {
    height: 160px;
    border: none;
    object-fit: contain;
  }

  h2 {
    margin: 0;
    border: none;
  }

  h3 {
    margin: 0 0 0.25rem;
  }

  h4 {
    margin: 0.5rem 0 0.1rem;
    font-size: 0.95em;
  }

  p {
    margin: 0.2rem 0;
  }

  ul {
    margin: 0;
    padding-left: 1.2rem;
  }

  .stats,
  .meta {
    font-size: 0.9em;
    opacity: 0.8;
  }

  .fate {
    color: #c33;
  }

  .status {
    font-size: 0.85em;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.7;
  }

  .clock {
    margin-left: 0.5rem;
    padding: 0 0.4rem;
    border-radius: 0.6rem;
    background: rgb(0 0 0 / 0.15);
    font-size: 0.85em;
  }

  blockquote {
    margin: 0.25rem 0;
    font-style: italic;
  }

  .empty {
    font-style: italic;
  }
</style>
