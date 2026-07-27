// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import { join } from 'path'
import {
  collectOnEventKeys,
  buildSkeleton,
  extractInfo,
  processSymbol,
  ROOT,
} from './tsdoc-stub-lib.js'

// Virtual files live under dist/ so TypeScript's module resolver finds node_modules
// by traversing up from that directory.
const FIXTURE_DIR = join(ROOT, 'dist', '__test_fixtures__')

function makeSourceFile(name: string, content: string) {
  const project = new Project({
    tsConfigFilePath: join(ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  })
  return project.createSourceFile(join(FIXTURE_DIR, name), content, { overwrite: true })
}

function getDecl(content: string, name: string, fixtureName = `${name}.ts`) {
  const sf = makeSourceFile(fixtureName, content)
  const decls = sf.getExportedDeclarations()
  const node = decls.get(name)?.[0]
  if (!node) throw new Error(`'${name}' not found in fixture`)
  return { sf, node }
}

// ─── buildSkeleton ────────────────────────────────────────────────────────────

describe('buildSkeleton', () => {
  it('produces a minimal block for a no-param void function', () => {
    expect(buildSkeleton({ typeParams: [], params: [], hasReturn: false })).toMatchInlineSnapshot(`
      "/**
       *
       * @release
       */"
    `)
  })

  it('includes @param lines and @returns', () => {
    expect(buildSkeleton({ typeParams: [], params: ['companyId', 'options'], hasReturn: true }))
      .toMatchInlineSnapshot(`
      "/**
       *
       * @param companyId -
       * @param options -
       * @returns
       * @release
       */"
    `)
  })

  it('includes @typeParam lines', () => {
    expect(buildSkeleton({ typeParams: ['T', 'U'], params: ['value'], hasReturn: true }))
      .toMatchInlineSnapshot(`
      "/**
       *
       * @typeParam T -
       * @typeParam U -
       * @param value -
       * @returns
       * @release
       */"
    `)
  })

  it('carries an existing summary into the block', () => {
    expect(
      buildSkeleton({ typeParams: [], params: ['id'], hasReturn: false }, 'Deletes the resource.'),
    ).toMatchInlineSnapshot(`
      "/**
       * Deletes the resource.
       * @param id -
       * @release
       */"
    `)
  })
})

// ─── extractInfo ─────────────────────────────────────────────────────────────

describe('extractInfo', () => {
  it('extracts params and return from a function declaration', () => {
    const { node } = getDecl(
      `export function greet(name: string, loud: boolean): string { return name }`,
      'greet',
    )
    expect(extractInfo(node)).toMatchObject({
      params: ['name', 'loud'],
      typeParams: [],
      hasReturn: true,
    })
  })

  it('treats void return as hasReturn: false', () => {
    const { node } = getDecl(`export function noop(): void {}`, 'noop')
    expect(extractInfo(node)).toMatchObject({ hasReturn: false })
  })

  it('extracts typeParams from a generic function declaration', () => {
    const { node } = getDecl(
      `export function identity<T>(value: T): T { return value }`,
      'identity',
    )
    expect(extractInfo(node)).toMatchObject({
      typeParams: ['T'],
      params: ['value'],
      hasReturn: true,
    })
  })

  it('extracts params from an arrow function const', () => {
    const { node } = getDecl(`export const add = (a: number, b: number): number => a + b`, 'add')
    expect(extractInfo(node)).toMatchObject({ params: ['a', 'b'], hasReturn: true })
  })

  it('returns empty info for a non-function variable', () => {
    const { node } = getDecl(`export const VALUE = 42`, 'VALUE')
    expect(extractInfo(node)).toMatchObject({ params: [], typeParams: [], hasReturn: false })
  })

  it('returns typeParams and no params for an interface', () => {
    const { node } = getDecl(`export interface Box<T> { value: T }`, 'Box')
    expect(extractInfo(node)).toMatchObject({ typeParams: ['T'], params: [], hasReturn: false })
  })
})

// ─── collectOnEventKeys ───────────────────────────────────────────────────────

describe('collectOnEventKeys', () => {
  it('returns null for an interface (non-callable shape)', () => {
    const { sf, node } = getDecl(`export interface FooProps { value: string }`, 'FooProps')
    const info = extractInfo(node)
    expect(collectOnEventKeys(info, sf, node)).toBeNull()
  })

  it('returns null when function has no onEvent-related signals', () => {
    const { sf, node } = getDecl(
      `export function greet(name: string): string { return 'hi ' + name }`,
      'greet',
    )
    const info = extractInfo(node)
    expect(collectOnEventKeys(info, sf, node)).toBeNull()
  })

  it('finds events when onEvent is a destructured parameter name', () => {
    const { sf, node } = getDecl(
      `const fooEvents = { DONE: 'foo/done', CANCEL: 'foo/cancel' }
export function Foo({ onEvent }: { onEvent: (e: string, p: unknown) => void }): null {
  onEvent(fooEvents.DONE, {})
  onEvent(fooEvents.CANCEL, {})
  return null
}`,
      'Foo',
    )
    const info = extractInfo(node)
    expect(collectOnEventKeys(info, sf, node)).toEqual(['CANCEL', 'DONE'])
  })

  it('finds events via resolved type of a props parameter — the props-object pattern', () => {
    // Regression for the BankAccount case: `function Foo(props: FooProps)` where
    // FooProps extends an interface that includes onEvent. Without the type-resolution
    // path, the param name 'props' never matches 'onEvent' and no events are returned.
    const { sf, node } = getDecl(
      `interface BarProps {
  onEvent: (eventType: string, payload: unknown) => void
  companyId: string
}
const barEvents = { SAVED: 'bar/saved', CREATED: 'bar/created' }
export function Bar(props: BarProps): null {
  props.onEvent(barEvents.SAVED, {})
  props.onEvent(barEvents.CREATED, {})
  return null
}`,
      'Bar',
    )
    const info = extractInfo(node)
    expect(collectOnEventKeys(info, sf, node)).toEqual(['CREATED', 'SAVED'])
  })

  it('finds events via resolved type on an arrow function const', () => {
    const { sf, node } = getDecl(
      `interface BazProps { onEvent: (e: string, p: unknown) => void }
const bazEvents = { UPDATED: 'baz/updated' }
export const Baz = (props: BazProps): null => {
  props.onEvent(bazEvents.UPDATED, {})
  return null
}`,
      'Baz',
    )
    const info = extractInfo(node)
    expect(collectOnEventKeys(info, sf, node)).toEqual(['UPDATED'])
  })

  it('finds events via direct onEvent(xxxEvents.YYY) call even without an onEvent param', () => {
    const { sf, node } = getDecl(
      `declare const onEvent: (e: string, p: unknown) => void
const quxEvents = { DONE: 'qux/done' }
export function doWork(value: string): void {
  onEvent(quxEvents.DONE, value)
}`,
      'doWork',
    )
    const info = extractInfo(node)
    expect(collectOnEventKeys(info, sf, node)).toEqual(['DONE'])
  })

  it('returns null when no node is provided and param name does not include onEvent', () => {
    // Without a node, type resolution is skipped — the props-object pattern is invisible.
    // The fixture references event keys via array (not a direct `onEvent(xxxEvents.` call) so
    // `hasDirectCalls` stays false; only type resolution can unlock the scan.
    const { sf, node } = getDecl(
      `interface BarProps { onEvent: (e: string, p: unknown) => void }
const barEvents = { SAVED: 'bar/saved' }
export function Bar(props: BarProps): null {
  // events fired from state machine — just enumerate them here for typing
  const _keys = [barEvents.SAVED]
  return null
}`,
      'Bar',
    )
    const info = extractInfo(node)
    expect(collectOnEventKeys(info, sf /*, no node */)).toBeNull()
  })
})

// ─── processSymbol ────────────────────────────────────────────────────────────

describe('processSymbol', () => {
  it('throws when the symbol is not found in the file', () => {
    const sf = makeSourceFile('ps-unknown.ts', `export function Foo(): void {}`)
    expect(() => processSymbol('Bar', sf)).toThrow("Symbol 'Bar' not found")
  })

  it('returns null for a symbol already aligned with its TSDoc comment', () => {
    const sf = makeSourceFile(
      'ps-aligned.ts',
      `/**
 * Renders a widget.
 * @param companyId -
 * @public
 */
export function Widget(companyId: string): void {}`,
    )
    expect(processSymbol('Widget', sf)).toBeNull()
  })

  it('generates output without an EVENTS section when no events exist', () => {
    const sf = makeSourceFile(
      'ps-no-events.ts',
      `export function greet(name: string): string { return 'hi ' + name }`,
    )
    const output = processSymbol('greet', sf)
    expect(output).not.toBeNull()
    expect(output).not.toContain('EVENTS:')
  })

  it('includes an EVENTS section for a component with destructured onEvent', () => {
    const sf = makeSourceFile(
      'ps-destructured-events.ts',
      `const fooEvents = { DONE: 'foo/done' }
export function Foo({ onEvent }: { onEvent: (e: string, p: unknown) => void }): null {
  onEvent(fooEvents.DONE, {})
  return null
}`,
    )
    const output = processSymbol('Foo', sf)
    expect(output).toContain('EVENTS:')
    expect(output).toContain('DONE')
  })

  it('includes an EVENTS section for a component using the props-object pattern', () => {
    // This is the core fix: BankAccount-style `function Foo(props: FooProps)` where
    // FooProps carries onEvent. Previously returned no EVENTS section.
    const sf = makeSourceFile(
      'ps-props-pattern-events.ts',
      `interface WidgetProps {
  onEvent: (eventType: string, payload: unknown) => void
  companyId: string
}
const widgetEvents = { SAVED: 'widget/saved' }
export function Widget(props: WidgetProps): null {
  props.onEvent(widgetEvents.SAVED, {})
  return null
}`,
    )
    const output = processSymbol('Widget', sf)
    expect(output).toContain('EVENTS:')
    expect(output).toContain('SAVED')
  })
})
