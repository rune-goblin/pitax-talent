import { factions, npcs, npcById, type Faction, type Npc } from './pitax/pitax';
import { portraitNames } from './pitax/portraits';
import { bios } from './pitax/bios';
import { backgrounds } from './pitax/backgrounds';
import { agendas, type Agenda } from './pitax/agendas';
import { cases, type CouncilCase } from './pitax/cases';
import { consequences, type Consequences } from './pitax/consequences';
import { MODULE_ID } from './constants';
import type { Verdict } from './state';

export const OTHER = 'other';

export interface RosterGroup {
  id: string;
  name: string;
  members: Npc[];
}

const hasPortrait = (npc: Npc) => !!npc.art && portraitNames.has(npc.art);

/** The factions in council order, then everyone else with a portrait. */
export function rosterGroups(otherName: string): RosterGroup[] {
  const staged = npcs.filter(hasPortrait);
  const groups = factions.map((f) => ({ id: f.id, name: f.name, members: staged.filter((n) => n.faction === f.id) }));
  groups.push({ id: OTHER, name: otherName, members: staged.filter((n) => !n.faction) });
  return groups.filter((g) => g.members.length);
}

export const portraitPath = (npc: Npc) => `modules/${MODULE_ID}/assets/portraits/${npc.art}.webp`;
export const thumbPath = (npc: Npc) => `modules/${MODULE_ID}/assets/portraits/thumbs/${npc.art}.webp`;

export interface Dossier {
  npc: Npc;
  faction?: Faction;
  bio?: string;
  background?: string;
  agenda?: Agenda;
  case?: CouncilCase;
  consequences?: Consequences;
}

export function dossier(id: string): Dossier | undefined {
  const npc = npcById.get(id);
  if (!npc) return undefined;
  return {
    npc,
    faction: factions.find((f) => f.id === npc.faction),
    bio: bios[id],
    background: backgrounds[id],
    agenda: agendas[id],
    case: cases[id],
    consequences: consequences[id],
  };
}

export const contestant = (id: string | null) => (id ? npcById.get(id) : undefined);

/** A council candidate is anyone with a case to make for a seat. */
export const isCandidate = (npc: Npc): boolean => npc.id in cases;

const leads = (npc: Npc) => /^(head|high priest|ringleader|founder)/i.test(npc.role);

/** The faction's slate: its candidates with portraits, who audition together with the leader first. */
export function candidatesOf(faction: Faction): Npc[] {
  const slate = npcs.filter((n) => n.faction === faction.id && hasPortrait(n) && isCandidate(n));
  return [...slate.filter(leads), ...slate.filter((n) => !leads(n))];
}

/** The faction whose whole slate is exactly these contestants, if any. */
export function factionOnStage(ids: string[]): Faction | undefined {
  if (!ids.length) return undefined;
  return factions.find((f) => {
    const slate = candidatesOf(f).map((n) => n.id);
    return slate.length === ids.length && slate.every((id) => ids.includes(id));
  });
}

/** What an act's verdict is saved under: the faction when its whole slate is on stage, else the contestants. */
export const actKey = (ids: string[]): string => factionOnStage(ids)?.id ?? ids.join('+');

export const factionById = (id: string): Faction | undefined => factions.find((f) => f.id === id);

/** What the verdict calls the act: its faction for a whole slate, else the contestants by name. */
export const actName = (ids: string[]): string =>
  factionOnStage(ids)?.name ?? ids.map((id) => contestant(id)?.name ?? id).join(' & ');

/** An act is petitioning for a council seat only when everyone in it has a case to make. */
export const petitions = (ids: string[]): boolean =>
  ids.length > 0 && ids.every((id) => {
    const npc = contestant(id);
    return !!npc && isCandidate(npc);
  });

export type Outcome = Verdict | 'accepted';

/** How the show words a verdict: an act with no seat at stake wins acceptance instead of an appointment. */
export const outcome = (kind: Verdict, ids: string[]): Outcome => (kind === 'appointed' && !petitions(ids) ? 'accepted' : kind);

/** The regent who casts the deciding vote on a tie. */
export const REGENT_ID = 'valerie';
