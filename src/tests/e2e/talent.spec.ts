import type { Page } from '@playwright/test';
import { test, expect, joinAs, MODULE_ID } from './fixtures/foundry-clients';

let sceneId = '';
let playerId = '';
let playerPage: Page | undefined;

const BUZZER = `modules/${MODULE_ID}/assets/audio/buzzer.ogg`;
const CHIME = `modules/${MODULE_ID}/assets/audio/bing.ogg`;

/** The vote each seat's mark shows on this client's canvas, once its pop or swap has settled. */
const shownVotes = (page: Page) =>
  page.evaluate((id) => {
    const row = (window as any).canvas.interface.getChildByName(id);
    return [0, 1, 2, 3].map((seat) => {
      const mark = row.getChildByName(`seat${seat}`);
      if (mark.getChildByName('check').scale.x > 0.99) return 'check';
      return mark.getChildByName('x').alpha > 0.99 ? 'x' : null;
    });
  }, MODULE_ID);

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

  test('a seated player X or check lights for everyone and the director stays GM-only', async ({ gmPage, browser }) => {
    // Headless Foundry renders in software at a few FPS, and this test walks the whole show.
    test.slow();
    const director = gmPage.locator(`#${MODULE_ID}-director`);
    await expect(director).toBeVisible();

    await director.locator('.seat select').first().selectOption(playerId);
    await director.getByRole('button', { name: 'Assign judges' }).click();
    await expect(director.locator('.seat select')).toHaveCount(0);
    await expect(director.locator('.judge').first()).toHaveText('__e2e_judge');
    await director.locator('.tabs').getByRole('tab', { name: 'Cast' }).click();
    await test.info().attach('director-cast', { body: await director.screenshot(), contentType: 'image/png' });
    await director.locator('[data-tab="cast"]').getByRole('button', { name: /^Jhofre Vascari/ }).click();
    const dossier = director.locator('.dossier');
    await expect(dossier).toContainText('Head of the Vascari house');
    await dossier.getByRole('button', { name: 'Bring On' }).click();
    await expect(dossier.locator('.status')).toHaveText('On stage');

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
    await expect.poll(votes).toEqual(['x', null, null, null]);
    for (const page of [gmPage, playerPage]) await expect.poll(() => shownVotes(page)).toEqual(['x', null, null, null]);
    await expect(playerPage.locator('.check-button')).toBeDisabled();
    await expect(director.locator('.seat img').first()).toHaveAttribute('src', /x-on/);
    for (const page of [gmPage, playerPage]) await expect.poll(() => buzzes(page)).toEqual([BUZZER]);
    expect(await gmPage.evaluate(async (src) => (await fetch(src)).ok, BUZZER)).toBe(true);

    await expect(playerPage.locator(`#${MODULE_ID}-director`)).toHaveCount(0);
    await test.info().attach('director-dossier', { body: await director.screenshot(), contentType: 'image/png' });

    await director.getByRole('button', { name: /^Take back/ }).click();
    await expect.poll(votes).toEqual([null, null, null, null]);
    await expect(button).toBeEnabled();

    const check = playerPage.locator('.check-button');
    await check.click();
    await expect(check).toHaveClass(/lit/);
    await expect(button).toBeDisabled();
    await expect.poll(votes).toEqual(['check', null, null, null]);
    for (const page of [gmPage, playerPage]) await expect.poll(() => shownVotes(page)).toEqual(['check', null, null, null]);
    await expect(director.locator('.seat img').first()).toHaveAttribute('src', /check/);
    for (const page of [gmPage, playerPage]) await expect.poll(() => buzzes(page)).toEqual([BUZZER, CHIME]);
    expect(await gmPage.evaluate(async (src) => (await fetch(src)).ok, CHIME)).toBe(true);

    await director.locator('.seat .light').nth(1).click();
    await director.locator('.seat').nth(2).locator('.approve').click();
    await expect.poll(votes).toEqual(['check', 'x', 'check', null]);
    for (const page of [gmPage, playerPage]) await expect.poll(() => shownVotes(page)).toEqual(['check', 'x', 'check', null]);
    await director.getByRole('button', { name: 'Reset votes' }).click();
    await expect.poll(votes).toEqual([null, null, null, null]);
    for (const page of [gmPage, playerPage]) await expect.poll(() => shownVotes(page)).toEqual([null, null, null, null]);
    await expect(playerPage.locator('.check-button img')).toHaveAttribute('src', /check-white/);

    const verdict = () =>
      gmPage.evaluate(({ id, sceneId }) => {
        const state = (window as any).game.scenes.get(sceneId).getFlag(id, 'state');
        return { act: state.act, saved: state.results[state.act] ?? null };
      }, { id: MODULE_ID, sceneId });
    await button.click();
    await director.locator('.seat .light').nth(1).click();
    await director.locator('.seat .light').nth(2).click();
    await expect.poll(async () => (await verdict()).saved).toBeNull();
    await director.locator('.seat').nth(3).locator('.approve').click();
    await expect.poll(verdict).toEqual({ act: 'vascari', saved: ['x', 'x', 'x', 'check'] });

    await dossier.getByRole('tab', { name: 'Council case' }).click();
    await expect(dossier).toContainText('I have spent my life on the Sellen');
    await dossier.getByRole('tab', { name: 'Biography' }).click();
    await expect(dossier).not.toContainText('I have spent my life on the Sellen');
    await director.locator('.tabs').getByRole('tab', { name: 'Council' }).click();
    await expect(director.locator('[data-tab="council"] .card')).toHaveCount(9);
    await test.info().attach('director-council', { body: await director.screenshot(), contentType: 'image/png' });
    await director.locator('[data-tab="council"] .card', { hasText: 'Cattanei Family' }).getByRole('button', { name: /^Bring on/ }).click();
    const flag = () =>
      gmPage.evaluate(({ id, sceneId }) => (window as any).game.scenes.get(sceneId).getFlag(id, 'state'), { id: MODULE_ID, sceneId });
    await expect.poll(async () => (await flag()).contestantIds).toEqual(['salvarri', 'xapiri']);
    await expect(dossier.locator('h2')).toHaveText('Cattanei Family');
    await dossier.getByRole('tab', { name: 'Council case' }).click();
    await expect(dossier.locator('.body h3')).toHaveCount(2);
    await test.info().attach('director-faction', { body: await director.screenshot(), contentType: 'image/png' });
    await director.locator('.strip .who', { hasText: 'Xapiri Yasmina' }).click();
    await expect.poll(async () => (await flag()).spotlightId).toBe('xapiri');
    await expect(dossier.locator('h2')).toHaveText('Xapiri Yasmina');
    await director.locator('.tabs').getByRole('tab', { name: 'Problems' }).click();
    await expect(director.locator('[data-tab="problems"] li')).toHaveCount(4);

    await closeWindows(gmPage);
    await gmPage.waitForTimeout(3500);
    // Fit the square stage into the wide viewport so the screenshots show the whole act.
    for (const page of [gmPage, playerPage]) {
      await page.evaluate(() => {
        const c = (window as any).canvas;
        const r = c.dimensions.sceneRect;
        return c.pan({ x: r.x + r.width / 2, y: r.y + r.height / 2, scale: Math.min(window.innerWidth / r.width, window.innerHeight / r.height) });
      });
    }
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
