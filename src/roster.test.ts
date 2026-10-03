import { describe, expect, it } from 'vitest';
import { actKey, actName, candidatesOf, dossier, factionById, factionOnStage, isCandidate, OTHER, rosterGroups } from './roster';
import { portraitNames } from './pitax/portraits';

describe('rosterGroups', () => {
  const groups = rosterGroups('Other');

  it('lists the factions first and the Other group last', () => {
    expect(groups[0].id).toBe('vascari');
    expect(groups.at(-1)!.id).toBe(OTHER);
  });

  it('only lists characters who have a portrait', () => {
    for (const npc of groups.flatMap((g) => g.members)) expect(portraitNames.has(npc.art!)).toBe(true);
  });

  it('puts unaffiliated characters in Other', () => {
    const other = groups.at(-1)!.members.map((n) => n.id);
    expect(other).toContain('valerie');
    expect(other).not.toContain('jhofre');
  });
});

describe('dossier', () => {
  it('joins every data source for a character', () => {
    const d = dossier('salvarri')!;
    expect(d.faction?.id).toBe('cattanei');
    expect(d.bio).toBeTruthy();
    expect(d.agenda?.goal).toBeTruthy();
    expect(d.case?.pitch).toBeTruthy();
    expect(d.consequences?.motive).toBeTruthy();
  });

  it('returns undefined for an unknown id', () => {
    expect(dossier('nobody')).toBeUndefined();
  });
});

describe('isCandidate', () => {
  it('marks the characters who have a council case', () => {
    const ids = rosterGroups('Other').flatMap((g) => g.members).filter(isCandidate).map((n) => n.id);
    expect(ids).toContain('jhofre');
    expect(ids).toContain('joravin');
    expect(ids).not.toContain('valerie');
  });
});

describe('candidatesOf', () => {
  it('gives the Cattaneis two candidates and the Vascaris one', () => {
    expect(candidatesOf(factionById('cattanei')!).map((n) => n.id)).toEqual(['salvarri', 'xapiri']);
    expect(candidatesOf(factionById('vascari')!).map((n) => n.id)).toEqual(['jhofre']);
  });

  it('puts the faction head first', () => {
    expect(candidatesOf(factionById('academy')!)[0].id).toBe('atalia');
    expect(candidatesOf(factionById('cattanei')!)[0].id).toBe('salvarri');
  });
});

describe('actKey', () => {
  it('keys a whole slate by its faction and a lone contestant by their own id', () => {
    expect(actKey(['xapiri', 'salvarri'])).toBe('cattanei');
    expect(actKey(['salvarri'])).toBe('salvarri');
  });
});

describe('actName', () => {
  it('names a whole slate by its faction and anyone else by name', () => {
    expect(actName(['xapiri', 'salvarri'])).toBe('Cattanei Family');
    expect(actName(['salvarri'])).toBe('Salvarri Cattanei');
  });
});

describe('factionOnStage', () => {
  it('recognises a complete slate in any order and nothing less', () => {
    expect(factionOnStage(['xapiri', 'salvarri'])?.id).toBe('cattanei');
    expect(factionOnStage(['salvarri'])).toBeUndefined();
    expect(factionOnStage([])).toBeUndefined();
    expect(factionOnStage(['jhofre'])?.id).toBe('vascari');
  });
});
