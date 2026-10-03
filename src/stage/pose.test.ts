import { describe, expect, it } from 'vitest';
import { figureOffsets, LAYOUT, stepBack, walkPose, xCenters } from './pose';

describe('walkPose', () => {
  it('starts dim and invisible in the archway', () => {
    expect(walkPose(0)).toEqual({ feet: LAYOUT.back.feet, height: LAYOUT.back.height, alpha: 0, brightness: 0.35 });
  });

  it('ends fully lit at the front of the stage', () => {
    const pose = walkPose(1);
    expect(pose.feet).toBeCloseTo(LAYOUT.front.feet);
    expect(pose.height).toBeCloseTo(LAYOUT.front.height);
    expect(pose).toMatchObject({ alpha: 1, brightness: 1 });
  });

  it('grows monotonically as the contestant walks forward', () => {
    const heights = Array.from({ length: 21 }, (_, i) => walkPose(i / 20).height);
    for (let i = 1; i < heights.length; i++) expect(heights[i]).toBeGreaterThanOrEqual(heights[i - 1]);
  });

  it('clamps progress outside 0..1', () => {
    expect(walkPose(-1)).toEqual(walkPose(0));
    expect(walkPose(2)).toEqual(walkPose(1));
  });
});

describe('stepBack', () => {
  it('draws the feet up the stage as far along the walk-on line as the height shrank', () => {
    const back = stepBack(walkPose(1), 0.75);
    const feetAlong = (back.feet - LAYOUT.back.feet) / (LAYOUT.front.feet - LAYOUT.back.feet);
    const heightAlong = (back.height - LAYOUT.back.height) / (LAYOUT.front.height - LAYOUT.back.height);
    expect(back.height).toBeCloseTo(LAYOUT.front.height * 0.75);
    expect(back.feet).toBeLessThan(LAYOUT.front.feet);
    expect(feetAlong).toBeCloseTo(heightAlong);
  });

  it('leaves a figure at full scale where it stands', () => {
    expect(stepBack(walkPose(1), 1)).toEqual(walkPose(1));
  });
});

describe('xCenters', () => {
  it('centres the row on the stage', () => {
    const xs = xCenters(4);
    expect((xs[0] + xs[3]) / 2).toBeCloseTo(LAYOUT.centerX);
    expect(xs[1] - xs[0]).toBeCloseTo(LAYOUT.xRow.gap);
  });
});

describe('figureOffsets', () => {
  it('keeps a lone figure at centre and spreads a pair evenly', () => {
    expect(figureOffsets(1, 1500)).toEqual([0]);
    const [a, b] = figureOffsets(2, 1500);
    expect(a).toBeCloseTo(-b);
    expect(b).toBeGreaterThan(0);
  });

  it('closes the pair up as the figures shrink', () => {
    expect(figureOffsets(2, 720)[1]).toBeLessThan(figureOffsets(2, 1500)[1]);
  });
});
