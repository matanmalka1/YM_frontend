export const QUERY_STALE_TIME = {
  short: 10_000,
  default: 30_000,
  medium: 60_000,
  long: 5 * 60_000,
  static: Infinity,
} as const
