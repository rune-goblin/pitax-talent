<script lang="ts" module>
  import type { Npc } from '../pitax/pitax';

  export interface CastMember {
    npc: Npc;
    troupe: string;
  }
</script>

<script lang="ts">
  import CastCard from './CastCard.svelte';

  interface Props {
    members: CastMember[];
    stagedIds: string[];
    shownId: string | null;
    onpreview: (id: string) => void;
    onstage: (ids: string[]) => void;
  }

  let { members, stagedIds, shownId, onpreview, onstage }: Props = $props();
</script>

<ul class="cast">
  {#each members as { npc, troupe } (npc.id)}
    <CastCard {npc} {troupe} staged={stagedIds.includes(npc.id)} shown={npc.id === shownId} {onpreview} onstage={(id) => onstage([id])} />
  {/each}
</ul>

<style>
  .cast {
    display: grid;
    flex: 1;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    align-content: start;
    gap: 8px;
    min-height: 0;
    margin: 0;
    overflow-y: auto;
    padding: 14px 16px 18px;
    list-style: none;
  }
</style>
