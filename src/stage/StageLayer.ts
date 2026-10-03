import { BUZZER_SETTING, CHECK, CHIME_SETTING, MODULE_ID, X_OFF, X_ON, X_ON_GLOW } from '../constants';
import { tf } from '../i18n';
import { actName, contestant, portraitPath, REGENT_ID } from '../roster';
import { allVoted, SEAT_COUNT, spotlight, tied, verdict, type TalentState, type Verdict, type Vote } from '../state';
import { mutate } from '../sync';
import { talent, watchState } from '../talentStore.svelte';
import { figureOffsets, LAYOUT, STAGE, stepBack, walkPose, xCenters } from './pose';

const { CanvasAnimation } = foundry.canvas.animation;
const { loadTexture } = foundry.canvas;
const { PreciseText } = foundry.canvas.containers;

const ENTRANCE_MS = 2600;
const EXIT_MS = 1400;
const WITHDRAW_MS = 2200;
const POP_MS = 380;
const SPOTLIGHT_MS = 450;
const GLOW_MS = 900;
// The white X shrinks over the first SHRINK of the swap; the check springs up from CHECK_FROM on.
const APPROVE_MS = 700;
const SHRINK = 0.3;
const CHECK_FROM = 0.2;
const DIM = 0.55;
const REFLECTION = 0.18;
// How far the rest of the slate shrinks and darkens when one contestant holds the spotlight.
const ASIDE_SCALE = 0.75;
const ASIDE_DIM = 0.45;
const REGENT_MS = 1100;
const VERDICT_MS = 1400;
// A callout springs up this far into its animation, once the vote that raised it has popped.
const CALLOUT_FROM = 0.3;
const FADE_MS = 400;
// Valerie's head and shoulders in her full-length portrait: centre as fractions of its size, radius of its width.
const REGENT_CROP = { x: 0.62, y: 0.19, r: 0.255 };
const VERDICT_LOOK = {
  appointed: { fill: '#f3d27a', line: 0xdcb463 },
  rejected: { fill: '#ffffff', line: 0xe2263f },
} as const;

interface Figure {
  id: string;
  root: PIXI.Container;
  sprite: PIXI.Sprite;
  reflection: PIXI.Sprite;
  /** A gilt nameplate with the contestant's name, hung just below their feet. */
  plate: PIXI.Container;
  /** 0 = sharing the stage, 1 = stepped aside for the spotlight. */
  aside: { f: number };
}

interface XMark {
  root: PIXI.Container;
  blank: PIXI.Container;
  lit: PIXI.Container;
  glow: PIXI.Sprite;
  check: PIXI.Container;
  name: PIXI.Text;
}

/** Valerie's token, shown while she breaks a tie, with her vote badged on it. */
interface Regent {
  root: PIXI.Container;
  mark: PIXI.Container;
  x: PIXI.Sprite;
  check: PIXI.Sprite;
}

interface Banner {
  root: PIXI.Container;
  card: PIXI.Graphics;
  label: PIXI.Text;
}

const SEAT_ANIMATIONS = ['pop', 'glow', 'approve'];
const CALLOUT_ANIMATIONS = ['regent', 'regentMark', 'verdict'];

/** The judge's character, first name only; falls back to the player's own name. */
function judgeName(userId: string | null): string {
  const user = userId ? game.users.get(userId) : undefined;
  if (!user) return '';
  return (user.character?.name ?? user.name).trim().split(/\s+/)[0];
}

/**
 * The contestant and the X row, drawn in world space on the interface group so they stay
 * pinned to the stage image when anyone pans or zooms.
 */
export class StageLayer {
  #root = new PIXI.Container();
  #dim = new PIXI.Graphics();
  #stage = new PIXI.Container();
  #figures: Figure[] = [];
  #marks: XMark[] = [];
  #regent!: Regent;
  #banner!: Banner;
  #nameStyle!: PIXI.TextStyle;
  #walk = { p: 0 };
  #shownIds = '';
  #rect!: PIXI.Rectangle;
  #k = 1;
  /** The state this layer last drew; each store change animates from it. */
  #shown?: TalentState;
  #unwatch?: () => void;

  static #current?: StageLayer;

  /** Builds the layer, then follows the talent store until destroyed. */
  static async draw(): Promise<void> {
    StageLayer.destroy();
    const layer = new StageLayer();
    StageLayer.#current = layer;
    await layer.#build();
    if (StageLayer.#current !== layer) return;
    canvas.interface!.addChild(layer.#root);
    layer.#unwatch = watchState((state) => layer.#render(state));
  }

  static destroy(): void {
    const layer = StageLayer.#current;
    StageLayer.#current = undefined;
    if (!layer) return;
    layer.#unwatch?.();
    CanvasAnimation.terminateAnimation(layer.#animName('walk'));
    // The check's swap drives its containers from ontick, which would throw once they're destroyed.
    layer.#marks.forEach((_, seat) => layer.#stopSeat(seat));
    for (const part of CALLOUT_ANIMATIONS) CanvasAnimation.terminateAnimation(layer.#animName(part));
    layer.#root.destroy({ children: true });
  }

  #animName = (part: string) => `${MODULE_ID}.${part}`;

  #x = (px: number) => this.#rect.x + px * this.#k;
  #y = (px: number) => this.#rect.y + px * this.#k;

  async #build(): Promise<void> {
    this.#rect = canvas.dimensions!.sceneRect;
    this.#k = this.#rect.width / STAGE.width;
    // Passive lets canvas clicks fall through everywhere except the GM's nameplates.
    this.#root.eventMode = 'passive';
    // Named so the e2e spec can read the vote row off the canvas.
    this.#root.name = MODULE_ID;

    this.#dim.beginFill(0x000000).drawRect(this.#rect.x, this.#rect.y, this.#rect.width, this.#rect.height).endFill();
    this.#dim.alpha = 0;

    // Decoding on the first press would delay that sound behind its mark.
    for (const key of [BUZZER_SETTING, CHIME_SETTING]) {
      const src = soundSrc(key);
      if (src) void foundry.audio.AudioHelper.preloadSound(src).catch(() => {});
    }

    const regent = contestant(REGENT_ID);
    const [textures, portrait] = await Promise.all([
      Promise.all([X_OFF, X_ON, X_ON_GLOW, CHECK].map((src) => loadTexture(src))),
      regent ? loadTexture(portraitPath(regent)) : null,
    ]);
    const size = LAYOUT.xRow.size * this.#k;
    this.#nameStyle = new PIXI.TextStyle({
      fontFamily: ['Eczar', 'Amiri', 'serif'],
      fontWeight: '600',
      fontSize: LAYOUT.xRow.nameSize * this.#k,
      fill: '#f3d27a',
      stroke: '#1a0a12',
      strokeThickness: 4 * this.#k,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 6 * this.#k,
      dropShadowDistance: 2 * this.#k,
      dropShadowAlpha: 0.8,
    });
    const judgeStyle = this.#nameStyle.clone();
    judgeStyle.fill = '#ffffff';
    this.#marks = xCenters(SEAT_COUNT).map((cx, seat) => {
      const root = new PIXI.Container();
      root.name = `seat${seat}`;
      root.eventMode = 'none';
      root.position.set(this.#x(cx), this.#y(LAYOUT.xRow.y));
      const [offSprite, onSprite, glowSprite, checkSprite] = textures.map((texture) => {
        const s = new PIXI.Sprite(texture as PIXI.Texture);
        s.anchor.set(0.5);
        s.width = s.height = size;
        return s;
      });
      glowSprite.alpha = 0;
      // Each layer pops by its container's scale, which leaves the sprite's own size-to-fit scale alone.
      const blank = new PIXI.Container();
      blank.addChild(offSprite);
      // Clearing a vote mid-pop hides the fading glow along with the X.
      const lit = new PIXI.Container();
      lit.name = 'x';
      lit.alpha = 0;
      lit.addChild(onSprite, glowSprite);
      const check = new PIXI.Container();
      check.name = 'check';
      check.scale.set(0);
      check.addChild(checkSprite);
      const name = new PreciseText('', judgeStyle);
      name.anchor.set(0.5, 0);
      name.position.set(0, (LAYOUT.xRow.nameY - LAYOUT.xRow.y) * this.#k);
      root.addChild(blank, lit, check, name);
      return { root, blank, lit, glow: glowSprite, check, name };
    });

    this.#regent = this.#buildRegent(portrait as PIXI.Texture | null, textures[1] as PIXI.Texture, textures[3] as PIXI.Texture);
    this.#banner = this.#buildBanner();
    this.#root.addChild(this.#dim, this.#stage, ...this.#marks.map((m) => m.root), this.#regent.root, this.#banner.root);
  }

  #buildRegent(portrait: PIXI.Texture | null, xTexture: PIXI.Texture, checkTexture: PIXI.Texture): Regent {
    const { y, size, captionY, markSize } = LAYOUT.regent;
    const r = (size / 2) * this.#k;
    const root = new PIXI.Container();
    root.name = 'regent';
    root.alpha = 0;
    root.position.set(this.#x(LAYOUT.centerX), this.#y(y));
    root.addChild(new PIXI.Graphics().beginFill(0x2c0914).drawCircle(0, 0, r).endFill());
    if (portrait) {
      const face = new PIXI.Sprite(portrait);
      face.anchor.set(REGENT_CROP.x, REGENT_CROP.y);
      face.scale.set(r / (REGENT_CROP.r * portrait.width));
      const mask = new PIXI.Graphics().beginFill(0xffffff).drawCircle(0, 0, r).endFill();
      face.mask = mask;
      root.addChild(face, mask);
    }
    const ring = new PIXI.Graphics().lineStyle(8 * this.#k, 0xdcb463, 1).drawCircle(0, 0, r);
    const caption = new PreciseText(tf('regent.decides', { name: contestant(REGENT_ID)?.name ?? REGENT_ID }), this.#nameStyle);
    caption.anchor.set(0.5, 0);
    caption.position.set(0, (captionY - y) * this.#k);
    const mark = new PIXI.Container();
    mark.position.set(r * Math.SQRT1_2, r * Math.SQRT1_2);
    const [x, check] = [xTexture, checkTexture].map((texture) => {
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.width = sprite.height = markSize * this.#k;
      return sprite;
    });
    mark.addChild(x, check);
    root.addChild(ring, caption, mark);
    return { root, mark, x, check };
  }

  #buildBanner(): Banner {
    const root = new PIXI.Container();
    root.name = 'verdict';
    root.alpha = 0;
    root.position.set(this.#x(LAYOUT.centerX), this.#y(LAYOUT.verdict.y));
    const style = this.#nameStyle.clone();
    style.fontSize = LAYOUT.verdict.size * this.#k;
    style.strokeThickness = 6 * this.#k;
    style.wordWrap = true;
    style.wordWrapWidth = LAYOUT.verdict.width * this.#k;
    style.align = 'center';
    const label = new PreciseText('', style);
    label.anchor.set(0.5);
    const card = new PIXI.Graphics();
    root.addChild(card, label);
    return { root, card, label };
  }

  #setBanner(state: TalentState, kind: Verdict): void {
    const { card, label } = this.#banner;
    const look = VERDICT_LOOK[kind];
    label.text = tf(`verdict.${kind}`, { name: actName(state.contestantIds) });
    label.style.fill = look.fill;
    const width = label.width + 120 * this.#k;
    const height = label.height + 50 * this.#k;
    card.clear().lineStyle(6 * this.#k, look.line, 1).beginFill(0x1a0a12, 0.9).drawRoundedRect(-width / 2, -height / 2, width, height, 18 * this.#k).endFill();
  }

  #render(next: TalentState): void {
    const prev = this.#shown;
    this.#shown = next;
    void (prev ? this.#transition(prev, next) : this.#show(next));
  }

  async #show(state: TalentState): Promise<void> {
    await this.#setContestants(state.contestantIds);
    for (const figure of this.#figures) figure.aside.f = asideFor(figure.id, state);
    this.#pose(state.contestantIds.length && !allVoted(state) ? 1 : 0);
    state.votes.forEach((vote, i) => this.#settle(i, vote));
    this.#label(state);
    const decided = verdict(state);
    this.#dim.alpha = decided === 'rejected' ? DIM : 0;
    this.#regent.root.alpha = tied(state) ? 1 : 0;
    this.#settleRegent(state.regent);
    if (decided) this.#setBanner(state, decided);
    this.#banner.root.alpha = decided ? 1 : 0;
  }

  #label(state: TalentState): void {
    state.seats.forEach((userId, i) => (this.#marks[i].name.text = judgeName(userId)));
  }

  async #transition(before: TalentState, after: TalentState): Promise<void> {
    after.votes.forEach((vote, i) => {
      if (vote === before.votes[i]) return;
      if (vote === 'x') this.#pop(i);
      else if (vote === 'check') this.#approve(i);
      else this.#settle(i, null);
    });
    this.#label(after);
    this.#callouts(before, after);

    const arrived = after.contestantIds.length && after.entrance !== before.entrance;
    if (arrived) {
      await this.#setContestants(after.contestantIds);
      await this.#animateWalk(0, 1, ENTRANCE_MS);
    } else if (!after.contestantIds.length && before.contestantIds.length) {
      await this.#animateWalk(this.#walk.p, 0, EXIT_MS);
      this.#stage.visible = false;
    } else if (after.spotlightId !== before.spotlightId) {
      this.#spotlight(after);
    } else if (allVoted(after) && !allVoted(before)) {
      await this.#animateWalk(this.#walk.p, 0, WITHDRAW_MS);
    } else if (!allVoted(after) && allVoted(before) && after.contestantIds.length) {
      await this.#animateWalk(this.#walk.p, 1, ENTRANCE_MS);
    }
  }

  /** The act withdraws as its verdict lands; on a tie Valerie's token comes up first and her vote settles it. */
  #callouts(before: TalentState, after: TalentState): void {
    const was = verdict(before);
    const now = verdict(after);
    if ((now === 'rejected') !== (was === 'rejected')) {
      if (now === 'rejected') this.#flashRow();
      this.#fadeDim(now === 'rejected' ? DIM : 0);
    }
    if (tied(after) !== tied(before)) this.#reveal(this.#regent.root, 'regent', tied(after), REGENT_MS);
    if (after.regent !== before.regent) {
      if (after.regent) this.#popRegent(after.regent);
      else this.#settleRegent(null);
    }
    if (now !== was) {
      if (now) this.#setBanner(after, now);
      this.#reveal(this.#banner.root, 'verdict', !!now, VERDICT_MS);
    }
  }

  /** Springs a callout up once the vote that raised it has popped, or fades it away. */
  #reveal(target: PIXI.Container, part: string, show: boolean, duration: number): void {
    const name = this.#animName(part);
    CanvasAnimation.terminateAnimation(name);
    if (!show) {
      void CanvasAnimation.animate([{ parent: target, attribute: 'alpha', to: 0 }], { name, duration: FADE_MS });
      return;
    }
    target.alpha = 1;
    target.scale.set(0);
    const swap = { t: 0 };
    void CanvasAnimation.animate([{ parent: swap, attribute: 't', to: 1 }], {
      name,
      duration,
      ontick: () => target.scale.set(bounce(clamp01((swap.t - CALLOUT_FROM) / (1 - CALLOUT_FROM)))),
    });
  }

  #settleRegent(vote: Vote | null): void {
    CanvasAnimation.terminateAnimation(this.#animName('regentMark'));
    const { mark, x, check } = this.#regent;
    mark.scale.set(vote ? 1 : 0);
    x.visible = vote === 'x';
    check.visible = vote === 'check';
  }

  #popRegent(vote: Vote): void {
    this.#settleRegent(vote);
    const { mark } = this.#regent;
    mark.scale.set(1.7);
    void CanvasAnimation.animate(
      [
        { parent: mark.scale, attribute: 'x', to: 1 },
        { parent: mark.scale, attribute: 'y', to: 1 },
      ],
      { name: this.#animName('regentMark'), duration: POP_MS, easing: 'easeOutCircle' },
    );
    playSound(vote === 'x' ? BUZZER_SETTING : CHIME_SETTING);
  }

  async #setContestants(ids: string[]): Promise<void> {
    const key = ids.join(',');
    this.#shownIds = key;
    for (const figure of this.#figures) figure.root.destroy({ children: true });
    this.#figures = [];
    this.#stage.visible = ids.length > 0;
    const loaded = await Promise.all(
      ids.map(async (id) => {
        const npc = contestant(id);
        const texture = npc ? ((await loadTexture(portraitPath(npc))) as PIXI.Texture | null) : null;
        return { id, texture };
      }),
    );
    if (this.#shownIds !== key) return;
    const pickable = game.user.isGM && ids.length > 1;
    for (const { id, texture } of loaded) {
      if (!texture) continue;
      const sprite = new PIXI.Sprite(texture);
      const reflection = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5, 1);
      reflection.anchor.set(0.5, 1);
      reflection.scale.y = -1;
      const plate = this.#nameplate(contestant(id)?.name ?? '');
      if (pickable) pickOnClick(plate, id);
      const root = new PIXI.Container();
      root.addChild(reflection, sprite, plate);
      this.#stage.addChild(root);
      this.#figures.push({ id, root, sprite, reflection, plate, aside: { f: 0 } });
    }
  }

  #nameplate(name: string): PIXI.Container {
    const plate = new PIXI.Container();
    const label = new PreciseText(name, this.#nameStyle);
    label.anchor.set(0.5, 0);
    const padX = 22 * this.#k;
    const padY = 6 * this.#k;
    const width = label.width + padX * 2;
    const height = label.height + padY * 2;
    const card = new PIXI.Graphics();
    card.lineStyle(3 * this.#k, 0xdcb463, 1).beginFill(0x1a0a12, 0.88).drawRoundedRect(-width / 2, -padY, width, height, 10 * this.#k).endFill();
    plate.addChild(card, label);
    plate.hitArea = new PIXI.Rectangle(-width / 2, -padY, width, height);
    return plate;
  }

  #pose(p: number): void {
    this.#walk.p = p;
    const pose = walkPose(p);
    const offsets = figureOffsets(this.#figures.length, pose.height);
    this.#figures.forEach((figure, i) => {
      const { root, sprite, reflection, plate, aside } = figure;
      // Hidden figures leave hit testing too, so a walked-off slate's plates can't catch clicks.
      root.visible = pose.alpha > 0;
      const tex = sprite.texture;
      const stood = stepBack(pose, 1 - (1 - ASIDE_SCALE) * aside.f);
      const height = stood.height * this.#k;
      const width = tex.height ? (height * tex.width) / tex.height : 0;
      const x = this.#x(LAYOUT.centerX + offsets[i]);
      const feet = this.#y(stood.feet);
      const tint = Math.round(pose.brightness * (1 - ASIDE_DIM * aside.f) * 255);
      sprite.position.set(x, feet);
      sprite.width = width;
      sprite.height = height;
      sprite.alpha = pose.alpha;
      sprite.tint = (tint << 16) | (tint << 8) | tint;
      reflection.position.set(x, feet);
      reflection.width = width;
      // PIXI's height setter keeps scale.y's sign, so the reflection stays flipped.
      reflection.height = height;
      reflection.alpha = pose.alpha * REFLECTION;
      reflection.tint = sprite.tint;
      plate.position.set(x, feet + LAYOUT.figureName.below * this.#k);
      plate.scale.set((LAYOUT.figureName.size / LAYOUT.xRow.nameSize) * (height / (LAYOUT.front.height * this.#k)));
      plate.alpha = pose.alpha * (1 - ASIDE_DIM * aside.f);
    });
  }

  #spotlight(state: TalentState): void {
    const attributes = this.#figures.map((figure) => ({ parent: figure.aside, attribute: 'f', to: asideFor(figure.id, state) }));
    if (!attributes.length) return;
    void CanvasAnimation.animate(attributes, {
      name: this.#animName('spotlight'),
      duration: SPOTLIGHT_MS,
      easing: 'easeInOutCosine',
      ontick: () => this.#pose(this.#walk.p),
    });
  }

  #animateWalk(from: number, to: number, duration: number): Promise<boolean> {
    this.#walk.p = from;
    this.#pose(from);
    return CanvasAnimation.animate([{ parent: this.#walk, attribute: 'p', to }], {
      name: this.#animName('walk'),
      duration,
      ontick: () => this.#pose(this.#walk.p),
    });
  }

  #fadeDim(to: number): void {
    void CanvasAnimation.animate([{ parent: this.#dim, attribute: 'alpha', to }], {
      name: this.#animName('dim'),
      duration: 700,
    });
  }

  #stopSeat(seat: number): void {
    for (const part of SEAT_ANIMATIONS) CanvasAnimation.terminateAnimation(this.#animName(`${part}${seat}`));
  }

  /** Snap a seat to its vote, cutting short any pop still playing there. */
  #settle(seat: number, vote: Vote | null): void {
    this.#stopSeat(seat);
    const mark = this.#marks[seat];
    mark.blank.scale.set(vote === 'check' ? 0 : 1);
    mark.lit.alpha = vote === 'x' ? 1 : 0;
    mark.lit.scale.set(1);
    mark.glow.alpha = 0;
    mark.check.scale.set(vote === 'check' ? 1 : 0);
  }

  #pop(seat: number): void {
    this.#settle(seat, null);
    const mark = this.#marks[seat];
    mark.lit.alpha = 1;
    mark.glow.alpha = 1;
    mark.lit.scale.set(1.7);
    void CanvasAnimation.animate(
      [
        { parent: mark.lit.scale, attribute: 'x', to: 1 },
        { parent: mark.lit.scale, attribute: 'y', to: 1 },
      ],
      { name: this.#animName(`pop${seat}`), duration: POP_MS, easing: 'easeOutCircle' },
    );
    void CanvasAnimation.animate([{ parent: mark.glow, attribute: 'alpha', to: 0 }], {
      name: this.#animName(`glow${seat}`),
      duration: GLOW_MS,
    });
    playSound(BUZZER_SETTING);
  }

  /** The white X shrinks away and the check springs up in its place. */
  #approve(seat: number): void {
    this.#settle(seat, null);
    const mark = this.#marks[seat];
    const swap = { t: 0 };
    void CanvasAnimation.animate([{ parent: swap, attribute: 't', to: 1 }], {
      name: this.#animName(`approve${seat}`),
      duration: APPROVE_MS,
      ontick: () => {
        mark.blank.scale.set(1 - CanvasAnimation.easeInCircle(clamp01(swap.t / SHRINK)));
        mark.check.scale.set(bounce(clamp01((swap.t - CHECK_FROM) / (1 - CHECK_FROM))));
      },
    });
    playSound(CHIME_SETTING);
  }

  #flashRow(): void {
    const pulse = { t: 0 };
    void CanvasAnimation.animate([{ parent: pulse, attribute: 't', to: 1 }], {
      name: this.#animName('flash'),
      duration: 1500,
      ontick: () => {
        const glow = 1 + 0.25 * Math.abs(Math.sin(pulse.t * Math.PI * 4)) * (1 - pulse.t);
        for (const m of this.#marks) m.root.scale.set(glow);
      },
    });
  }
}

const asideFor = (id: string, state: TalentState): number => (state.spotlightId && state.spotlightId !== id ? 1 : 0);

/** The GM clicks a slate member's nameplate to throw the spotlight on them, or again to lift it. */
function pickOnClick(plate: PIXI.Container, id: string): void {
  plate.eventMode = 'static';
  plate.cursor = 'pointer';
  plate.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
    if (event.button !== 0 || !talent.sceneId) return;
    // The canvas would otherwise read the press as a click on empty ground and start a drag-select.
    event.stopPropagation();
    void mutate(talent.sceneId, (s) => spotlight(s, id));
  });
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** A damped spring from 0 to 1: overshoots by about an eighth, dips once, and lands exactly on 1. */
const bounce = (u: number) => 1 - Math.exp(-5 * u) * Math.cos(2.5 * Math.PI * u);

const soundSrc = (key: string) => game.settings.get(MODULE_ID, key) as string;

function playSound(key: string): void {
  const src = soundSrc(key);
  if (src) void foundry.audio.AudioHelper.play({ src, volume: 0.8, autoplay: true, loop: false }, false);
}
