<script lang="ts">
  import { t } from '../i18n';
  import { problems } from '../pitax/problems';
</script>

<div class="problems">
  <p class="intro">{t('problems.intro')}</p>
  <ol>
    {#each problems as problem (problem.id)}
      <li>
        <h3>{problem.title}</h3>
        <p>{problem.summary}</p>
      </li>
    {/each}
  </ol>
</div>

<style>
  .problems {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 14px 16px 18px;
    font-family: var(--pt-body);
  }

  .intro {
    margin: 0 0 12px;
    color: var(--pt-muted);
    font-style: italic;
  }

  ol {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: problem;
  }

  li {
    position: relative;
    margin: 0;
    padding: 10px 14px 10px 52px;
    border: 1px solid rgb(255 255 255 / 0.07);
    border-radius: 6px;
    background: var(--pt-ink-raised);
    counter-increment: problem;
  }

  li::before {
    position: absolute;
    top: 10px;
    left: 14px;
    color: var(--pt-gilt);
    font-family: var(--pt-display);
    font-size: 24px;
    font-weight: 600;
    line-height: 1.1;
    content: counter(problem);
  }

  h3 {
    margin: 0 0 2px;
    border: none;
    color: var(--pt-gilt);
    font-family: var(--pt-display);
    font-size: 20px;
    font-weight: 600;
    line-height: 1.2;
  }

  p {
    margin: 0;
  }
</style>
