import type { Page } from '@playwright/test';
import { test, expect, joinAs, MODULE_ID } from './fixtures/foundry-clients';

let sceneId = '';
let playerId = '';
let playerPage: Page | undefined;

const BUZZER = `modules/${MODULE_ID}/assets/audio/buzzer.ogg`;

test.describe('Talent stage', () => {
  test.beforeAll(async ({ gmPage }) => {
    ({ sceneId, playerId } = await gmPage.evaluate(
      async (id) => {
        const g = (window as any).game;
        for (const doc of [...g.users, ...g.scenes].filter((d: any) => d.name.startsWith('__e2e_'))) await doc.delete();
        const user = await g.users.documentClass.create({ name: '__e2e_judge', role: 1 });
        const pack = g.packs.get(`${id}.${id}`);
        const [adventure] = await pack.getDocuments();
        const data = [...adventure.scenes][0].toObject();
        delete data._id;
        const scene = await g.scenes.documentClass.create({ ...data, name: '__e2e_stage', folder: null });
        await scene.activate();
        return { sceneId: scene.id as string, playerId: user.id as string };
      },
      MODULE_ID,
    ));
    await gmPage.waitForFunction((id) => (window as any).canvas?.scene?.id === id, sceneId);
  });

  test.afterAll(async ({ gmPage }) => {
    await playerPage?.context().close();
    await gmPage.evaluate(
      async ({ sceneId, playerId }) => {
        const g = (window as any).game;
        await g.scenes.get(sceneId)?.delete();
        await g.users.get(playerId)?.delete();
      },
      { sceneId, playerId },
    );
  });

  test('a seated player X lights for everyone and the dossier stays GM-only', async ({ gmPage, browser }) => {
    const director = gmPage.locator(`#${MODULE_ID}-director`);
    await expect(director).toBeVisible();

    await director.locator('.seat select').first().selectOption(playerId);
    await director.getByRole('button', { name: 'Jhofre Vascari' }).click();
    await director.getByRole('button', { name: 'Bring On' }).click();
    await expect(gmPage.locator(`#${MODULE_ID}-dossier`)).toContainText('Head of the Vascari house');

    playerPage = await (await browser.newContext()).newPage();
    await joinAs(playerPage, playerId);
    await playerPage.waitForFunction((id) => (window as any).canvas?.scene?.id === id, sceneId);
    await closeWindows(playerPage);

    await spyOnBuzzer(gmPage);
    await spyOnBuzzer(playerPage);

    const button = playerPage.locator('.x-button');
    await expect(button).toBeEnabled();
    await button.click();
    await expect(button).toHaveClass(/lit/);
    await expect(button).toBeDisabled();

    const votes = () =>
      gmPage.evaluate(
        ({ id, sceneId }) => (window as any).game.scenes.get(sceneId).getFlag(id, 'state').votes,
        { id: MODULE_ID, sceneId },
      );
    await expect.poll(votes).toEqual([true, false, false, false]);
    await expect(director.locator('.seat img').first()).toHaveAttribute('src', /x-on/);
    for (const page of [gmPage, playerPage]) await expect.poll(() => buzzes(page)).toEqual([BUZZER]);
    expect(await gmPage.evaluate(async (src) => (await fetch(src)).ok, BUZZER)).toBe(true);

    await expect(playerPage.locator(`#${MODULE_ID}-dossier`)).toHaveCount(0);
    await expect(playerPage.locator(`#${MODULE_ID}-director`)).toHaveCount(0);

    await director.getByRole('button', { name: 'Bring On' }).click();
    await expect.poll(votes).toEqual([false, false, false, false]);
    await expect(button).toBeEnabled();

    await closeWindows(gmPage);
    await gmPage.waitForTimeout(3500);
    await test.info().attach('stage-gm', { body: await gmPage.screenshot(), contentType: 'image/png' });
    await test.info().attach('stage-player', { body: await playerPage.screenshot(), contentType: 'image/png' });
  });
});

async function spyOnBuzzer(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as any;
    const helper = w.foundry.audio.AudioHelper;
    const play = helper.play;
    w.__buzzes = [];
    helper.play = function (data: { src: string }, ...rest: unknown[]) {
      w.__buzzes.push(data.src);
      return play.call(this, data, ...rest);
    };
  });
}

const buzzes = (page: Page): Promise<string[]> => page.evaluate(() => (window as any).__buzzes);

async function closeWindows(page: Page): Promise<void> {
  await page.evaluate(async () => {
    for (const app of [...(window as any).foundry.applications.instances.values()]) {
      if (app.options?.window?.frame !== false) await app.close();
    }
  });
}
