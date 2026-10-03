/** Pixel positions on the stage image; the stage layer scales them to the scene's actual size. */
export const STAGE = { width: 2880, height: 2880 } as const;

export const LAYOUT = {
  xRow: { y: 630, size: 190, gap: 270, nameY: 736, nameSize: 60 },
  back: { feet: 1920, height: 720 },
  front: { feet: 2544, height: 1500 },
  centerX: 1440,
  /** Each contestant's name sits just below their feet, sized for the front of the stage. */
  figureName: { below: 28, size: 72 },
  /** Valerie's token fills the archway while she breaks a tie; her vote badges its lower right. */
  regent: { y: 1330, size: 440, markSize: 170 },
} as const;

export interface Pose {
  feet: number;
  height: number;
  alpha: number;
  /** 0 = silhouette, 1 = fully lit. */
  brightness: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeInOut = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;

const STEPS = 7;
const BOB = 6;

/** Contestant pose at progress p of the walk from the archway (0) to the front of the stage (1). */
export function walkPose(p: number): Pose {
  const t = clamp01(p);
  const e = easeInOut(t);
  const bob = Math.abs(Math.sin(t * Math.PI * STEPS)) * BOB * (1 - t);
  return {
    feet: lerp(LAYOUT.back.feet, LAYOUT.front.feet, e) - bob,
    height: lerp(LAYOUT.back.height, LAYOUT.front.height, e),
    alpha: clamp01(t / 0.2),
    brightness: lerp(0.35, 1, e),
  };
}

// The walk-on lerps feet and height together, so every pose lies on one perspective line.
const FEET_PER_HEIGHT = (LAYOUT.front.feet - LAYOUT.back.feet) / (LAYOUT.front.height - LAYOUT.back.height);

/** The pose shrunk to `scale`, its feet drawn back up the stage so the shrink reads as distance. */
export function stepBack(pose: Pose, scale: number): Pose {
  const height = pose.height * scale;
  return { ...pose, height, feet: pose.feet - (pose.height - height) * FEET_PER_HEIGHT };
}

export const xCenters = (count: number): number[] =>
  Array.from({ length: count }, (_, i) => LAYOUT.centerX + (i - (count - 1) / 2) * LAYOUT.xRow.gap);

const SPREAD = 0.6;

/** Each figure's place in a slate of `count`, in spacing units from centre stage; sliding between two counts tweens these. */
export const slots = (count: number): number[] => Array.from({ length: count }, (_, i) => i - (count - 1) / 2);

/** A slot's distance from centre stage for a figure of `height`, so the slate closes up at the back. */
export const slotOffset = (slot: number, height: number): number => slot * height * SPREAD;
