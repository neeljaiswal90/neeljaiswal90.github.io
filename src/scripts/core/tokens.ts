export type CubicBezier = [number, number, number, number];

const cubicBezier = (...values: CubicBezier): CubicBezier => values;

/**
 * Shared motion values are expressed in seconds because that is the unit used
 * by Motion's JavaScript API. Keep scene-specific choreography in its
 * controller and build it from these primitives.
 */
export const motionTokens = {
  ease: {
    standard: cubicBezier(0.22, 1, 0.36, 1),
    emphasized: cubicBezier(0.16, 1, 0.3, 1),
    exit: cubicBezier(0.4, 0, 1, 1),
  },
  durations: {
    instant: 0,
    fast: 0.18,
    base: 0.32,
    slow: 0.55,
    scene: 0.72,
  },
  stagger: {
    tight: 0.035,
    base: 0.06,
    loose: 0.1,
  },
};

export type MotionTokens = typeof motionTokens;
