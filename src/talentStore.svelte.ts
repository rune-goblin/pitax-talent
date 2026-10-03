import { untrack } from 'svelte';
import { emptyState, type TalentState } from './state';

/** What the Svelte UI and the stage layer read: the viewed talent scene and its state. Fed by sync.ts from scene hooks. */
export const talent = $state({
  sceneId: null as string | null,
  state: emptyState() as TalentState,
});

/** Calls `fn` with a plain copy of the show state now and after every change, until the returned stop is called. */
export function watchState(fn: (state: TalentState) => void): () => void {
  return $effect.root(() => {
    $effect(() => {
      const state = $state.snapshot(talent.state) as TalentState;
      untrack(() => fn(state));
    });
  });
}
