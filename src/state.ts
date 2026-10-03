export const SEAT_COUNT = 4;
export const MAX_CLOCK = 12;

export interface Clock {
  size: number;
  progress: number;
}

export type Vote = 'x' | 'check';
export type Verdict = 'appointed' | 'rejected';

export interface TalentState {
  seats: (string | null)[];
  contestantIds: string[];
  /** One of the contestants the GM has singled out; the rest of the slate shrinks and dims. */
  spotlightId: string | null;
  votes: (Vote | null)[];
  /** Valerie's deciding vote when the judges split two and two; null until her roll lands. */
  regent: Vote | null;
  /** What the current act's verdict is saved under: the faction for its whole slate, else the contestants. */
  act: string;
  /** Each act's votes, saved once its verdict is in, with Valerie's fifth on a tie; a re-vote overwrites. */
  results: Record<string, Vote[]>;
  /** Bumped on each new contestant so clients replay the entrance only for a fresh arrival. */
  entrance: number;
  /** Agenda clocks the GM has moved, by npc id; the rest still show their seeded value. */
  clocks: Record<string, Clock>;
}

export const emptyState = (): TalentState => ({
  seats: Array(SEAT_COUNT).fill(null),
  contestantIds: [],
  spotlightId: null,
  votes: Array(SEAT_COUNT).fill(null),
  regent: null,
  act: '',
  results: {},
  entrance: 0,
  clocks: {},
});

export function clampClock({ size, progress }: Clock): Clock {
  const s = Math.min(Math.max(Math.round(size), 1), MAX_CLOCK);
  return { size: s, progress: Math.min(Math.max(Math.round(progress), 0), s) };
}

function clocks(raw: Partial<TalentState>): Record<string, Clock> {
  const out: Record<string, Clock> = {};
  for (const [id, c] of Object.entries(raw.clocks ?? {})) {
    if (typeof c?.size === 'number' && typeof c?.progress === 'number') out[id] = clampClock(c);
  }
  return out;
}

// Scenes flagged before the check stored each seat's X as a boolean.
function readVote(raw: unknown): Vote | null {
  if (raw === true || raw === 'x') return 'x';
  return raw === 'check' ? 'check' : null;
}

function results(raw: Partial<TalentState>): Record<string, Vote[]> {
  const out: Record<string, Vote[]> = {};
  for (const [act, votes] of Object.entries(raw.results ?? {})) {
    if (Array.isArray(votes) && votes.every((v) => v === 'x' || v === 'check')) out[act] = [...votes];
  }
  return out;
}

// Scenes flagged before slates existed hold a single `contestantId`.
function contestants(raw: Partial<TalentState> & { contestantId?: string | null }): string[] {
  if (Array.isArray(raw.contestantIds)) return raw.contestantIds.filter((id): id is string => typeof id === 'string');
  return raw.contestantId ? [raw.contestantId] : [];
}

/** Flag data comes from the database and may predate a field, so fill gaps from the defaults. */
export function normalize(raw: Partial<TalentState> | undefined | null): TalentState {
  const base = emptyState();
  if (!raw) return base;
  const contestantIds = contestants(raw);
  return {
    seats: base.seats.map((_, i) => raw.seats?.[i] ?? null),
    contestantIds,
    spotlightId: typeof raw.spotlightId === 'string' ? raw.spotlightId : null,
    votes: base.votes.map((_, i) => readVote(raw.votes?.[i])),
    regent: raw.regent === 'x' || raw.regent === 'check' ? raw.regent : null,
    // Scenes flagged before acts were keyed fall back to the contestants, the same key a lone act gets.
    act: typeof raw.act === 'string' ? raw.act : contestantIds.join('+'),
    results: results(raw),
    entrance: raw.entrance ?? 0,
    clocks: clocks(raw),
  };
}

export function setClock(state: TalentState, id: string, clock: Clock): TalentState {
  const next = clampClock(clock);
  const prev = state.clocks[id];
  if (prev && prev.size === next.size && prev.progress === next.progress) return state;
  return { ...state, clocks: { ...state.clocks, [id]: next } };
}

export const seatOf = (state: TalentState, userId: string): number => state.seats.indexOf(userId);

export const allVoted = (state: TalentState): boolean => state.votes.every((vote) => vote !== null);

const ballots = (state: TalentState): Vote[] => [...state.votes, state.regent].filter((v): v is Vote => v !== null);
const count = (votes: (Vote | null)[], vote: Vote): number => votes.filter((v) => v === vote).length;

/** The judges split two and two, so Valerie casts the deciding vote. */
export const tied = (state: TalentState): boolean => allVoted(state) && count(state.votes, 'check') * 2 === SEAT_COUNT;

export const awaitingRegent = (state: TalentState): boolean => tied(state) && !state.regent;

export const tally = (votes: Vote[]): { yes: number; no: number } => ({ yes: count(votes, 'check'), no: count(votes, 'x') });

/** A saved act's verdict; saved votes never split evenly, since Valerie's fifth breaks a tie before the save. */
export function ruling(votes: Vote[]): Verdict {
  const { yes, no } = tally(votes);
  return yes > no ? 'appointed' : 'rejected';
}

/** A majority of checks appoints the act to the council; null until every judge, and on a tie Valerie, has voted. */
export function verdict(state: TalentState): Verdict | null {
  if (!allVoted(state)) return null;
  const votes = ballots(state);
  const { yes, no } = tally(votes);
  return yes === no ? null : ruling(votes);
}

function record(state: TalentState): TalentState {
  return verdict(state) ? { ...state, results: { ...state.results, [state.act]: ballots(state) } } : state;
}

export function castVote(state: TalentState, seat: number, vote: Vote): TalentState {
  if (!state.contestantIds.length || state.votes[seat] !== null) return state;
  return record({ ...state, votes: state.votes.map((v, i) => (i === seat ? vote : v)) });
}

/** Valerie breaks a tie on a d20: over 10 she seats the act. */
export const REGENT_ROLL = '1d20';
export const regentDecision = (total: number): Vote => (total > 10 ? 'check' : 'x');

export function regentVote(state: TalentState, vote: Vote): TalentState {
  if (!awaitingRegent(state)) return state;
  return record({ ...state, regent: vote });
}

export function retractVote(state: TalentState, seat: number): TalentState {
  if (!state.votes[seat]) return state;
  return { ...state, votes: state.votes.map((v, i) => (i === seat ? null : v)), regent: null };
}

/** One act may hold a faction's whole slate; the entrance counter bumps so every client replays the walk-on. */
export function bringOn(state: TalentState, contestantIds: string[], act: string): TalentState {
  if (!contestantIds.length) return state;
  return { ...state, contestantIds: [...contestantIds], act, spotlightId: null, votes: emptyState().votes, regent: null, entrance: state.entrance + 1 };
}

type ActKey = (contestantIds: string[]) => string;

/** A newcomer joins whoever stands there, which makes a new act, so the vote starts over; onto an empty stage they walk on alone. */
export function join(state: TalentState, id: string, actKey: ActKey): TalentState {
  if (state.contestantIds.includes(id)) return state;
  const ids = [...state.contestantIds, id];
  if (ids.length === 1) return bringOn(state, ids, actKey(ids));
  return { ...state, contestantIds: ids, act: actKey(ids), votes: emptyState().votes, regent: null };
}

/** The rest close ranks as a new act, so the vote starts over; dismissing the last empties the stage. */
export function dismiss(state: TalentState, ids: string[], actKey: ActKey): TalentState {
  const rest = state.contestantIds.filter((id) => !ids.includes(id));
  if (rest.length === state.contestantIds.length) return state;
  if (!rest.length) return clearStage(state);
  const spotlightId = state.spotlightId && rest.includes(state.spotlightId) ? state.spotlightId : null;
  return { ...state, contestantIds: rest, act: actKey(rest), spotlightId, votes: emptyState().votes, regent: null };
}

/** Single out one contestant of the slate; the same id again lifts the spotlight. */
export function spotlight(state: TalentState, id: string): TalentState {
  if (!state.contestantIds.includes(id)) return state;
  return { ...state, spotlightId: state.spotlightId === id ? null : id };
}

export const clearStage = (state: TalentState): TalentState => ({ ...state, contestantIds: [], act: '', spotlightId: null, votes: emptyState().votes, regent: null });

export const clearResults = (state: TalentState): TalentState => (Object.keys(state.results).length ? { ...state, results: {} } : state);

export const resetVotes = (state: TalentState): TalentState => ({ ...state, votes: emptyState().votes, regent: null });

export function assignSeat(state: TalentState, seat: number, userId: string | null): TalentState {
  const seats = state.seats.map((id, i) => (i === seat ? userId : id === userId ? null : id));
  return { ...state, seats };
}
