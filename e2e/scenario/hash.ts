import { createHash } from 'node:crypto'

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue }

/**
 * Canonical JSON serialization: recursively sort object keys so that two
 * structurally equivalent objects produce identical strings regardless of
 * insertion order. Arrays preserve order (array order is meaningful).
 */
export function canonicalize(value: JsonValue): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalize).join(',') + ']'
  }
  const keys = Object.keys(value).sort()
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalize(value[k]!)).join(',') + '}'
}

/**
 * Stable SHA-256 hex digest of a scenario's structural identity. Inputs should
 * be the output of `resolveScenario` (i.e., $refs/overrides applied, but
 * `{{ts}}` and other templates NOT yet substituted) so that re-runs with
 * different timestamps produce the same hash.
 */
export function hashScenarioStructure(value: JsonValue): string {
  return createHash('sha256').update(canonicalize(value)).digest('hex')
}
