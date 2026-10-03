<script lang="ts">
  import { t, tf } from '../i18n';
  import type { Npc } from '../pitax/pitax';
  import { thumbPath } from '../roster';

  interface Props {
    npc: Npc;
    troupe?: string;
    staged: boolean;
    /** Someone else holds the stage, so this one can come on beside them. */
    joinable: boolean;
    shown: boolean;
    onpreview: (id: string) => void;
    onstage: (id: string) => void;
    onjoin: (id: string) => void;
  }

  let { npc, troupe, staged, joinable, shown, onpreview, onstage, onjoin }: Props = $props();
</script>

<li class="card" class:staged class:shown>
  <button type="button" class="pick" onclick={() => onpreview(npc.id)}>
    <img src={thumbPath(npc)} alt="" loading="lazy" />
    <span class="text">
      <span class="name">{npc.name}</span>
      {#if troupe || staged || npc.fate}
        <span class="troupe">
          {#if troupe}{troupe}{/if}
          {#if staged}
            <span class="tag">{t('director.onStage')}</span>
          {:else if npc.fate}
            <span class="fate">{npc.fate}</span>
          {/if}
        </span>
      {/if}
      <span class="role">{npc.role}</span>
    </span>
  </button>
  <span class="moves">
    <button
      type="button"
      class="send"
      aria-label={tf('director.bringOnNamed', { name: npc.name })}
      data-tooltip={tf('director.bringOnNamed', { name: npc.name })}
      onclick={() => onstage(npc.id)}
    >
      <i class="fa-solid fa-person-walking"></i>
    </button>
    {#if joinable}
      <button
        type="button"
        class="send"
        aria-label={tf('director.comeOnNamed', { name: npc.name })}
        data-tooltip={tf('director.comeOnNamed', { name: npc.name })}
        onclick={() => onjoin(npc.id)}
      >
        <i class="fa-solid fa-plus"></i>
      </button>
    {/if}
  </span>
</li>

<style>
  .card {
    position: relative;
    display: flex;
    margin: 0;
    border: 1px solid rgb(255 255 255 / 0.07);
    border-radius: 6px;
    background: var(--pt-ink-raised);
    transition: border-color 140ms ease, background 140ms ease;
  }

  .card:hover,
  .card:focus-within {
    border-color: var(--pt-gilt-dim);
    background: #26142e;
  }

  .card.shown {
    border-color: var(--pt-gilt);
  }

  .card.staged {
    border-color: var(--pt-gilt);
    background: linear-gradient(100deg, rgb(220 180 99 / 0.2), transparent 70%), var(--pt-ink-raised);
  }

  .pick {
    flex: 1;
    justify-content: flex-start;
    gap: 12px;
    min-width: 0;
    height: auto;
    padding: 8px 40px 8px 8px;
    border: none;
    background: none;
    box-shadow: none;
    color: var(--pt-paper);
    font-size: inherit;
    text-align: left;
  }

  .pick img {
    flex: none;
    width: 54px;
    height: 72px;
    border: none;
    object-fit: contain;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .name {
    font-family: var(--pt-display);
    font-size: 20px;
    font-weight: 600;
    line-height: 1.15;
  }

  .troupe {
    display: flex;
    flex-wrap: wrap;
    gap: 0 10px;
    color: var(--pt-gilt);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 600;
  }

  .fate {
    color: var(--pt-ruby-soft);
  }

  .tag {
    padding: 0 6px;
    border-radius: 3px;
    background: var(--pt-gilt);
    color: var(--pt-ink);
  }

  .role {
    display: -webkit-box;
    overflow: hidden;
    color: var(--pt-muted);
    font-family: var(--pt-body);
    font-size: 14px;
    line-height: 1.3;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .moves {
    position: absolute;
    top: 50%;
    right: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    translate: 0 -50%;
  }

  .send {
    width: 30px;
    height: 30px;
    min-height: 0;
    padding: 0;
    border: 1px solid var(--pt-gilt-dim);
    border-radius: 50%;
    background: var(--pt-ink);
    box-shadow: none;
    color: var(--pt-gilt);
    font-size: 14px;
    opacity: 0;
    transition: opacity 140ms ease, background 140ms ease, color 140ms ease;
  }

  .card:hover .send,
  .send:focus-visible {
    opacity: 1;
  }

  .send:hover {
    border-color: var(--pt-ruby);
    background: var(--pt-ruby);
    color: white;
  }
</style>
