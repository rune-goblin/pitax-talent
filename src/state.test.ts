import { describe, expect, it } from 'vitest';
import { allVotesIn, assignSeat, bringOn, castVote, clearStage, emptyState, newVotes, normalize, seatOf } from './state';

const onStage = () => bringOn(emptyState(), 'jhofre');

describe('castVote', () => {
  it('lights the seat X while a contestant is on stage', () => {
    expect(castVote(onStage(), 2).votes).toEqual([false, false, true, false]);
  });

  it('ignores votes with an empty stage', () => {
    const state = emptyState();
    expect(castVote(state, 0)).toBe(state);
  });

  it('keeps an X final once cast', () => {
    const voted = castVote(onStage(), 1);
    expect(castVote(voted, 1)).toBe(voted);
  });

  it('ignores seats outside the row', () => {
    const state = onStage();
    expect(castVote(state, 7)).toBe(state);
  });
});

describe('bringOn', () => {
  it('resets every X and bumps the entrance counter', () => {
    const voted = castVote(castVote(onStage(), 0), 3);
    const next = bringOn(voted, 'drey');
    expect(next.contestantId).toBe('drey');
    expect(next.votes).toEqual([false, false, false, false]);
    expect(next.entrance).toBe(voted.entrance + 1);
  });
});

describe('allVotesIn', () => {
  it('is true only when all four X are lit', () => {
    let state = onStage();
    for (const seat of [0, 1, 2]) state = castVote(state, seat);
    expect(allVotesIn(state)).toBe(false);
    expect(allVotesIn(castVote(state, 3))).toBe(true);
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
    expect(normalize({ contestantId: 'kharne' })).toEqual({ ...emptyState(), contestantId: 'kharne' });
    expect(normalize(undefined)).toEqual(emptyState());
  });
});

describe('newVotes', () => {
  it('lists only seats that turned on', () => {
    const before = castVote(onStage(), 0);
    const after = castVote(castVote(before, 2), 3);
    expect(newVotes(before, after)).toEqual([2, 3]);
    expect(newVotes(after, clearStage(after))).toEqual([]);
  });
});
