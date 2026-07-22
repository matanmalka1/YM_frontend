import { afterEach, describe, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const roots: string[] = []

const fixture = (files: Record<string, string>) => {
  const root = mkdtempSync(join(tmpdir(), 'ym-arch-check-'))
  roots.push(root)
  mkdirSync(join(root, 'features'), { recursive: true })
  for (const [name, contents] of Object.entries(files)) {
    const path = join(root, name)
    mkdirSync(resolve(path, '..'), { recursive: true })
    writeFileSync(path, contents)
  }
  return root
}

const run = (root: string) =>
  spawnSync(process.execPath, ['scripts/arch-check.mjs', '--strict'], {
    cwd: resolve(import.meta.dirname, '../..'),
    env: { ...process.env, ARCH_CHECK_SRC: root },
    encoding: 'utf8',
  })

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('architecture checker import graph', () => {
  it.each([
    ['alias', "import '@/a/b'"],
    ['lazy', "const load = () => import('@/a/b')"],
    ['re-export', "export { value } from '@/a/b'"],
  ])('detects a cycle through a %s edge', (_name, edge) => {
    const root = fixture({
      'a/index.ts': edge,
      'a/b.ts': "import '@/a/index'\nexport const value = 1",
    })
    const result = run(root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('CYCLE')
  })

  it('does not treat type-only imports as runtime cycles', () => {
    const root = fixture({
      'a/index.ts': "import type { B } from '@/a/b'\nexport interface A { b: B }",
      'a/b.ts': "import type { A } from '@/a/index'\nexport interface B { a?: A }",
    })
    expect(run(root).status).toBe(0)
  })

  it('reports own-barrel imports and cross-feature private imports', () => {
    const root = fixture({
      'features/a/index.ts': 'export const a = 1',
      'features/a/private.ts': "import { a } from '@/features/a'\nexport const own = a",
      'features/b/index.ts': "import { own } from '@/features/a/private'\nexport const b = own",
    })
    const result = run(root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('SELF_BARREL')
    expect(result.stderr).toContain('BARREL_BYPASS')
  })

  it('honors an explicit architecture suppression on the import it annotates', () => {
    const root = fixture({
      'a/index.ts': "// arch-check-disable -- fixture exception\nimport '@/a/b'",
      'a/b.ts': "import '@/a/index'",
    })
    expect(run(root).status).toBe(0)
  })
})
