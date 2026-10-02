# Pitax Has Got Talent

A Foundry VTT v14 module for the Pitax council arc of *Kingmaker*. The faction representatives audition on a talent-show stage. Four players sit as judges, and each can buzz a contestant off with a red X.

## Running the show

1. Import the **Pitax Has Got Talent** Adventure. It adds the stage scene and two macros.
2. View the stage scene. The **Talent Director** opens for the GM.
3. Assign a player to each of the four judge seats under the X's. The chair button folds the seat pickers away.
4. Open the **Cast** tab and click a character. The **Dossier** tab shows their notes and a **Bring On** button. The walking-figure button on a cast card brings that character on directly. The portrait walks forward from the central archway.
5. Each seated player has an X button above the hotbar. Pressing it lights that judge's X on the stage for everyone and plays the buzzer. The GM lights any X by clicking it in the Director, and the undo arrow on a lit X takes it back. An X stays lit until the GM takes it back, brings on the next contestant or presses **Reset X's**.
6. Four X's end the act: the stage dims and the contestant retreats into the archway.

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
