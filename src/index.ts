import './styles.css';
import { BUZZER_SETTING, CHIME_SETTING, DEFAULT_BUZZER, DEFAULT_CHIME, MODULE_ID } from './constants';
import { promptAdventureImport } from './adventure';
import { t } from './i18n';
import { StageLayer } from './stage/StageLayer';
import { isStage, refreshStore, registerSocket } from './sync';
import { talent } from './talentStore.svelte';
import { DirectorApp } from './ui/DirectorApp';
import { NoticeApp } from './ui/NoticeApp';
import { VoteButtonApp } from './ui/VoteButtonApp';

const POSTER = `modules/${MODULE_ID}/assets/talent/poster.webp`;

/** Every client gets Foundry's own closeable image window. */
function showPoster(): void {
  if (!game.user.isGM) return;
  const popout = new foundry.applications.apps.ImagePopout({ src: POSTER, window: { title: t('poster') } });
  void popout.render({ force: true });
  popout.shareImage();
}

const api = { openDirector: DirectorApp.open, showPoster };

// Dev HMR swaps in a fresh class here, so a stage edit redraws the canvas in place of a Foundry reload.
let stageLayer = StageLayer;

function registerSound(key: string, sound: string): void {
  game.settings.register(MODULE_ID, key, {
    name: `${MODULE_ID}.settings.${key}.name`,
    hint: `${MODULE_ID}.settings.${key}.hint`,
    scope: 'world',
    config: true,
    type: new foundry.data.fields.FilePathField({ categories: ['AUDIO'] }),
    default: sound,
  });
}

Hooks.once('init', () => {
  registerSound(BUZZER_SETTING, DEFAULT_BUZZER);
  registerSound(CHIME_SETTING, DEFAULT_CHIME);
});

Hooks.once('setup', registerSocket);

Hooks.on('canvasReady', () => {
  const scene = canvas.scene;
  refreshStore(scene);
  if (!isStage(scene)) return;
  void stageLayer.draw();
  if (game.user.isGM) DirectorApp.open();
});

Hooks.on('canvasTearDown', () => stageLayer.destroy());

Hooks.on('updateScene', (scene: Scene, changes: object) => {
  if (scene.id !== canvas.scene?.id || !foundry.utils.hasProperty(changes, `flags.${MODULE_ID}`)) return;
  const wasStage = !!talent.sceneId;
  refreshStore(scene);
  if (!isStage(scene)) stageLayer.destroy();
  else if (!wasStage) void stageLayer.draw();
});

Hooks.once('ready', () => {
  const module = game.modules.get(MODULE_ID);
  // `api` is the Foundry convention for a public API, but isn't a typed field on Module.
  if (module) (module as { api?: typeof api }).api = api;
  void new VoteButtonApp().render({ force: true });
  void new NoticeApp().render({ force: true });
  void promptAdventureImport();
});

if (import.meta.hot) {
  import.meta.hot.accept('./stage/StageLayer', (next) => {
    if (!next) return;
    stageLayer.destroy();
    stageLayer = next.StageLayer;
    if (talent.sceneId) void stageLayer.draw();
  });
}
