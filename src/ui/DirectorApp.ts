import { MODULE_ID } from '../constants';
import { SvelteApp } from './SvelteApp';
import Director from './Director.svelte';

export class DirectorApp extends SvelteApp {
  static override DEFAULT_OPTIONS = {
    id: `${MODULE_ID}-director`,
    classes: [MODULE_ID, `${MODULE_ID}-director`],
    window: { title: `${MODULE_ID}.director.title`, icon: 'fa-solid fa-masks-theater', resizable: true },
    position: { left: 110, top: 70, width: 620, height: 720 },
  };

  protected component = Director;

  static #instance?: DirectorApp;

  static open(): void {
    if (!game.user.isGM) return;
    DirectorApp.#instance ??= new DirectorApp();
    void DirectorApp.#instance.render({ force: true });
  }
}
