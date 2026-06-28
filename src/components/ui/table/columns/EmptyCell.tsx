import type { ReactNode } from 'react'

/** Canonical "no value" glyph. Lives here so there is one source for the dash. */
export const EMPTY_CELL_VALUE = '—'

/**
 * Canonical empty-cell placeholder. Use in any custom `render` whose cell collapses
 * to "no value" — never hand-roll `<span className="text-gray-400">—</span>`, which
 * drifts on grey shade and re-specifies the default body font size. The `kind`-based
 * column helpers already emit this for empty `getValue` results.
 */
export const EmptyCell = ({ children = EMPTY_CELL_VALUE }: { children?: ReactNode }) => (
  <span className="text-gray-400">{children}</span>
)
