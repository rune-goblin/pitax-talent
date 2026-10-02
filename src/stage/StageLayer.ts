import { BUZZER_SETTING, MODULE_ID, X_OFF, X_ON } from '../constants';
import { contestant, portraitPath } from '../roster';
import { allVotesIn, newVotes, SEAT_COUNT, type TalentState } from '../state';
import { LAYOUT, STAGE, walkPose, xCenters } from './pose';

const { CanvasAnimation } = foundry.canvas.animation;
const { loadTexture } = foundry.canvas;

const ENTRANCE_MS = 2600;
const EXIT_MS = 1400;
const ELIMINATED_MS = 2200;
const POP_MS = 380;
const DIM = 0.55;
const REFLECTION = 0.18;

interface XMark {
  root: PIXI.Container;
  on: PIXI.Sprite;
}

/**
 * The contestant and the X row, drawn in world space on the interface group so they stay
 * pinned to the stage image when anyone pans or zooms.
 */
export class StageLayer {
  #root = new PIXI.Container();
  #dim = new PIXI.Graphics();
  #figure = new PIXI.Container();
  #sprite = new PIXI.Sprite();
  #reflection = new PIXI.Sprite();
  #marks: XMark[] = [];
  #walk = { p: 0 };
  #shownId: string | null = null;
  #rect!: PIXI.Rectangle;
  #k = 1;

  static #current?: StageLayer;

  static async draw(state: TalentState): Promise<void> {
    StageLayer.destroy();
    const layer = new StageLayer();
    StageLayer.#current = layer;
    await layer.#build();
    if (StageLayer.#current !== layer) return;
    await layer.#show(state);
  }

  static update(before: TalentState, after: TalentState): void {
    const layer = StageLayer.#current;
    if (layer) void layer.#transition(before, after);
  }

  static destroy(): void {
    const layer = StageLayer.#current;
    StageLayer.#current = undefined;
    if (!layer) return;
    CanvasAnimation.terminateAnimation(layer.#animName('walk'));
    layer.#root.destroy({ children: true });
  }

  #animName = (part: string) => `${MODULE_ID}.${part}`;

  #x = (px: number) => this.#rect.x + px * this.#k;
  #y = (px: number) => this.#rect.y + px * this.#k;

  async #build(): Promise<void> {
    this.#rect = canvas.dimensions!.sceneRect;
    this.#k = this.#rect.width / STAGE.width;
    this.#root.eventMode = 'none';

    this.#dim.beginFill(0x000000).drawRect(this.#rect.x, this.#rect.y, this.#rect.width, this.#rect.height).endFill();
    this.#dim.alpha = 0;

    this.#sprite.anchor.set(0.5, 1);
    this.#reflection.anchor.set(0.5, 1);
    this.#reflection.scale.y = -1;
    this.#figure.addChild(this.#reflection, this.#sprite);
    this.#figure.visible = false;

    // Decoding on the first press would delay that buzz behind its X.
    const buzzer = buzzerSrc();
    if (buzzer) void foundry.audio.AudioHelper.preloadSound(buzzer).catch(() => {});

    const [off, on] = await Promise.all([loadTexture(X_OFF), loadTexture(X_ON)]);
    const size = LAYOUT.xRow.size * this.#k;
    this.#marks = xCenters(SEAT_COUNT).map((cx) => {
      const root = new PIXI.Container();
      root.position.set(this.#x(cx), this.#y(LAYOUT.xRow.y));
      const offSprite = new PIXI.Sprite(off as PIXI.Texture);
      const onSprite = new PIXI.Sprite(on as PIXI.Texture);
      for (const s of [offSprite, onSprite]) {
        s.anchor.set(0.5);
        s.width = s.height = size;
      }
      onSprite.alpha = 0;
      root.addChild(offSprite, onSprite);
      return { root, on: onSprite };
    });

    this.#root.addChild(this.#dim, this.#figure, ...this.#marks.map((m) => m.root));
    canvas.interface!.addChild(this.#root);
  }

  async #show(state: TalentState): Promise<void> {
    await this.#setContestant(state.contestantId);
    const out = allVotesIn(state);
    this.#pose(state.contestantId && !out ? 1 : 0);
    this.#dim.alpha = out ? DIM : 0;
    state.votes.forEach((on, i) => (this.#marks[i].on.alpha = on ? 1 : 0));
  }

  async #transition(before: TalentState, after: TalentState): Promise<void> {
    for (const seat of newVotes(before, after)) this.#pop(seat);
    after.votes.forEach((on, i) => {
      if (!on) this.#marks[i].on.alpha = 0;
    });

    const arrived = after.contestantId && after.entrance !== before.entrance;
    if (arrived) {
      this.#dim.alpha = 0;
      await this.#setContestant(after.contestantId);
      await this.#animateWalk(0, 1, ENTRANCE_MS);
    } else if (!after.contestantId && before.contestantId) {
      this.#fadeDim(0);
      await this.#animateWalk(this.#walk.p, 0, EXIT_MS);
      this.#figure.visible = false;
    } else if (allVotesIn(after) && !allVotesIn(before)) {
      this.#flashRow();
      this.#fadeDim(DIM);
      await this.#animateWalk(this.#walk.p, 0, ELIMINATED_MS);
    } else if (!allVotesIn(after) && allVotesIn(before)) {
      this.#fadeDim(0);
      if (after.contestantId) await this.#animateWalk(this.#walk.p, 1, ENTRANCE_MS);
    }
  }

  async #setContestant(id: string | null): Promise<void> {
    const npc = contestant(id);
    this.#shownId = npc ? npc.id : null;
    this.#figure.visible = !!npc;
    if (!npc) return;
    const texture = (await loadTexture(portraitPath(npc))) as PIXI.Texture | null;
    if (this.#shownId !== npc.id || !texture) return;
    this.#sprite.texture = texture;
    this.#reflection.texture = texture;
  }

  #pose(p: number): void {
    this.#walk.p = p;
    const pose = walkPose(p);
    const tex = this.#sprite.texture;
    const height = pose.height * this.#k;
    const width = tex.height ? (height * tex.width) / tex.height : 0;
    const x = this.#x(LAYOUT.centerX);
    const feet = this.#y(pose.feet);
    const tint = Math.round(pose.brightness * 255);
    this.#sprite.position.set(x, feet);
    this.#sprite.width = width;
    this.#sprite.height = height;
    this.#sprite.alpha = pose.alpha;
    this.#sprite.tint = (tint << 16) | (tint << 8) | tint;
    this.#reflection.position.set(x, feet);
    this.#reflection.width = width;
    // PIXI's height setter keeps scale.y's sign, so the reflection stays flipped.
    this.#reflection.height = height;
    this.#reflection.alpha = pose.alpha * REFLECTION;
    this.#reflection.tint = this.#sprite.tint;
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

  #pop(seat: number): void {
    const mark = this.#marks[seat];
    mark.on.alpha = 1;
    mark.root.scale.set(1.7);
    void CanvasAnimation.animate(
      [
        { parent: mark.root.scale, attribute: 'x', to: 1 },
        { parent: mark.root.scale, attribute: 'y', to: 1 },
      ],
      { name: this.#animName(`pop${seat}`), duration: POP_MS, easing: 'easeOutCircle' },
    );
    playBuzzer();
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

const buzzerSrc = () => game.settings.get(MODULE_ID, BUZZER_SETTING) as string;

function playBuzzer(): void {
  const src = buzzerSrc();
  if (src) void foundry.audio.AudioHelper.play({ src, volume: 0.8, autoplay: true, loop: false }, false);
}
