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
];
