import { MODULE_ID, SOCKET_EVENT, STAGE_FLAG, STATE_FLAG } from './constants';
import { actName, contestant, REGENT_ID } from './roster';
import { awaitingRegent, castVote, normalize, REGENT_ROLL, regentDecision, regentVote, seatOf, type TalentState, type Vote } from './state';
import { t, tf } from './i18n';
import { talent } from './talentStore.svelte';

interface VoteMessage {
  scope: 'vote';
  sceneId: string;
  userId: string;
  vote: Vote;
}

export const isStage = (scene: Scene | null | undefined): scene is Scene => !!scene?.getFlag(MODULE_ID, STAGE_FLAG);

export const readState = (scene: Scene): TalentState =>
  normalize(scene.getFlag(MODULE_ID, STATE_FLAG) as Partial<TalentState> | undefined);

// Foundry's global ForcedReplacement shorthand, missing from the foundry-pf2e typings.
declare const _replace: <T>(value: T) => T;

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
    if (after === before) return;
    // Foundry merges flag objects key by key, so a plain write would keep verdicts the GM cleared.
    await scene.update({ [`flags.${MODULE_ID}.${STATE_FLAG}`]: _replace(after) });
    // Not awaited: the roll's own write joins this queue, which is still busy with this one.
    if (awaitingRegent(after) && !awaitingRegent(before)) void breakTie(sceneId, after);
  }).catch((error) => console.error(`${MODULE_ID} |`, error));
  return queue;
}

// Lets Valerie's token land on stage before the dice fly.
const TIE_PAUSE_MS = 1600;

interface DiceSoNice {
  waitFor3DAnimationByMessageID(id: string): Promise<boolean>;
}

/** Valerie rolls in chat; her vote lands once the dice settle, unless the GM moved on meanwhile. */
async function breakTie(sceneId: string, tie: TalentState): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, TIE_PAUSE_MS));
  const name = contestant(REGENT_ID)?.name ?? REGENT_ID;
  const roll = await new foundry.dice.Roll(REGENT_ROLL).evaluate();
  const message = await roll.toMessage(
    { speaker: { alias: name }, flavor: tf('regent.flavor', { name, act: actName(tie.contestantIds) }) },
    { rollMode: 'publicroll' },
  );
  // Dice So Nice holds the chat card back until its dice land; the stage waits with it.
  await (game as { dice3d?: DiceSoNice }).dice3d?.waitFor3DAnimationByMessageID(message.id);
  await mutate(sceneId, (state) => (state.entrance === tie.entrance ? regentVote(state, regentDecision(roll.total)) : state));
}

function applyVote({ sceneId, userId, vote }: VoteMessage): void {
  void mutate(sceneId, (state) => {
    const seat = seatOf(state, userId);
    // A client still running the X-only build sends no vote.
    return seat < 0 ? state : castVote(state, seat, vote === 'check' ? 'check' : 'x');
  });
}

export function sendVote(vote: Vote): void {
  if (!talent.sceneId) return;
  const message: VoteMessage = { scope: 'vote', sceneId: talent.sceneId, userId: game.user.id, vote };
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

/** Point the store at the viewed scene; the Svelte UI and the stage layer both follow it. */
export function refreshStore(scene: Scene | null | undefined): void {
  talent.sceneId = isStage(scene) ? scene.id : null;
  talent.state = isStage(scene) ? readState(scene) : normalize(null);
}
