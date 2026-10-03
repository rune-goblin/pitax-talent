export interface Problem {
  id: string;
  title: string;
  summary: string;
}

export const problems: Problem[] = [
  {
    id: 'armies',
    title: 'Masterless armies',
    summary:
      'Avinash Jurrg’s field armies are unpaid and have no commander. Some mercenary bands already raid the countryside, and the war machines on the city walls have no crews. Whoever pays these troops gains an army.',
  },
  {
    id: 'guard',
    title: 'No city guard',
    summary:
      'The Pitax Wardens have largely disbanded. Temur Ganbold keeps one loyal unit behind the Iron Fox Armory’s gates, and no one else patrols the streets. Crime is spiking across the city, and Joravin Pyathe has no one to enforce tariffs on the docks.',
  },
  {
    id: 'treasury',
    title: 'Empty treasury',
    summary:
      'Castruccio Irovetti bled the treasury dry to fund his war and his court. The council inherits his debts and has almost no coin to pay them.',
  },
  {
    id: 'crown-debts',
    title: 'Unpaid crown debts',
    summary:
      'Irovetti left commissions unpaid, and his creditors now look to the council. Cayid Caconna will come asking for payment for the sculptures he made for the crown.',
  },
  {
    id: 'no-law',
    title: 'No law',
    summary:
      'Pitax had no courts, only Irovetti’s word, and his law died with him. Now the law is whatever the street decides. When the party emptied the Black Cells, a few real criminals walked out beside his victims. Gasperre Liacenza wants the coerced Iron Fox deed voided, and every house that gained under the crown fears its own deeds come next.',
  },
  {
    id: 'reprisals',
    title: 'Reprisals',
    summary:
      'Citizens hunt anyone who served Irovetti: tax collectors, Wardens out of uniform, the artists he paid, the deserters’ families. Drey Yarness calls it Calistria’s vengeance. Ghare Leotos hides the accused in the Temple of Desna, and the palace’s rolls of informers would name hundreds more.',
  },
  {
    id: 'hunger',
    title: 'Hunger',
    summary:
      'The deserters hold the hills, and with them the farms and roads that fed the valley. The grain carts have stopped, so Pitax eats what comes downriver, which puts Jhofre Vascari’s boats in charge of the city’s bread.',
  },
  {
    id: 'refugees',
    title: 'Refugees',
    summary:
      'Farm families fleeing the hill raiders pour through the valley gates with nowhere to sleep. Ghare Leotos’s Desnans feed whom they can, and the walled trade houses refuse to open their warehouses.',
  },
  {
    id: 'neighbours',
    title: 'Circling neighbours',
    summary:
      'With Pitax’s army scattered, the neighbouring River Kingdoms see a city without defenders. Their envoys arrive offering alliances, loans and protection, each priced in the council’s independence.',
  },
];
