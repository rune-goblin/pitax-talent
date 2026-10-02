export const SEAT_COUNT = 4;

export interface TalentState {
  seats: (string | null)[];
  contestantId: string | null;
  votes: boolean[];
  /** Bumped on each new contestant so clients replay the entrance only for a fresh arrival. */
  entrance: number;
}

export const emptyState = (): TalentState => ({
  seats: Array(SEAT_COUNT).fill(null),
  contestantId: null,
  votes: Array(SEAT_COUNT).fill(false),
  entrance: 0,
});

/** Flag data comes from the database and may predate a field, so fill gaps from the defaults. */
export function normalize(raw: Partial<TalentState> | undefined | null): TalentState {
  const base = emptyState();
  if (!raw) return base;
  return {
    seats: base.seats.map((_, i) => raw.seats?.[i] ?? null),
    contestantId: raw.contestantId ?? null,
    votes: base.votes.map((_, i) => raw.votes?.[i] === true),
    entrance: raw.entrance ?? 0,
  };
}

export const seatOf = (state: TalentState, userId: string): number => state.seats.indexOf(userId);

export const allVotesIn = (state: TalentState): boolean => state.votes.every(Boolean);

export function castVote(state: TalentState, seat: number): TalentState {
  if (!state.contestantId || state.votes[seat] !== false) return state;
  return { ...state, votes: state.votes.map((on, i) => on || i === seat) };
}

export function retractVote(state: TalentState, seat: number): TalentState {
  if (state.votes[seat] !== true) return state;
  return { ...state, votes: state.votes.map((on, i) => on && i !== seat) };
}

export function bringOn(state: TalentState, contestantId: string): TalentState {
  return { ...state, contestantId, votes: emptyState().votes, entrance: state.entrance + 1 };
}

export const clearStage = (state: TalentState): TalentState => ({ ...state, contestantId: null, votes: emptyState().votes });

export const resetVotes = (state: TalentState): TalentState => ({ ...state, votes: emptyState().votes });

export function assignSeat(state: TalentState, seat: number, userId: string | null): TalentState {
  const seats = state.seats.map((id, i) => (i === seat ? userId : id === userId ? null : id));
  return { ...state, seats };
}

/** Seats whose X turned on between two states, so each client plays the buzzer once per new X. */
export const newVotes = (before: TalentState, after: TalentState): number[] =>
  after.votes.flatMap((on, i) => (on && !before.votes[i] ? [i] : []));
