export interface CouncilCase {
  pitch: string;
  offers: string[];
  asks: string[];
  hides: string[];
  probes: string[];
}

export const cases: Record<string, CouncilCase> = {
  salvarri: {
    pitch: '“My ancestor founded this city. Give the Cattaneis the first chair, and Pitax remembers what it was before bandits became merchants.”',
    offers: ['Founding-house legitimacy for the council', 'A bard’s skill at brokering between houses', 'Support for Valerie against the Strocalles'],
    asks: ['First chair on the council', 'Help removing Xapiri from the Serpent’s Breath'],
    hides: ['Xapiri controls the house’s money', 'The house cannot survive a year without her revenue'],
    probes: ['Society DC 35: the Serpent’s Breath books show Xapiri’s controlling stake', 'Ask who pays for his seat: he deflects to family honor (Perception DC 35 notices)'],
  },
  xapiri: {
    pitch: '“Pitax needs capital and a mind unclouded by old feuds. I bring both.”',
    offers: ['Serpent’s Breath revenue for the city treasury', 'Arcane counsel from a 10th-level sorcerer'],
    asks: ['The Cattanei seat in her own name', 'Freedom to continue her research'],
    hides: ['House Thrune exiled her for her research', 'Her research argues that infernal blood makes better rulers'],
    probes: ['Perception DC 35: she flinches at any mention of Cheliax', 'Arcana or Occultism DC 37: her notes concern infernal bloodlines and leadership', 'A staged sighting of Chelish agents (Deception DC 37) sends her fleeing Pitax'],
  },
  gasperre: {
    pitch: '“Irovetti murdered my family and stole our house. The Liacenzas ruled Pitax before him. We ask only for what was ours.”',
    offers: ['Sarain wine and orchard harvests to feed the city', 'The Falling Star’s network of former conspirators', 'A record of opposing Irovetti from the start'],
    asks: ['Return of the Iron Fox Trade House', 'Voiding of the deed Irovetti coerced from his elders', 'A council seat'],
    hides: ['He has never run the family’s trade', 'Drug users and informants still haunt his inn'],
    probes: ['Mercantile Lore DC 33: he stumbles over basic questions about the Iron Fox’s trade', 'Society DC 35: Joravin Pyathe’s tariff records support the Liacenza claim to the Iron Fox'],
  },
  eliste: {
    pitch: '“Every house bent the knee to Irovetti. I did it with my eyes open, and the Darkwind kept the roads running through the whole war.”',
    offers: ['Overland trade through the Darkwind Trade House', 'Order in the underworld through her contacts', 'Information on the other houses'],
    asks: ['A council seat', 'Amnesty for her dealings under Irovetti'],
    hides: ['Her scheming put Irovetti on the throne', 'Palace papers name her as his ally', 'She holds blackmail on the other applicants'],
    probes: ['Society DC 37 in the palace records: letters between Eliste and Irovetti', 'Perception DC 37: she lies about when she first met Irovetti', 'Intimidation DC 35: she offers blackmail on a rival to save herself'],
  },
  temur: {
    pitch: '“Since the king fell, your merchants hire knives to guard their doors and the Dealers sell in daylight. My Wardens kept these streets quiet under the old king. Give them back the law, and Pitax will sleep through the night by midwinter.”',
    offers: ['One unit of Wardens, garrisoned in Pitax under the council’s banner', 'Patrols on every street within the week, and an end to the crime wave', 'Steel behind Joravin Pyathe’s tariffs and the council’s rulings', 'Patrol records that name every informer, fence and smuggler in the city'],
    asks: ['A council seat and command of the city’s law', 'Amnesty for every Warden for acts done under Irovetti', 'The Iron Fox Armory as the Wardens’ barracks, whatever the Liacenza deed says', 'Wages for his men from the treasury'],
    hides: ['He signed the arrest warrants that filled the Black Cells', 'He buried the report on the killing of Ingras Quill’s son and kept the patrol in service', 'His men answer to him alone and will follow him out of the city if he goes'],
    probes: ['Society DC 35 in the palace archives: his signature on the Black Cells warrants', 'Ask Asmeranda Ilata: she knows his face from the Black Cells', 'Diplomacy DC 37 with his sergeant: the unit marches out with him if the council refuses'],
  },
  jhofre: {
    pitch: '“I have spent my life on the Sellen, far from Pitax’s feuds. Give me the river, and I will keep the city fed and paid.”',
    offers: ['Control of river trade and dock scheduling', 'Contacts along the Sellen River', 'Early and open support for Valerie'],
    asks: ['Council authority over river trade', 'A seat equal to the old houses'],
    hides: ['He plans to squeeze rival shippers once he holds the river', 'He wants Joravin Pyathe removed so the Vascaris set the tariffs as well as the schedule'],
    probes: ['Diplomacy DC 35: he admits the Vascaris would favor their own ships', 'Ask Joravin Pyathe: he knows which houses paid their tariffs'],
  },
  kharne: {
    pitch: '“Call us apothecaries. Pitax’s pain will outlast the war, and someone must supply the cure.”',
    offers: ['A cut of the trade for the treasury, as Irovetti took', 'Alchemical supplies for the city', 'Information from the streets'],
    asks: ['Toleration of the Dealers’ trade', 'A voice on the council, in person or through an ally'],
    hides: ['Palace ledgers record his “sin tax” payments to Irovetti', 'His tinctures fill the Temple of Desna with the desperate', 'He courts Eliste Strocalle as a new protector'],
    probes: ['Society DC 35 in the palace ledgers: regular payments to Irovetti', 'Medicine DC 35: his “cures” are the Rose Tower’s stupefying tinctures', 'Ask Ghare Leotos about the Dealers'],
  },
  drey: {
    pitch: '“Calistria took her vengeance on Irovetti, and the people know it. Give her temple a voice, and the people will trust this council.”',
    offers: ['The loyalty of Pitax’s largest congregation', 'Knowledge of the city’s secrets', 'Care of the sepulcher at the Tower of the Fallen'],
    asks: ['A council seat for the Calistrian faith', 'A promise that no Warden enters the cathedral'],
    hides: ['His followers want him to rule, and he has let them talk', 'His ambitions reach past a single seat'],
    probes: ['Perception DC 35: he enjoys the crowd’s talk of him ruling', 'Religion DC 33: nothing in Calistria’s dogma calls her priests to rule'],
  },
  ghare: {
    pitch: '“Desna’s faithful helped the oppressed when helping was dangerous. Let us bless this council and heal what Irovetti broke.”',
    offers: ['Healing and shelter for Irovetti’s victims', 'Festivals to lift the city’s spirits', 'An honest voice with no trade interests'],
    asks: ['A council voice for the smaller faiths', 'Action against the Dealers’ trade'],
    hides: [],
    probes: ['Ask about the Dealers: he names their victims in his temple'],
  },
  joravin: {
    pitch: '“Every crate that crosses those docks passes my scales. Give me the authority to enforce the law there, and the council will be paid what it is owed.”',
    offers: ['Tariff revenue for an empty treasury', 'Records of every house’s shipments', 'A neutral arbiter for disputes between the houses'],
    asks: ['Council authority over the docks and tariffs', 'Enforcers to back his rulings'],
    hides: ['He carried out Irovetti’s arbitrary taxes', 'Without guards, his rulings mean nothing'],
    probes: ['Society DC 35: his records show the Vascaris flagging rival ships for inspection', 'Ask Jhofre Vascari: he calls the tariff office a relic of the Liacenzas'],
  },
  atalia: {
    pitch: '“Irovetti filled our halls with hacks and our stage with filth. Fund the Academy and the Red Crescent, and Pitax will have art worth its liberation.”',
    offers: ['Hidden works by her best students, ready to show the city', 'The Red Crescent stage for public occasions', 'Commissions to celebrate the new council'],
    asks: ['Full control of the Academy and leave to dismiss the hack faculty', 'Council funding for the Academy', 'Forgiveness of the theater’s debt to the crown'],
    hides: ['Every coin the Academy spent came from the crown', 'Half the troupe served the king willingly'],
    probes: ['Society DC 35: the Academy’s accounts show it cannot pay its staff without the council', 'Ask Atlee Quinge: she admits the troupe’s schism'],
  },
  atlee: {
    pitch: '“The Red Crescent staged Irovetti’s filth because he owned us. Forgive the debt, and we will give Pitax a theater worth its name.”',
    offers: ['A free theater to celebrate the liberation', 'Asmeranda Ilata’s voice for public occasions', 'Performances for visiting dignitaries'],
    asks: ['Forgiveness of the theater’s debt to the crown', 'Council patronage for the troupe'],
    hides: ['Half her troupe served the king willingly', 'The troupe will split if she fails to win the debt forgiveness', 'Asmeranda Ilata has left the troupe, and Atlee still promises her voice'],
    probes: ['Diplomacy DC 35: she admits the schism', 'Ask Asmeranda Ilata: she names the actors who served the king'],
  },
  asmeranda: {
    pitch: '“The Academy speaks for the halls Irovetti built. I sang in Troutmouth taverns before any king paid me. Let the artists who work the streets speak for themselves.”',
    offers: ['Free performances in the Common Square to lift the city’s spirits', 'Her testimony about the Black Cells, given before the council', 'A voice the common people trust, untouched by crown money'],
    asks: ['A council voice for artists apart from the Academy', 'Licences for street performers and an end to Irovetti’s stage censorship', 'Justice against Gedovius and the actors who served the king'],
    hides: ['The Black Cells left her with nightmares, and some nights she cannot sing', 'She wants the actors who served the king driven from every stage in Pitax'],
    probes: ['Perception DC 33: her hands shake whenever anyone mentions Gedovius', 'Ask Atlee Quinge: she calls the split a betrayal, then admits Asmeranda has a point'],
  },
};
