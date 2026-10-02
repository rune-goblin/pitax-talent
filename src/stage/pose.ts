/** Pixel positions on the stage image; the stage layer scales them to the scene's actual size. */
export const STAGE = { width: 1544, height: 1019 } as const;

export const LAYOUT = {
  xRow: { y: 288, size: 66, gap: 84 },
  back: { feet: 642, height: 235 },
  front: { feet: 882, height: 550 },
  centerX: 772,
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

export const xCenters = (count: number): number[] =>
  Array.from({ length: count }, (_, i) => LAYOUT.centerX + (i - (count - 1) / 2) * LAYOUT.xRow.gap);
