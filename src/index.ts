import './styles.css';
import { BUZZER_SETTING, DEFAULT_BUZZER, MODULE_ID } from './constants';
import { promptAdventureImport } from './adventure';
import { t } from './i18n';
import { StageLayer } from './stage/StageLayer';
import { isStage, refreshStore, registerSocket } from './sync';
import { talent } from './talentStore.svelte';
import { DirectorApp } from './ui/DirectorApp';
import { DossierApp } from './ui/DossierApp';
import { VoteButtonApp } from './ui/VoteButtonApp';

const POSTER = `modules/${MODULE_ID}/assets/talent/poster.webp`;

/** Every client gets Foundry's own closeable image window. */
function showPoster(): void {
  if (!game.user.isGM) return;
  const popout = new foundry.applications.apps.ImagePopout({ src: POSTER, window: { title: t('poster') } });
  void popout.render({ force: true });
  popout.shareImage();
}

const api = { openDirector: DirectorApp.open, openDossier: DossierApp.open, showPoster };

Hooks.once('init', () => {
  game.settings.register(MODULE_ID, BUZZER_SETTING, {
    name: `${MODULE_ID}.settings.buzzer.name`,
    hint: `${MODULE_ID}.settings.buzzer.hint`,
    scope: 'world',
    config: true,
    type: new foundry.data.fields.FilePathField({ categories: ['AUDIO'] }),
    default: DEFAULT_BUZZER,
  });
});

Hooks.once('setup', registerSocket);

Hooks.on('canvasReady', () => {
  const scene = canvas.scene;
  const { after } = refreshStore(scene);
  if (!isStage(scene)) return;
  void StageLayer.draw(after);
  if (game.user.isGM) DirectorApp.open();
});

Hooks.on('canvasTearDown', () => StageLayer.destroy());

Hooks.on('updateScene', (scene: Scene, changes: object) => {
  if (scene.id !== canvas.scene?.id || !foundry.utils.hasProperty(changes, `flags.${MODULE_ID}`)) return;
  const wasStage = !!talent.sceneId;
  const { before, after } = refreshStore(scene);
  if (!isStage(scene)) StageLayer.destroy();
  else if (wasStage) StageLayer.update(before, after);
  else void StageLayer.draw(after);
});

Hooks.once('ready', () => {
  const module = game.modules.get(MODULE_ID);
  // `api` is the Foundry convention for a public API, but isn't a typed field on Module.
  if (module) (module as { api?: typeof api }).api = api;
  void new VoteButtonApp().render({ force: true });
  void promptAdventureImport();
});
