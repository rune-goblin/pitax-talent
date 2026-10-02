import { describe, expect, it } from 'vitest';
import { LAYOUT, walkPose, xCenters } from './pose';

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

describe('xCenters', () => {
  it('centres the row on the stage', () => {
    const xs = xCenters(4);
    expect((xs[0] + xs[3]) / 2).toBeCloseTo(LAYOUT.centerX);
    expect(xs[1] - xs[0]).toBeCloseTo(LAYOUT.xRow.gap);
  });
});
