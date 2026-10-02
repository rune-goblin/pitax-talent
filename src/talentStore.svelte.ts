import { emptyState, type TalentState } from './state';

/** What the Svelte UI reads: the viewed talent scene and its state. Fed by sync.ts from scene hooks. */
export const talent = $state({
  sceneId: null as string | null,
  state: emptyState() as TalentState,
  /** GM-local: the character the Dossier shows; falls back to whoever is on stage. */
  dossierId: null as string | null,
});
