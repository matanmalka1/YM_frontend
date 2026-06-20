const DEFAULT_STEP_MS = 60

export const staggerDelay = (index: number, stepMs: number = DEFAULT_STEP_MS, offsetMs = 0) => {
  return `${offsetMs + index * stepMs}ms`
}
