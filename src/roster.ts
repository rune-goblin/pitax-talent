import { factions, npcs, npcById, type Faction, type Npc } from './pitax/pitax';
import { portraitNames } from './pitax/portraits';
import { bios } from './pitax/bios';
import { backgrounds } from './pitax/backgrounds';
import { agendas, type Agenda } from './pitax/agendas';
import { cases, type CouncilCase } from './pitax/cases';
import { consequences, type Consequences } from './pitax/consequences';
import { MODULE_ID } from './constants';

export const OTHER = 'other';

export interface RosterGroup {
  id: string;
  name: string;
  members: Npc[];
}

const hasPortrait = (npc: Npc) => !!npc.art && portraitNames.has(npc.art);

/** The nine factions in council order, then everyone else with a portrait. */
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
