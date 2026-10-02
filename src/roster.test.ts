import { describe, expect, it } from 'vitest';
import { dossier, OTHER, rosterGroups } from './roster';
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
