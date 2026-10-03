# Pitax Has Got Talent

A Foundry VTT v14 module for the Pitax council arc of *Kingmaker*. The faction representatives audition on a talent-show stage. Four players sit as judges, and each can buzz a contestant off with a red X.

## Running the show

1. Import the **Pitax Has Got Talent** Adventure. It adds the stage scene and two macros.
2. View the stage scene. The **Talent Director** opens for the GM.
3. Assign a player to each of the four judge seats under the X's. The chair button folds the seat pickers away.
4. The **Council** tab lists the ten factions, each as one candidate ranked by influence. Bringing a faction on sends its whole slate out together (the Cattaneis and the Academy field two people each). Clicking a faction opens its dossier: the faction page, then each candidate's biography, council case, goal, position and consequences, one page per section. The goal page draws the candidate's progress clock as a pie: click a segment to fill up to it, or click the last filled segment to empty it. The **Cast** tab holds every character with a portrait for solo acts, and **Problems** lists what the council inherits.
   With a slate on stage, clicking a name in the strip at the top throws the spotlight on that contestant: the others shrink and dim until you click again.
5. Each seated player has an X button above the hotbar. Pressing it lights that judge's X on the stage for everyone and plays the buzzer. The GM lights any X by clicking it in the Director, and the undo arrow on a lit X takes it back. An X stays lit until the GM takes it back, brings on the next contestant or presses **Reset X's**.
6. The fourth vote ends the act. The contestants retreat into the archway and a banner at the top of every screen, the GM's and each player's, names the verdict. A majority of checks appoints a council petitioner to the council and accepts anyone else, such as a solo act from the Cast. A majority of X's rejects the act and dims the stage. On a two-two split Valerie breaks the tie. Her token appears on the stage, the banner tells everyone she decides, the GM's client rolls a d20 in chat, and over 10 wins. With Dice So Nice, her vote lands once the dice settle.

The **Show Talent Poster** macro opens the poster for everyone in Foundry's image window, which each viewer closes on their own.

The X row, contestant and vote button appear only on scenes that carry the `pitax-talent.stage` flag. The shipped scene has it.

## Buzzer

The module ships `assets/audio/buzzer.ogg`. `npm run sync` cuts it from the first 0.664 seconds of `source art/talent/audio.wav` in `pitax-factions` and needs `ffmpeg` on the path. Choose another sound under **Configure Settings → Pitax Has Got Talent**.

## Development

The character data and art come from the sibling `pitax-factions` repo. Refresh the committed copies after editing that repo:

```bash
npm run sync          # copies src/data/*.ts → src/pitax/, re-encodes portraits and the buzzer into assets/
npm run build         # packs + dist
npm test              # vitest: state reducer, walk pose, roster
TEST_WORLD=km-test npm run test:e2e   # GM + player in a headless Foundry on :30007
```

`npm run setup` scaffolds the dev module into your Foundry data folder. See `CLAUDE.md` and `.claude/skills/foundry-pf2e` for the shared runegoblin conventions.
