export interface Consequences {
  motive: string;
  seated: string[];
  refused: string[];
  conflicts: string[];
}

export const consequences: Record<string, Consequences> = {
  salvarri: {
    motive: 'He needs Xapiri Yasmina out of the Serpent’s Breath before her revenue stops, and he will trade his vote to anyone who helps him do it.',
    seated: [
      'He presses the council to seize the Serpent’s Breath for “Chelish crimes,” and its first vote decides whether it can take a house’s property.',
      'Eliste Strocalle offers to ruin Xapiri in exchange for his vote, and he takes the meeting.',
      'He backs Valerie against the Strocalles on every vote, and Eliste marks him as the weakest house to break.',
    ],
    refused: [
      'He withdraws his support and calls the council a Brevic occupation of the city his ancestor founded.',
      'He sells Xapiri the rest of his stake to pay his debts. She now holds the Cattanei name and its claim to a seat.',
      'He writes a ballad of the Silver Fox’s cheated heirs, and the taverns sing it at council sessions.',
      'Drey Yarness takes the snub as an insult to the old Cattanei keep and cools toward Valerie.',
    ],
    conflicts: [
      'Xapiri Yasmina: the Cattanei hold one seat. Seat either, and the other works against the council.',
      'Eliste Strocalle: he walks out if she sits, unless she has already bought his vote.',
    ],
  },
  xapiri: {
    motive: 'She wants the council as a laboratory. A seat lets her test her theory that infernal blood makes better rulers on the people who rule Pitax.',
    seated: [
      'She keeps notes ranking each councillor’s fitness to rule by bloodline. A stolen page would scandalize the council.',
      'Word reaches Cheliax. A House Thrune envoy arrives within months to demand her return, and Valerie must choose between a councillor and a quarrel with an empire.',
      'She claims Irovetti’s palace library for “council research,” and Roald Celinnas closes the Crow’s Feather to anyone who sits with her.',
      'Salvarri Cattanei refuses to sit beside her and works against the council from outside.',
    ],
    refused: [
      'She strips the Serpent’s Breath of coin and lets it rot, and the Cattanei Family faces ruin before the year ends.',
      'She sells her sorcery to Eliste Strocalle in exchange for a back door to power.',
      'She takes a tiefling orphan from Troutmouth as her ward and her proof, and grooms the child in public as a future candidate for the council.',
      'If a staged Chelish sighting drives her out, she leaves the Serpent’s Breath books in chaos, and the council must settle the Cattanei stake.',
    ],
    conflicts: [
      'Salvarri Cattanei: one Cattanei seat, two claimants.',
      'Roald Celinnas: both want Irovetti’s library.',
    ],
  },
  gasperre: {
    motive: 'He wants the Liacenzas at the head of the council, and the conspirators who sheltered at the Falling Star expect rewards for the risks they took.',
    seated: [
      'He hands council posts to his Falling Star friends, and the other houses see a Liacenza court forming.',
      'The council voids the coerced deed. The last Wardens must leave the Iron Fox Armory, and some barricade themselves inside.',
      'Eliste Strocalle tests the inexperienced councillor first, and the narcotics in the Falling Star’s back booths become her lever.',
      'Jhofre Vascari reads a Liacenza seat as the old order’s return and slows every Sarain shipment in the schedule.',
    ],
    refused: [
      'The Falling Star shelters conspirators again, and the network that toppled Irovetti turns its talk toward Valerie.',
      'The Liacenza orchards hold back the harvest, and bread and wine prices climb before winter.',
      'He hires a masterless mercenary band to take the Iron Fox Armory by force.',
    ],
    conflicts: [
      'Eliste Strocalle: palace papers show she helped the king who killed his elders. He demands her arrest if she sits.',
      'Jhofre Vascari: the Liacenzas once ruled the docks, and Jhofre wants them for himself.',
    ],
  },
  eliste: {
    motive: 'She needs the seat to bury the palace papers that name her before Valerie reads them, and she holds blackmail on every other applicant.',
    seated: [
      'Within a month one councillor votes against their own interest, and her blackmail explains why.',
      'The palace papers that name her vanish from the archive, and the PCs find the gap.',
      'Kharne Vareel’s Dealers gain a protector at the table, and the Rose Tower’s market moves into daylight.',
      'The Liacenza, Cattanei and Vascari houses call the council bought, and Drey Yarness preaches Calistria’s vengeance against it.',
    ],
    refused: [
      'She spends her blackmail in one night, and pamphlets naming every applicant’s secrets cover the Common Square by morning.',
      'Darkwind caravans stop running, and food from the hinterland grows scarce.',
      'She sends Darkwind gold to Alasen. The Catspaw Marauders have a paymaster again; advance Alasen’s clock by 1.',
      'Irovetti loyalists in hiding gather at her secure warehouse and start calling themselves the true council.',
    ],
    conflicts: [
      'Gasperre Liacenza, Salvarri Cattanei, Jhofre Vascari and Drey Yarness: each of them is her enemy, and two threaten to walk out if she sits.',
      'Annamede Belavarah: she knows what Eliste did for Irovetti, and Eliste wants her silenced.',
    ],
  },
  temur: {
    motive: 'A Warden out of uniform is a man the city can hang. He needs the council to keep his men armed, paid and pardoned.',
    seated: [
      'Wardens patrol every district within the week, and crime falls wherever they walk.',
      'The stocks and the yardarm in the Common Square fill again, and the city whispers that Irovetti’s law has returned.',
      'Ingras Quill reads her journal of Warden faces aloud in the Common Square, and her son’s killers stand among the council’s new enforcers.',
      'Valerie praises the quiet streets, and Drey Yarness asks in session whether she has forgotten the Black Cells.',
    ],
    refused: [
      'He marches his unit out of the Iron Fox Armory at dawn and takes its stores with him.',
      'The Wardens turn bandit on the roads around Pitax and tax every caravan for “protection,” and the Darkwind and Sarain wagons stop running.',
      'He gathers Avinash Jurrg’s unpaid mercenaries under his banner, and the countryside has an army again; advance Temur’s clock by 1.',
      'The streets stay unguarded, and crime keeps spiking until the council raises a guard of its own.',
    ],
    conflicts: [
      'Gasperre Liacenza: both claim the Iron Fox Armory. Seat both, and the council must evict one of them.',
      'Ingras Quill: she wants his men hanged, and her journal names them.',
      'Asmeranda Ilata: her testimony about the Black Cells condemns the men he commands.',
    ],
  },
  jhofre: {
    motive: 'He plans to squeeze rival shippers once he holds the river, and he wants Joravin Pyathe gone so the Vascaris set the tariffs as well as the schedule.',
    seated: [
      'Ships arrive on schedule, and dock revenue climbs in the first season.',
      'He moves within the month to fold Joravin Pyathe’s tariff office into the Riversong Trade House.',
      'Rival shippers lose their import slots and turn to smuggling, and Saufie Cintost reports unmarked lights off the Devil’s Tusks.',
    ],
    refused: [
      'He withdraws his support for Valerie, and she loses her one ally among the old houses.',
      'Riversong holds every council cargo for “inspection,” and the city’s grain arrives weeks late.',
      'He takes his contacts down the Sellen, and a rival River Kingdom offers to buy Pitax’s river trade outright.',
    ],
    conflicts: [
      'Joravin Pyathe: seat both, and every dock dispute becomes a council fight.',
      'Kharne Vareel: the Dealers’ smugglers move through his docks, and he wants them out.',
    ],
  },
  kharne: {
    motive: 'He needs a new protector before anyone reads the palace ledgers of his “sin tax,” and he is already courting Eliste Strocalle.',
    seated: [
      'Valerie must sign the treasury’s first receipt from a drug lord, and Ghare Leotos denounces the council from the temple steps.',
      'The Vascari, Liacenza and Calistrian applicants walk out of the first session together.',
      'Rose Tower alchemists supply alchemist’s fire for the war machines on the city walls.',
    ],
    refused: [
      'He sells the Dealers to Eliste Strocalle as her street army; advance Eliste’s clock by 1.',
      'He buys a seated councillor’s voice anyway, and Dealer coin turns up in a respectable house’s accounts.',
      'Cheap tinctures flood Troutmouth, and crime spikes in streets with no guard.',
      'A tainted batch sickens the crowd at Ghare Leotos’s first festival, and the Dealers blame the council’s raids.',
    ],
    conflicts: [
      'Ghare Leotos: the Desnan asks the council to act against the Dealers. Seat both, and every session is a trial.',
      'Eliste Strocalle: seat her, and Kharne needs no seat of his own.',
    ],
  },
  drey: {
    motive: 'His followers want him to rule Pitax, and he has let them talk. A single seat is a first step for him.',
    seated: [
      'His followers chant “Yarness for regent” outside the palace, and a Calistrian circle begins to plan for it.',
      'Former Wardens turn up dead in the Tower of the Fallen graveyard. Ingras Quill calls it justice; Valerie calls it murder.',
      'He knows the city’s secrets and trades them in session, and the other councillors learn to fear his questions.',
    ],
    refused: [
      'He preaches that Calistria judged Irovetti and now judges the council, and wasps nest in the palace eaves within the week.',
      'He tells the city about Valerie’s blasphemy against Shelyn, and her honor becomes tavern gossip.',
      'His followers press him to rule outside the council; advance Drey’s clock by 1.',
    ],
    conflicts: [
      'Eliste Strocalle: he knows what she did for Irovetti and will say it in session.',
      'Valerie: his sharp tongue and her decorum clash at every session.',
    ],
  },
  ghare: {
    motive: 'He has no hidden agenda. His younger clergy want the Dealers gone faster than he does, and they have stopped waiting for permission.',
    seated: [
      'A festival of Desna blesses the council in the Common Square, and the city celebrates the new order.',
      'The council’s first act targets the Dealers, and Kharne Vareel marks the old priest’s temple.',
      'Sailors start lighting candles at the Temple of Desna for safe passage, and the congregation grows.',
    ],
    refused: [
      'He blesses the council anyway, and the city notices that it turned away the one applicant who asked nothing for himself.',
      'Young Desnan clergy raid the Rose Tower themselves, and one of them dies there.',
      'Eliste Strocalle offers to fund his festival, and the Darkwind’s purple hangs beside Desna’s butterflies.',
    ],
    conflicts: ['Kharne Vareel: Ghare will not sit at a table that tolerates the Dealers.'],
  },
  joravin: {
    motive: 'He carried out Irovetti’s arbitrary taxes and blamed the king for them. His records show which houses paid and which smuggled, and he keeps them as insurance.',
    seated: [
      'Tariffs reach the treasury in full for the first time since the war.',
      'He asks to hire the remaining Wardens as dock enforcers, and Ingras Quill demands to know which of them killed her son.',
      'His records show which houses smuggled under Irovetti, the Vascaris among them.',
    ],
    refused: [
      'Jhofre Vascari absorbs the tariff office within the season, and one house now sets both schedule and tariff.',
      'He resigns and gives his shipment records to Gasperre Liacenza, the heir of the brothers who appointed him.',
      'With no arbiter on Moondock, a quarrel between Strocalle and Liacenza crews ends in a knife fight.',
    ],
    conflicts: ['Jhofre Vascari: seat both, and every dock dispute becomes a council fight.'],
  },
  atalia: {
    motive: 'The Academy cannot pay its staff without council money, and she needs the purse before the students learn how close it is to closing.',
    seated: [
      'She dismisses the hack faculty, and they paint mocking murals of Valerie across Troutmouth.',
      'The hidden works go on show, and patrons travel from across the River Kingdoms to see them.',
      'She presses the council to settle Cayid Caconna’s debt before any new commission.',
    ],
    refused: [
      'The Academy closes within the season, and her best students leave for Nova Valoria.',
      'The hack faculty seize the empty halls and crown one of their own headmaster.',
      'She hides the works again and lets the city believe Irovetti’s art was all Pitax ever made.',
    ],
    conflicts: [
      'Atlee Quinge: the Academy and the theater share one purse, and each wants it first.',
      'Asmeranda Ilata: both claim to speak for Pitax’s artists. Seat both, and the council funds a feud.',
    ],
  },
  atlee: {
    motive: 'Half her troupe served the king willingly, and the troupe splits if she fails to win the debt forgiveness.',
    seated: [
      'She wins Asmeranda Ilata back for one night to sing at the council’s opening, and the guild calls it a betrayal.',
      'The troupe stages Asmeranda’s testimony about the Black Cells, and the play names Nunzio Arpaia among the king’s servants.',
      'The Taldan patron sends a gift of costumes and a letter asking the council for a favor.',
    ],
    refused: [
      'The troupe splits, and the royalist half stages Irovetti’s old plays in the Common Square with Valerie as the villain.',
      'The last rebels follow Asmeranda Ilata to the Common Square, and the Red Crescent cannot cast a full play.',
      'The council seizes the Red Crescent for debt and owns a theater no one will perform in.',
    ],
    conflicts: [
      'Atalia Gitaren: the Academy and the theater share one purse, and each wants it first.',
      'Asmeranda Ilata: her guild takes the rebels Atlee needs to hold the troupe together.',
    ],
  },
  asmeranda: {
    motive: 'She wants the actors who served Irovetti off every stage in Pitax, and a guild of her own lets her decide who performs.',
    seated: [
      'The guild licenses street performers, and the royalist half of the troupe finds every stage closed to it.',
      'She testifies before the council about the Black Cells, and every name she gives becomes a council problem.',
      'Atalia Gitaren loses half her claim to speak for the city’s artists, and the Academy’s purse shrinks with it.',
      'Concerts fill the Common Square every evening, and the city sings about the PCs who freed her.',
    ],
    refused: [
      'She sings in the Common Square anyway, and her new songs mock a council that seats crown pensioners and turns away a prisoner of the Black Cells.',
      'Annamede Belavarah sends word from hiding and offers to share the Common Square stage.',
      'She accepts the Taldan patron’s offer and leaves Pitax, and the city blames the council for losing its voice.',
    ],
    conflicts: [
      'Atalia Gitaren: both claim to speak for Pitax’s artists. Seat both, and the council funds a feud.',
      'Atlee Quinge: Asmeranda’s guild splits the troupe Atlee is trying to save.',
    ],
  },
};
