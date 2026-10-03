import { describe, expect, it } from 'vitest';
import { assignSeat, awaitingRegent, bringOn, castVote, clearResults, clearStage, dismiss, emptyState, join, normalize, regentDecision, regentVote, resetVotes, retractVote, ruling, seatOf, setClock, spotlight, tally, tied, verdict, type TalentState, type Vote } from './state';

const onStage = () => bringOn(emptyState(), ['jhofre'], 'jhofre');
const voted = (votes: Vote[], state = onStage()) => votes.reduce((s, vote, seat) => castVote(s, seat, vote), state);
const tie = () => voted(['check', 'x', 'check', 'x']);

describe('castVote', () => {
  it('records an X or a check for the seat while a contestant is on stage', () => {
    expect(castVote(onStage(), 2, 'x').votes).toEqual([null, null, 'x', null]);
    expect(castVote(onStage(), 1, 'check').votes).toEqual([null, 'check', null, null]);
  });

  it('ignores votes with an empty stage', () => {
    const state = emptyState();
    expect(castVote(state, 0, 'x')).toBe(state);
  });

  it('keeps a vote final once cast', () => {
    const voted = castVote(onStage(), 1, 'check');
    expect(castVote(voted, 1, 'x')).toBe(voted);
  });

  it('ignores seats outside the row', () => {
    const state = onStage();
    expect(castVote(state, 7, 'x')).toBe(state);
  });

  it("saves the act's votes once the last judge votes", () => {
    let state = onStage();
    for (const seat of [0, 1, 2]) state = castVote(state, seat, 'x');
    expect(state.results).toEqual({});
    expect(castVote(state, 3, 'check').results).toEqual({ jhofre: ['x', 'x', 'x', 'check'] });
  });

  it("overwrites the act's result on a re-vote and keeps other acts'", () => {
    const allIn = (state: TalentState, vote: Vote) => [0, 1, 2, 3].reduce((s, seat) => castVote(s, seat, vote), state);
    const first = allIn(onStage(), 'x');
    const other = allIn(bringOn(first, ['drey'], 'drey'), 'check');
    const again = allIn(resetVotes(bringOn(other, ['jhofre'], 'jhofre')), 'check');
    expect(again.results).toEqual({ jhofre: ['check', 'check', 'check', 'check'], drey: ['check', 'check', 'check', 'check'] });
  });
});

describe('retractVote', () => {
  it('clears one vote and leaves the others', () => {
    const voted = castVote(castVote(onStage(), 0, 'x'), 2, 'check');
    expect(retractVote(voted, 2).votes).toEqual(['x', null, null, null]);
  });

  it('ignores a seat that has not voted', () => {
    const state = onStage();
    expect(retractVote(state, 1)).toBe(state);
  });
});

describe('bringOn', () => {
  it('resets every X and bumps the entrance counter', () => {
    const voted = castVote(castVote(onStage(), 0, 'x'), 3, 'check');
    const next = bringOn(voted, ['drey'], 'drey');
    expect(next.contestantIds).toEqual(['drey']);
    expect(next.votes).toEqual([null, null, null, null]);
    expect(next.entrance).toBe(voted.entrance + 1);
  });

  it('seats a whole slate at once and ignores an empty one', () => {
    expect(bringOn(emptyState(), ['salvarri', 'xapiri'], 'cattanei').contestantIds).toEqual(['salvarri', 'xapiri']);
    const state = onStage();
    expect(bringOn(state, [], '')).toBe(state);
  });
});

describe('join', () => {
  const key = (ids: string[]) => ids.join('+');

  it('adds the newcomer beside the act without a fresh entrance and restarts the vote', () => {
    const state = castVote(onStage(), 0, 'x');
    const next = join(state, 'drey', key);
    expect(next.contestantIds).toEqual(['jhofre', 'drey']);
    expect(next.act).toBe('jhofre+drey');
    expect(next.votes).toEqual([null, null, null, null]);
    expect(next.entrance).toBe(state.entrance);
  });

  it('walks a newcomer on alone onto an empty stage', () => {
    const next = join(emptyState(), 'drey', key);
    expect(next.contestantIds).toEqual(['drey']);
    expect(next.entrance).toBe(1);
  });

  it('ignores someone already on stage', () => {
    const state = onStage();
    expect(join(state, 'jhofre', key)).toBe(state);
  });
});

describe('dismiss', () => {
  const key = (ids: string[]) => ids.join('+');
  const trio = () => bringOn(emptyState(), ['salvarri', 'xapiri', 'drey'], 'trio');

  it('closes ranks around the rest and restarts the vote', () => {
    const next = dismiss(castVote(trio(), 1, 'check'), ['xapiri'], key);
    expect(next.contestantIds).toEqual(['salvarri', 'drey']);
    expect(next.act).toBe('salvarri+drey');
    expect(next.votes).toEqual([null, null, null, null]);
  });

  it('lifts the spotlight only from someone who leaves', () => {
    expect(dismiss(spotlight(trio(), 'xapiri'), ['xapiri'], key).spotlightId).toBeNull();
    expect(dismiss(spotlight(trio(), 'drey'), ['xapiri'], key).spotlightId).toBe('drey');
  });

  it('empties the stage with the last of them and ignores anyone not on it', () => {
    expect(dismiss(onStage(), ['jhofre'], key)).toEqual(clearStage(onStage()));
    const state = onStage();
    expect(dismiss(state, ['drey'], key)).toBe(state);
  });
});

describe('spotlight', () => {
  const pair = () => bringOn(emptyState(), ['salvarri', 'xapiri'], 'cattanei');

  it('singles out a contestant and toggles off on a second click', () => {
    const lit = spotlight(pair(), 'xapiri');
    expect(lit.spotlightId).toBe('xapiri');
    expect(spotlight(lit, 'xapiri').spotlightId).toBeNull();
    expect(spotlight(lit, 'salvarri').spotlightId).toBe('salvarri');
  });

  it('ignores anyone not on stage and clears with the next act', () => {
    const state = pair();
    expect(spotlight(state, 'drey')).toBe(state);
    expect(bringOn(spotlight(state, 'xapiri'), ['drey'], 'drey').spotlightId).toBeNull();
    expect(clearStage(spotlight(state, 'xapiri')).spotlightId).toBeNull();
  });
});

describe('verdict', () => {
  it('waits for every judge', () => {
    expect(verdict(voted(['check', 'check', 'check']))).toBeNull();
  });

  it('follows the majority', () => {
    expect(verdict(voted(['check', 'check', 'check', 'x']))).toBe('appointed');
    expect(verdict(voted(['x', 'x', 'x', 'check']))).toBe('rejected');
    expect(verdict(voted(['x', 'x', 'x', 'x']))).toBe('rejected');
  });

  it('leaves a two-two split to Valerie', () => {
    expect(tied(tie())).toBe(true);
    expect(awaitingRegent(tie())).toBe(true);
    expect(verdict(tie())).toBeNull();
    expect(verdict(regentVote(tie(), 'check'))).toBe('appointed');
    expect(verdict(regentVote(tie(), 'x'))).toBe('rejected');
  });
});

describe('regentVote', () => {
  it('saves her vote fifth', () => {
    expect(tie().results).toEqual({});
    const decided = regentVote(tie(), 'x');
    expect(decided.regent).toBe('x');
    expect(decided.results).toEqual({ jhofre: ['check', 'x', 'check', 'x', 'x'] });
  });

  it('ignores her outside a tie and once she has voted', () => {
    const settled = voted(['check', 'check', 'check', 'x']);
    expect(regentVote(settled, 'x')).toBe(settled);
    const decided = regentVote(tie(), 'check');
    expect(regentVote(decided, 'x')).toBe(decided);
  });

  it('clears when a judge takes their vote back or the votes reset', () => {
    const decided = regentVote(tie(), 'check');
    expect(retractVote(decided, 1).regent).toBeNull();
    expect(resetVotes(decided).regent).toBeNull();
    expect(bringOn(decided, ['drey'], 'drey').regent).toBeNull();
  });
});

describe('ruling', () => {
  it("reads a saved act's verdict and tally, Valerie's fifth included", () => {
    expect(ruling(['check', 'check', 'check', 'x'])).toBe('appointed');
    expect(ruling(['check', 'x', 'check', 'x', 'x'])).toBe('rejected');
    expect(tally(['check', 'x', 'check', 'x', 'x'])).toEqual({ yes: 2, no: 3 });
  });
});

describe('clearResults', () => {
  it('wipes every saved verdict and leaves the stage and its votes', () => {
    const decided = voted(['check', 'check', 'check', 'x']);
    const cleared = clearResults(decided);
    expect(cleared.results).toEqual({});
    expect(cleared.contestantIds).toEqual(['jhofre']);
    expect(cleared.votes).toEqual(decided.votes);
  });

  it('returns the same state with nothing saved', () => {
    const state = onStage();
    expect(clearResults(state)).toBe(state);
  });
});

describe('regentDecision', () => {
  it('appoints over 10 and rejects on 10 or under', () => {
    expect(regentDecision(11)).toBe('check');
    expect(regentDecision(20)).toBe('check');
    expect(regentDecision(10)).toBe('x');
    expect(regentDecision(1)).toBe('x');
  });
});

describe('assignSeat', () => {
  it('moves a user out of their previous seat', () => {
    const state = assignSeat(assignSeat(emptyState(), 0, 'alice'), 2, 'alice');
    expect(state.seats).toEqual([null, null, 'alice', null]);
    expect(seatOf(state, 'alice')).toBe(2);
  });

  it('frees a seat when assigned null', () => {
    expect(assignSeat(assignSeat(emptyState(), 1, 'bob'), 1, null).seats).toEqual([null, null, null, null]);
  });
});

describe('normalize', () => {
  it('fills missing fields from defaults', () => {
    expect(normalize({ contestantIds: ['kharne'], act: 'kharne' })).toEqual({ ...emptyState(), contestantIds: ['kharne'], act: 'kharne' });
    expect(normalize(undefined)).toEqual(emptyState());
  });

  it('reads the boolean X votes written before the check', () => {
    expect(normalize({ votes: [true, false, 'check', 'maybe'] } as object).votes).toEqual(['x', null, 'check', null]);
  });

  it('reads the single contestantId written before slates', () => {
    expect(normalize({ contestantId: 'kharne' } as object)).toEqual({ ...emptyState(), contestantIds: ['kharne'], act: 'kharne' });
    expect(normalize(undefined)).toEqual(emptyState());
  });

  it('keys an act flagged before acts were keyed by its contestants', () => {
    expect(normalize({ contestantIds: ['salvarri', 'xapiri'] }).act).toBe('salvarri+xapiri');
  });

  it('keeps well-formed results and drops the rest', () => {
    const raw = { results: { drey: ['x', 'check', 'x', 'x'], alasen: ['x', 'maybe'], kharne: 'x' } } as object;
    expect(normalize(raw).results).toEqual({ drey: ['x', 'check', 'x', 'x'] });
  });

  it('keeps well-formed clocks and drops the rest', () => {
    const raw = { clocks: { drey: { size: 6, progress: 9 }, alasen: { size: 'six' } } } as object;
    expect(normalize(raw).clocks).toEqual({ drey: { size: 6, progress: 6 } });
  });
});

describe('setClock', () => {
  it('clamps progress to the clock and the clock to its bounds', () => {
    expect(setClock(emptyState(), 'drey', { size: 6, progress: 7 }).clocks.drey).toEqual({ size: 6, progress: 6 });
    expect(setClock(emptyState(), 'drey', { size: 0, progress: -1 }).clocks.drey).toEqual({ size: 1, progress: 0 });
    expect(setClock(emptyState(), 'drey', { size: 40, progress: 2 }).clocks.drey).toEqual({ size: 12, progress: 2 });
  });

  it('returns the same state when nothing moves', () => {
    const state = setClock(emptyState(), 'drey', { size: 6, progress: 2 });
    expect(setClock(state, 'drey', { size: 6, progress: 2 })).toBe(state);
    expect(setClock(state, 'alasen', { size: 4, progress: 1 }).clocks).toEqual({ drey: { size: 6, progress: 2 }, alasen: { size: 4, progress: 1 } });
  });
});
