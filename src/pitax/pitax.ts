export type Group = 'faction' | 'council' | 'court' | 'city';

export interface Npc {
  id: string;
  name: string;
  stats?: string;
  role: string;
  group: Group;
  faction?: string;
  location?: string;
  fate?: 'Deceased' | 'Disbanded' | 'Unknown' | 'In hiding';
  /** Basename in source art/tokens and/or source art/portraits; either folder may lack it. */
  art?: string;
}

export interface Faction {
  id: string;
  name: string;
  type: 'Bandit House' | 'Criminals' | 'Faith' | 'Artists';
  colors: string;
  symbol: string;
  clothing: string;
  base: string;
  allies: string[];
  enemies: string[];
  summary: string;
}

export interface Location {
  code: string;
  name: string;
  npcs: string[];
  factions: string[];
  structures: string[];
  note: string;
}

// Ordered by approximate power and influence on the new council, strongest first.
export const factions: Faction[] = [
  {
    id: 'vascari',
    name: 'Vascari Family',
    type: 'Bandit House',
    colors: 'Light blue',
    symbol: 'Blue heron',
    clothing: 'Blue tabard with large collar',
    base: 'B3',
    allies: ['cattanei'],
    enemies: ['strocalle', 'dealers'],
    summary:
      'Controls river trade, so every sailor owes them some loyalty. Jhofre backs Valerie’s council in exchange for its river trade, though the city still treats him as an outsider. Joravin Pyathe’s tariff office is the one check on the Vascari schedule, and the house wants it gone.',
  },
  {
    id: 'calistrians',
    name: 'Calistrians',
    type: 'Faith',
    colors: 'Black, yellow',
    symbol: 'Three daggers',
    clothing: 'Religious raiment',
    base: 'B13',
    allies: ['cattanei', 'desnans'],
    enemies: ['strocalle', 'dealers'],
    summary:
      'The oldest and strongest faith in Pitax, housed in the original Cattanei keep. Many Pitaxians credit Irovetti’s death to Calistria’s vengeance, and Drey Yarness’s followers want him on the council.',
  },
  {
    id: 'liacenza',
    name: 'Liacenza Family',
    type: 'Bandit House',
    colors: 'Dark red',
    symbol: "Fox's head",
    clothing: 'Left glove with a dark red mark',
    base: 'B18',
    allies: [],
    enemies: ['strocalle', 'dealers'],
    summary:
      'Once the richest house, until Irovetti swindled them out of the Iron Fox Trade House and the crown. Lothaire and Berengar died in the Black Cells, and young Gasperre leads what remains, including the Sarain vineyards.',
  },
  {
    id: 'strocalle',
    name: 'Strocalle Family',
    type: 'Bandit House',
    colors: 'Purple',
    symbol: 'Cracked coin',
    clothing: 'Long sash attached to belt',
    base: 'B10',
    allies: ['dealers'],
    enemies: ['liacenza', 'cattanei', 'vascari', 'calistrians'],
    summary:
      'Controls land trade and has the closest ties to the criminal element. Eliste helped put Irovetti on the throne, and palace papers that name her now threaten the house’s council seat.',
  },
  {
    id: 'cattanei',
    name: 'Cattanei Family',
    type: 'Bandit House',
    colors: 'Green',
    symbol: 'Coiled snake',
    clothing: 'Black vest with green thread',
    base: 'B9',
    allies: ['calistrians', 'vascari'],
    enemies: ['strocalle'],
    summary:
      'Founders of Pitax, now the poorest house. Salvarri claims first place on the council as heir of the Silver Fox, while Xapiri Yasmina holds the controlling stake in their trade house.',
  },
  {
    id: 'dealers',
    name: 'Dealers of Pitax',
    type: 'Criminals',
    colors: 'Gray',
    symbol: 'Two X marks',
    clothing: 'Long coat with hidden pouches',
    base: 'B6',
    allies: ['strocalle'],
    enemies: ['desnans', 'calistrians', 'vascari', 'liacenza'],
    summary:
      'A coalition of drug dealers, alchemists, and crooked merchants. Irovetti protected them for a cut, and with the king dead, palace ledgers of those payments leave them hunting for a new protector.',
  },
  {
    id: 'academy',
    name: 'Academy of the Arts',
    type: 'Artists',
    colors: 'Red, black',
    symbol: 'Crescent',
    clothing: 'Gaudy blue and purple outfits',
    base: 'B19',
    allies: [],
    enemies: [],
    summary:
      'Irovetti’s art school and the Red Crescent Troupe, both built with crown money and now joined as one faction. Atalia Gitaren leads them from the Academy, Asmeranda Ilata has broken away to found the Free Artists’ Guild, and the council now holds the theater’s debt and the Academy’s purse.',
  },
  {
    id: 'desnans',
    name: 'Desnans',
    type: 'Faith',
    colors: 'Blue, white',
    symbol: 'Butterfly',
    clothing: 'Religious raiment',
    base: 'B8',
    allies: ['calistrians'],
    enemies: ['dealers'],
    summary:
      'A small congregation that arrived a year before Irovetti and quietly helped the oppressed. They now tend the king’s victims and hope to bless the new council.',
  },
  {
    id: 'guild',
    name: 'Free Artists’ Guild',
    type: 'Artists',
    colors: 'Gold, white',
    symbol: 'Open birdcage',
    clothing: 'Gold ribbon tied at the throat',
    base: 'B12',
    allies: ['desnans'],
    enemies: [],
    summary:
      'Street players, tavern singers and Red Crescent rebels who followed Asmeranda Ilata out of the troupe. She argues that the Academy speaks for the halls Irovetti paid for, and that the artists who work the streets need a council voice of their own.',
  },
];

export const npcs: Npc[] = [
  { id: 'salvarri', name: 'Salvarri Cattanei', stats: 'N male human bard 8', role: 'Head of the Cattanei house', group: 'faction', faction: 'cattanei', location: 'B9', art: 'salvarri-cattanei' },
  { id: 'xapiri', name: 'Xapiri Yasmina', stats: 'LE female human sorcerer 10', role: 'Chelish exile who controls the Serpent’s Breath Trade House', group: 'faction', faction: 'cattanei', location: 'B9', art: 'xapiri-yasmina' },
  { id: 'gasperre', name: 'Gasperre Liacenza', stats: 'N male human aristocrat 5', role: 'Young head of the Liacenza house; owns the Falling Star', group: 'faction', faction: 'liacenza', location: 'B18', art: 'gasperre-liacenza' },
  { id: 'eliste', name: 'Eliste Strocalle', stats: 'NE female human rogue 8', role: 'Head of the Strocalle house; secret ally of Irovetti', group: 'faction', faction: 'strocalle', location: 'B10', art: 'eliste-strocalle' },
  { id: 'jhofre', name: 'Jhofre Vascari', stats: 'LN male human rogue 9', role: 'Head of the Vascari house', group: 'faction', faction: 'vascari', location: 'B3', art: 'jhofre-vascari' },
  { id: 'kharne', name: 'Kharne Vareel', stats: 'NE male gnome rogue 13', role: 'Ringleader of the Dealers', group: 'faction', faction: 'dealers', location: 'B6', art: 'kharne-vereel' },
  { id: 'drey', name: 'Drey Yarness', stats: 'CN male human cleric of Calistria 10', role: 'High priest of Calistria', group: 'faction', faction: 'calistrians', location: 'B13', art: 'drey-yarness' },
  { id: 'ghare', name: 'Ghare Leotos', stats: 'CG male human cleric of Desna 6', role: 'High priest of Desna', group: 'faction', faction: 'desnans', location: 'B8', art: 'ghare-leotos' },
  { id: 'atalia', name: 'Atalia Gitaren', stats: 'NG female half-elf bard 12', role: 'Headmistress of the Academy of the Arts', group: 'faction', faction: 'academy', location: 'B19', art: 'atalia-gitaren' },
  { id: 'atlee', name: 'Atlee Quinge', stats: 'NG female human bard 7', role: 'Director of the Red Crescent Troupe', group: 'faction', faction: 'academy', location: 'B17', art: 'atlee-quinge' },
  { id: 'asmeranda', name: 'Asmeranda Ilata', role: 'Star singer, freed from the palace; founder of the Free Artists’ Guild', group: 'faction', faction: 'guild', location: 'B12', art: 'asmeranda-ilata' },

  { id: 'valerie', name: 'Valerie', stats: 'LN female human fighter', role: 'Regent of Pitax for Nova Valoria', group: 'council', location: 'B15', art: 'valerie' },

  { id: 'irovetti', name: 'Castruccio Irovetti', stats: 'CE male human bard 16', role: 'Former king of Pitax', group: 'court', location: 'B15', art: 'castruccio-irovetti', fate: 'Deceased' },
  { id: 'koth', name: 'Villamor Koth', role: 'Captain of the Guard and royal bodyguard', group: 'court', location: 'B15', art: 'villamor-koth', fate: 'Deceased' },
  { id: 'jurrg', name: 'Avinash Jurrg', role: 'Onidoshi general of all Pitax’s armies', group: 'court', location: 'B15', art: 'general-avinash-jurrg', fate: 'Deceased' },
  { id: 'alasen', name: 'Alasen', role: 'Weretiger leader of the Catspaw Marauders; Irovetti’s palace guest', group: 'court', location: 'B15', art: 'alasen', fate: 'Unknown' },
  { id: 'engelidis', name: 'Engelidis', role: 'Naga consort; guards the lagoon and knows where Briar is hidden', group: 'court', location: 'B15', art: 'engelidis', fate: 'Deceased' },
  { id: 'nunzio', name: 'Nunzio Arpaia', stats: 'N male human royal guard', role: 'Pitax Warden; Rushlight master of ceremonies', group: 'court', art: 'nunzio-arpaia', fate: 'In hiding' },
  { id: 'velemandr', name: 'Velemandr', role: 'Royal messenger who carries the Rushlight invitation', group: 'court', art: 'velemandr', fate: 'In hiding' },
  { id: 'wardens', name: 'Pitax Wardens', role: 'City guard, based at the Iron Fox Armory', group: 'court', location: 'B4', art: 'pitax-warden', fate: 'Disbanded' },

  { id: 'annamede', name: 'Annamede Belavarah', stats: 'CN female human bard 13', role: 'Comedian and bard; took Irovetti’s patronage', group: 'court', location: 'B12', art: 'annamede-belavarah', fate: 'Unknown' },
  { id: 'cayid', name: 'Cayid Caconna', stats: 'CN male human artisan 10', role: 'Master sculptor; holds a stolen palace key', group: 'city', location: 'B16', art: 'cayid-caconna' },
  { id: 'roald', name: 'Roald Celinnas', stats: 'LN male human wizard 8', role: 'Owner of the Crow’s Feather inn and library', group: 'city', location: 'B11', art: 'roald-celinnas' },
  { id: 'ingras', name: 'Ingras Quill', stats: 'CG female human cheesemaker 5', role: 'Proprietor of the Turning Wheel; tracks palace patrols', group: 'city', location: 'B14', art: 'ingras-quill' },
  { id: 'joravin', name: 'Joravin Pyathe', stats: 'N male dwarf fighter 8', role: 'Shipmaster of the Yards; neutral arbiter', group: 'city', location: 'B5', art: 'joravin-pyathe' },
  { id: 'saufie', name: 'Saufie Cintost', stats: 'CN female human lightkeeper 5', role: 'Keeper of the eastern lighthouse', group: 'city', location: 'B1', art: 'saufie-cintost' },
  { id: 'duclarion', name: 'Madame Duclarion', stats: 'CN female human sorcerer 10', role: 'Keeper of the Rushlight Menagerie', group: 'city', art: 'madame-duclarion' },
  { id: 'ohka', name: 'The Ohka Brothers', stats: 'CN male ogre warriors', role: 'Duclarion’s menagerie handlers', group: 'city', art: 'ohka-brother-1' },
];

export const locations: Location[] = [
  { code: 'B1', name: 'The Devil’s Tusks', npcs: ['saufie'], factions: [], structures: [], note: 'Twin harbour lighthouses.' },
  { code: 'B2', name: 'Moondock', npcs: [], factions: [], structures: [], note: 'Four docks. A dockworker has seen clockwork parts and explosives bound for the palace.' },
  { code: 'B3', name: 'Riversong Trade House', npcs: ['jhofre'], factions: ['vascari'], structures: ['Waterfront'], note: 'River trade.' },
  { code: 'B4', name: 'Iron Fox Armory', npcs: ['wardens'], factions: [], structures: ['Barracks'], note: 'Former Liacenza trade house, now the Wardens’ base.' },
  { code: 'B5', name: 'The Dwarf’s Cave', npcs: ['joravin'], factions: [], structures: [], note: 'Tariff office.' },
  { code: 'B6', name: 'The Rose Tower', npcs: ['kharne'], factions: ['dealers'], structures: ['Alchemy Lab', 'Illicit Market'], note: 'Ruined lighthouse; drug laboratory.' },
  { code: 'B7', name: 'Tower of the Fallen', npcs: [], factions: ['calistrians'], structures: ['Graveyard'], note: 'Guard tower turned sepulcher; ghoul-infested.' },
  { code: 'B8', name: 'The Temple of Desna', npcs: ['ghare'], factions: ['desnans'], structures: ['Shrine'], note: 'Desna is the goddess of dreams, stars, travellers, and luck.' },
  { code: 'B9', name: 'Serpent’s Breath Trade House', npcs: ['salvarri', 'xapiri'], factions: ['cattanei'], structures: ['Guildhall'], note: 'Xapiri controls it.' },
  { code: 'B10', name: 'Darkwind Trade House', npcs: ['eliste'], factions: ['strocalle'], structures: ['Secure Warehouse'], note: 'Land trade.' },
  { code: 'B11', name: 'The Crow’s Feather', npcs: ['roald'], factions: [], structures: ['Inn'], note: 'Inn and city library. Roald has heard that palace figures change shape.' },
  { code: 'B12', name: 'The Common Square', npcs: ['annamede', 'asmeranda'], factions: ['guild'], structures: [], note: 'Fountain of Sorrows, stocks, and yardarm.' },
  { code: 'B13', name: 'Calistria’s Cathedral', npcs: ['drey'], factions: ['calistrians'], structures: ['Cathedral'], note: 'Calistria is the goddess of lust, revenge, and trickery. Built from the original bandit keep.' },
  { code: 'B14', name: 'The Turning Wheel', npcs: ['ingras'], factions: [], structures: [], note: 'Butcher and cheese shop that supplies the palace.' },
  { code: 'B15', name: 'The Palace', npcs: ['valerie', 'irovetti', 'koth', 'jurrg', 'alasen', 'engelidis'], factions: [], structures: ['Palace'], note: 'The House of a Hundred Doors; see Part 5.' },
  { code: 'B16', name: 'Faces of Stone', npcs: ['cayid'], factions: [], structures: ['Specialized Artisan'], note: 'Sculptor’s shop; hidden compartments in the gargoyles.' },
  { code: 'B17', name: 'The Red Crescent Theater', npcs: ['atlee'], factions: ['academy'], structures: ['Theater'], note: 'Missing Diva quest.' },
  { code: 'B18', name: 'The Falling Star', npcs: ['gasperre'], factions: ['liacenza'], structures: ['Popular Tavern'], note: 'Rundown inn where conspirators meet.' },
  { code: 'B19', name: 'The Academy of the Arts', npcs: ['atalia'], factions: ['academy'], structures: ['Specialized Artisan'], note: 'Irovetti’s art school.' },
];

export const npcById = new Map(npcs.map((n) => [n.id, n]));

export const baseName = (f: Faction) => locations.find((l) => l.code === f.base)!.name;

const isCourt = (l: Location) => l.npcs.some((id) => npcById.get(id)!.group === 'court');

export const owners = (l: Location) =>
  l.factions.length
    ? l.factions.map((id) => factions.find((f) => f.id === id)!.name).join(', ')
    : isCourt(l)
      ? 'Regency'
      : '—';

const ownerRank = (l: Location) =>
  l.factions.length
    ? Math.min(...l.factions.map((id) => factions.findIndex((f) => f.id === id)))
    : factions.length + (isCourt(l) ? 0 : 1);

export const locationsByOwner = [...locations].sort((a, b) => ownerRank(a) - ownerRank(b));
