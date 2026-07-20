#!/usr/bin/env node
// arch-check.mjs — Architectural integrity checker
// Usage: node scripts/arch-check.mjs [--strict]
//
// Checks:
//   1. Circular dependency detection (all .ts/.tsx in src/)
//   2. UI purity: src/components/ui/ files cannot import from api/ or @tanstack/react-query
//   3. [--strict] Feature barrel enforcement: cross-feature imports must go through index.ts
//   4. Design-token drift: no raw Tailwind color families that have a semantic ramp in index.css

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, relative, dirname, extname } from 'node:path'

const SRC = resolve('src')
const STRICT = process.argv.includes('--strict')
const violations = []
let exitCode = 0

// ── File discovery ────────────────────────────────────────────────────────────
function walk(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory() && entry !== 'node_modules') {
      files.push(...walk(full))
    } else if (stat.isFile() && /\.(ts|tsx)$/.test(entry)) {
      files.push(full)
    }
  }
  return files
}

// ── Import extraction ─────────────────────────────────────────────────────────
const IMPORT_RE = /from\s+["']([^"']+)["']/g

function extractImports(filePath) {
  const src = readFileSync(filePath, 'utf8')
  const lines = src.split('\n')
  const imports = []
  let skipNext = false
  for (const line of lines) {
    if (line.includes('arch-check-disable') || line.includes('eslint-disable-next-line no-restricted-imports')) {
      skipNext = true
      continue
    }
    if (skipNext) {
      skipNext = false
      continue
    }
    for (const m of line.matchAll(IMPORT_RE)) {
      imports.push(m[1])
    }
  }
  return imports
}

function resolveImport(from, spec) {
  if (!spec.startsWith('.')) return spec // external or alias
  const base = dirname(from)
  // Try with extensions
  for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
    try {
      const full = resolve(base, spec + ext)
      statSync(full)
      return full
    } catch {}
  }
  return null
}

// ── Build adjacency map ───────────────────────────────────────────────────────
const files = walk(SRC)
const adj = new Map() // file -> Set<file>
const rawImports = new Map() // file -> string[] (original specifiers)

for (const file of files) {
  const imports = extractImports(file)
  rawImports.set(file, imports)
  adj.set(file, new Set())
  for (const spec of imports) {
    const resolved = resolveImport(file, spec)
    if (resolved) adj.get(file).add(resolved)
  }
}

// ── Check 1: Circular dependencies ───────────────────────────────────────────
const WHITE = 0,
  GRAY = 1,
  BLACK = 2
const color = new Map(files.map((f) => [f, WHITE]))
const cyclePaths = []

function dfs(node, path) {
  color.set(node, GRAY)
  for (const neighbor of adj.get(node) ?? []) {
    if (!color.has(neighbor)) continue
    if (color.get(neighbor) === GRAY) {
      const cycleStart = path.indexOf(neighbor)
      cyclePaths.push([...path.slice(cycleStart), neighbor])
    } else if (color.get(neighbor) === WHITE) {
      dfs(neighbor, [...path, neighbor])
    }
  }
  color.set(node, BLACK)
}

for (const file of files) {
  if (color.get(file) === WHITE) dfs(file, [file])
}

if (cyclePaths.length > 0) {
  exitCode = 1
  for (const cycle of cyclePaths) {
    violations.push(`CYCLE: ${cycle.map((f) => relative(SRC, f)).join(' → ')}`)
  }
}

// ── Check 2: UI purity ────────────────────────────────────────────────────────
const UI_DIR = resolve(SRC, 'components/ui')

for (const file of files) {
  if (!file.startsWith(UI_DIR)) continue
  for (const spec of rawImports.get(file) ?? []) {
    if (spec.includes('/api/') || spec.includes('@/api/') || spec === '@tanstack/react-query') {
      exitCode = 1
      violations.push(`UI_IMPURE: ${relative(SRC, file)} imports "${spec}"`)
    }
  }
}

// ── Check 3: Feature barrel enforcement (--strict only) ───────────────────────
if (STRICT) {
  const FEATURES_DIR = resolve(SRC, 'features')
  const featureNames = readdirSync(FEATURES_DIR).filter((d) => {
    try {
      return statSync(resolve(FEATURES_DIR, d)).isDirectory()
    } catch {
      return false
    }
  })

  for (const file of files) {
    const fileFeature = featureNames.find((f) => file.startsWith(resolve(FEATURES_DIR, f) + '/'))
    // Pages are composition shells — they may import feature internals directly
    if (!fileFeature) continue
    for (const spec of rawImports.get(file) ?? []) {
      const resolved = resolveImport(file, spec)
      if (!resolved) continue
      const importFeature = featureNames.find((f) => resolved.startsWith(resolve(FEATURES_DIR, f) + '/'))
      if (!importFeature || importFeature === fileFeature) continue
      // Cross-feature component imports are allowed (composition pattern)
      if (resolved.includes('/components/')) continue
      // Cross-feature import of non-component: must point to index.ts
      const barrel = resolve(FEATURES_DIR, importFeature, 'index.ts')
      if (resolved !== barrel) {
        exitCode = 1
        violations.push(
          `BARREL_BYPASS: ${relative(SRC, file)} → ${relative(SRC, resolved)} (use features/${importFeature}/index.ts)`,
        )
      }
    }
  }
}

// ── Check 4: Design-token drift ───────────────────────────────────────────────
// Raw Tailwind color families that duplicate a semantic ramp in index.css @theme.
// gray (surfaces) and slate (text) are the two intentional neutral roles — not listed.
// Hues with no semantic ramp (orange/purple/violet/rose/…) are free-standing accents — not listed.
const SEMANTIC_EQUIVALENT = {
  blue: 'primary',
  indigo: 'info',
  emerald: 'positive',
  green: 'positive',
  amber: 'warning',
  yellow: 'warning',
  red: 'negative',
}

// Files whose raw hues are deliberate, documented exceptions.
const TOKEN_DRIFT_EXEMPT = [
  // Categorical chart palette — spans hues on purpose, never expresses status.
  'features/vatReports/constants/visualizationTokens.ts',
  // Two-hue gradient stops: the second stop must differ from the semantic first stop.
  'components/ui/overlays/Alert.tsx',
]

const COLOR_UTIL_RE = new RegExp(
  `\\b(?:text|bg|border|ring|from|to|via|fill|stroke|divide|decoration|outline|accent|caret|placeholder)-(${Object.keys(
    SEMANTIC_EQUIVALENT,
  ).join('|')})-\\d{2,3}\\b`,
  'g',
)

for (const file of files) {
  const rel = relative(SRC, file)
  if (TOKEN_DRIFT_EXEMPT.includes(rel)) continue
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (line.includes('arch-check-disable')) return
    for (const m of line.matchAll(COLOR_UTIL_RE)) {
      exitCode = 1
      violations.push(`TOKEN_DRIFT: ${rel}:${i + 1} uses "${m[0]}" — use the ${SEMANTIC_EQUIVALENT[m[1]]} ramp instead`)
    }
  })
}

// ── Report ────────────────────────────────────────────────────────────────────
if (violations.length > 0) {
  console.error(`\narch-check found ${violations.length} violation(s):\n`)
  for (const v of violations) console.error(`  ✗ ${v}`)
  console.error('')
} else {
  console.log(`arch-check passed${STRICT ? ' (strict mode)' : ''}: no violations found.`)
}

process.exit(exitCode)
