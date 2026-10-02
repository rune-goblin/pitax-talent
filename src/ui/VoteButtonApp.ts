import { MODULE_ID } from '../constants';
import { SvelteApp } from './SvelteApp';
import VoteButton from './VoteButton.svelte';

/** Frameless HUD holding a player's X button; the component hides itself off-stage or without a seat. */
export class VoteButtonApp extends SvelteApp {
  static override DEFAULT_OPTIONS = {
    id: `${MODULE_ID}-vote`,
    classes: [MODULE_ID, `${MODULE_ID}-vote`],
    window: { frame: false, positioned: false },
  };

  protected component = VoteButton;
}
