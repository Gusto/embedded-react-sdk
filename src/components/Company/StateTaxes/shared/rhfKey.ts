// react-hook-form's path parser strips `|`, `"`, `'`, and `]` from field names
// (see its stringToPath regex), which silently re-routes writes to a different
// path than reads. Tax requirement keys like `wa_wc_hourly_rate|010103` need
// the pipe replaced to round-trip through RHF state without losing values.
const PIPE_PLACEHOLDER = '__PIPE__'

/** @internal */
export const toRhfKey = (key: string): string => key.replaceAll('|', PIPE_PLACEHOLDER)
/** @internal */
export const fromRhfKey = (key: string): string => key.replaceAll(PIPE_PLACEHOLDER, '|')

/**
 * `toRhfKey(requirement.key)`, disambiguated with a numeric suffix if an earlier requirement in
 * the same `requirements` array has the same `key`.
 *
 * @remarks
 * The API doesn't guarantee `TaxRequirement.key` is unique within a single requirement set. Two
 * fields sharing a raw key would otherwise register under the identical react-hook-form field
 * name and silently share state (editing one would overwrite the other). Call this — instead of
 * `toRhfKey` directly — everywhere a requirement's key becomes a form field name, and use the
 * same `(requirement, index, requirements)` triple both when building the field and when reading
 * its value back out of the submitted payload.
 *
 * @internal
 */
export function getUniqueRhfKey(
  requirement: { key?: string },
  index: number,
  requirements: { key?: string }[],
): string {
  let priorSameKeyCount = 0
  for (let i = 0; i < index; i++) {
    if (requirements[i]?.key === requirement.key) priorSameKeyCount++
  }
  const base = toRhfKey(requirement.key ?? '')
  return priorSameKeyCount === 0 ? base : `${base}--dup${priorSameKeyCount}`
}
