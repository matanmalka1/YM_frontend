import type { CSSProperties } from 'react'

const DEFAULT_STEP_MS = 60

type AnimationDelayVars = CSSProperties & {
  '--enter-delay': string
}

export const staggerDelay = (index: number, stepMs: number = DEFAULT_STEP_MS, offsetMs = 0) => {
  return `${offsetMs + index * stepMs}ms`
}

const animationDelayVars = (delay: string): AnimationDelayVars => ({
  '--enter-delay': delay,
})

export const staggerAnimationDelayVars = (
  index: number,
  stepMs: number = DEFAULT_STEP_MS,
  offsetMs = 0,
): AnimationDelayVars => animationDelayVars(staggerDelay(index, stepMs, offsetMs))
