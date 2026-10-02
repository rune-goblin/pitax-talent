import { MODULE_ID } from '../constants';
import { SvelteApp } from './SvelteApp';
import Director from './Director.svelte';

export class DirectorApp extends SvelteApp {
  static override DEFAULT_OPTIONS = {
    id: `${MODULE_ID}-director`,
    // The panel carries its own dark palette, so Foundry's form controls inside must be dark in either core theme.
    classes: [MODULE_ID, `${MODULE_ID}-director`, 'themed', 'theme-dark'],
    window: { title: `${MODULE_ID}.director.title`, icon: 'fa-solid fa-masks-theater', resizable: true },
    position: { left: 110, top: 70, width: 580, height: 780 },
  };

  protected component = Director;

  static #instance?: DirectorApp;

  static open(): void {
    if (!game.user.isGM) return;
    DirectorApp.#instance ??= new DirectorApp();
    void DirectorApp.#instance.render({ force: true });
  }
}
