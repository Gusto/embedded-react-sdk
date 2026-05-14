import { readFile } from 'node:fs/promises'
import { dirname, resolve as resolvePath } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv'
import schemaJson from '../scenarios/schema/scenario.schema.json' with { type: 'json' }
import type { Scenario } from '../scenarios/schema/scenario.types'

const ajv = new Ajv({ allErrors: true, strict: false })
const validateAgainstSchema = ajv.compile(schemaJson)

export interface TemplateOptions {
  /** Value substituted for {{ts}}. Defaults to Date.now(). */
  ts?: number | string
  /** Reference date for {{relative:+Nd[:DayName]}} substitutions. Defaults to new Date(). */
  baseDate?: Date
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue }

function isPlainObject(v: unknown): v is Record<string, JsonValue> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * Deep-merge `override` into `base`. Arrays in override REPLACE arrays in base
 * (per scenario schema convention). Returns a new value; does not mutate inputs.
 */
export function deepMerge(base: JsonValue, override: JsonValue): JsonValue {
  if (!isPlainObject(base) || !isPlainObject(override)) return override
  const out: Record<string, JsonValue> = { ...base }
  for (const [k, v] of Object.entries(override)) {
    out[k] = k in base ? deepMerge(base[k]!, v) : v
  }
  return out
}

async function readJson(path: string): Promise<JsonValue> {
  return JSON.parse(await readFile(path, 'utf8')) as JsonValue
}

/**
 * Walk the scenario tree resolving $ref fragments. For each object with $ref:
 *   1. Load the referenced fragment (recursively resolving any $refs inside it).
 *   2. Deep-merge: fragment <- siblings (without $ref/overrides) <- overrides.
 * Tracks the in-flight $ref chain to throw on cycles.
 */
async function resolveRefs(
  node: JsonValue,
  baseDir: string,
  refStack: ReadonlySet<string>,
): Promise<JsonValue> {
  if (Array.isArray(node)) {
    return Promise.all(node.map(item => resolveRefs(item, baseDir, refStack)))
  }
  if (!isPlainObject(node)) return node

  if (typeof node.$ref === 'string') {
    const refRel = node.$ref
    const refAbs = resolvePath(baseDir, refRel)
    if (refStack.has(refAbs)) {
      throw new Error(`Cyclic $ref detected: ${[...refStack, refAbs].join(' -> ')}`)
    }
    const fragment = await readJson(refAbs)
    const resolvedFragment = await resolveRefs(
      fragment,
      dirname(refAbs),
      new Set([...refStack, refAbs]),
    )
    const { $ref, overrides, ...siblings } = node
    void $ref
    let merged = resolvedFragment
    if (Object.keys(siblings).length > 0) {
      merged = deepMerge(merged, siblings as JsonValue)
    }
    if (overrides !== undefined) {
      if (!isPlainObject(overrides)) {
        throw new Error(`$ref overrides must be an object, got: ${typeof overrides}`)
      }
      merged = deepMerge(merged, overrides as JsonValue)
    }
    return merged
  }

  const out: Record<string, JsonValue> = {}
  for (const [k, v] of Object.entries(node)) {
    out[k] = await resolveRefs(v, baseDir, refStack)
  }
  return out
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

/**
 * Resolve a `{{relative:+Nd[:DayName]}}` token. `+Nd` shifts baseDate by N
 * days (negative N is allowed). If `:DayName` is present, the result is
 * advanced forward to the next occurrence of that weekday (UTC).
 * Returns an ISO date `YYYY-MM-DD`.
 */
function resolveRelative(spec: string, baseDate: Date): string {
  const m = /^([+-]?\d+)d(?::([A-Za-z]+))?$/.exec(spec)
  if (!m) throw new Error(`Invalid relative spec: ${spec}`)
  const days = parseInt(m[1]!, 10)
  const dayName = m[2]?.toLowerCase()
  const d = new Date(
    Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate()),
  )
  d.setUTCDate(d.getUTCDate() + days)
  if (dayName) {
    const targetDow = DAY_NAMES.indexOf(dayName)
    if (targetDow < 0) throw new Error(`Invalid day name: ${dayName}`)
    let safety = 7
    while (d.getUTCDay() !== targetDow && safety-- > 0) {
      d.setUTCDate(d.getUTCDate() + 1)
    }
  }
  return d.toISOString().slice(0, 10)
}

/** Substitute `{{ts}}` and `{{relative:...}}` tokens in a single string. */
function substituteString(str: string, opts: TemplateOptions): string {
  return str.replace(/\{\{([^}]+)\}\}/g, (_match, token: string) => {
    const trimmed = token.trim()
    if (trimmed === 'ts') {
      return String(opts.ts ?? Date.now())
    }
    if (trimmed.startsWith('relative:')) {
      return resolveRelative(trimmed.slice('relative:'.length), opts.baseDate ?? new Date())
    }
    throw new Error(`Unknown template token: {{${token}}}`)
  })
}

/** Walk the tree applying template substitution to every string. */
export function applyTemplates(value: JsonValue, opts: TemplateOptions = {}): JsonValue {
  if (typeof value === 'string') return substituteString(value, opts)
  if (Array.isArray(value)) return value.map(v => applyTemplates(v, opts))
  if (isPlainObject(value)) {
    const out: Record<string, JsonValue> = {}
    for (const [k, v] of Object.entries(value)) out[k] = applyTemplates(v, opts)
    return out
  }
  return value
}

/**
 * Resolve $refs + overrides but leave `{{...}}` tokens intact. The output of
 * this function is what gets hashed for cache lookup (templates carry the
 * intentionally-non-deterministic bits, so hashing pre-substitution gives
 * cache-stable scenario identity).
 */
export async function resolveScenario(scenarioPath: string): Promise<JsonValue> {
  const abs = resolvePath(scenarioPath)
  const raw = await readJson(abs)
  return resolveRefs(raw, dirname(abs), new Set())
}

/**
 * Full load: resolve $refs + overrides, substitute templates, validate against
 * the schema. Returns the provisioning-ready scenario.
 */
export async function loadScenario(
  scenarioPath: string,
  opts?: TemplateOptions,
): Promise<Scenario> {
  const resolved = await resolveScenario(scenarioPath)
  const templated = applyTemplates(resolved, opts ?? {})
  if (!validateAgainstSchema(templated)) {
    const errs = (validateAgainstSchema.errors ?? [])
      .map(e => `${e.instancePath || '/'} ${e.message ?? ''}`)
      .join('; ')
    throw new Error(`Scenario validation failed for ${scenarioPath}: ${errs}`)
  }
  return templated as unknown as Scenario
}

/** Convenience for ESM consumers passing import.meta.url. */
export function pathFromMetaUrl(metaUrl: string, relative: string): string {
  return resolvePath(dirname(fileURLToPath(metaUrl)), relative)
}
