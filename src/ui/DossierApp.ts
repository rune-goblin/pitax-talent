import { MODULE_ID } from '../constants';
import { SvelteApp } from './SvelteApp';
import Dossier from './Dossier.svelte';

/** GM-only reference card for the contestant; players never construct it. */
export class DossierApp extends SvelteApp {
  static override DEFAULT_OPTIONS = {
    id: `${MODULE_ID}-dossier`,
    classes: [MODULE_ID, `${MODULE_ID}-dossier`],
    window: { title: `${MODULE_ID}.dossier.title`, icon: 'fa-solid fa-scroll', resizable: true },
    position: { left: 744, top: 70, width: 540, height: 720 },
  };

  protected component = Dossier;

  static #instance?: DossierApp;

  static open(): void {
    if (!game.user.isGM) return;
    DossierApp.#instance ??= new DossierApp();
    void DossierApp.#instance.render({ force: true });
  }
}
