import { MODULE_ID } from '../constants';
import { SvelteApp } from './SvelteApp';
import Notice from './Notice.svelte';

/** Frameless HUD that shows every client Valerie's tie-break and each act's verdict, wherever their canvas view sits. */
export class NoticeApp extends SvelteApp {
  static override DEFAULT_OPTIONS = {
    id: `${MODULE_ID}-notice`,
    classes: [MODULE_ID, `${MODULE_ID}-notice`],
    window: { frame: false, positioned: false },
  };

  protected component = Notice;
}
