# Pitax Has Got Talent

A Foundry VTT v14 module for the Pitax council arc of *Kingmaker*. The faction representatives audition on a talent-show stage. Four players sit as judges, and each can buzz a contestant off with a red X.

## Running the show

1. Import the **Pitax Has Got Talent** Adventure. It adds the stage scene and two macros.
2. View the stage scene. The **Talent Director** opens for the GM.
3. Assign a player to each of the four judge seats.
4. Pick a faction, select a character, and press **Bring On**. A double-click on a card does the same. The portrait walks forward from the central archway, and the GM-only **Contestant Dossier** opens beside the Director.
5. Each seated player has an X button above the hotbar. Pressing it lights that judge's X on the stage for everyone and plays the buzzer. An X stays lit until the GM brings on the next contestant or presses **Reset X's**.
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
