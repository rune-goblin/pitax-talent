import { MODULE_ID, SOCKET_EVENT, STAGE_FLAG, STATE_FLAG } from './constants';
import { castVote, normalize, seatOf, type TalentState } from './state';
import { t } from './i18n';
import { talent } from './talentStore.svelte';

interface VoteMessage {
  scope: 'vote';
  sceneId: string;
  userId: string;
}

export const isStage = (scene: Scene | null | undefined): scene is Scene => !!scene?.getFlag(MODULE_ID, STAGE_FLAG);

export const readState = (scene: Scene): TalentState =>
  normalize(scene.getFlag(MODULE_ID, STATE_FLAG) as Partial<TalentState> | undefined);

const isActiveGM = () => game.users.activeGM?.id === game.user.id;

// Writes run one at a time: two players voting in the same frame would otherwise both read the
// pre-vote flag and the second update would erase the first X.
let queue: Promise<void> = Promise.resolve();

export function mutate(sceneId: string, fn: (state: TalentState) => TalentState): Promise<void> {
  queue = queue.then(async () => {
    const scene = game.scenes.get(sceneId);
    if (!scene) return;
    const before = readState(scene);
    const after = fn(before);
    if (after !== before) await scene.update({ [`flags.${MODULE_ID}.${STATE_FLAG}`]: after });
  }).catch((error) => console.error(`${MODULE_ID} |`, error));
  return queue;
}

function applyVote({ sceneId, userId }: VoteMessage): void {
  void mutate(sceneId, (state) => {
    const seat = seatOf(state, userId);
    return seat < 0 ? state : castVote(state, seat);
  });
}

export function vote(): void {
  if (!talent.sceneId) return;
  const message: VoteMessage = { scope: 'vote', sceneId: talent.sceneId, userId: game.user.id };
  if (isActiveGM()) return applyVote(message);
  if (!game.users.activeGM) {
    ui.notifications.warn(t('noGM'));
    return;
  }
  game.socket.emit(SOCKET_EVENT, message);
}

export function registerSocket(): void {
  game.socket.on(SOCKET_EVENT, (message: VoteMessage) => {
    if (message?.scope === 'vote' && isActiveGM()) applyVote(message);
  });
}

/** Point the UI store at the viewed scene; returns the previous state so the stage can animate the change. */
export function refreshStore(scene: Scene | null | undefined): { before: TalentState; after: TalentState } {
  const before = talent.state;
  const after = isStage(scene) ? readState(scene) : normalize(null);
  talent.sceneId = isStage(scene) ? scene.id : null;
  talent.state = after;
  return { before, after };
}
