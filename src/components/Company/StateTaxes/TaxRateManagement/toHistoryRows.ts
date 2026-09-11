import type { TaxRequirementSet } from '@gusto/embedded-api/models/components/taxrequirementset'
import { getUniqueRhfKey } from '../shared/rhfKey'
import { formatDateToStringDate } from '@/helpers/dateFormatting'

/** @internal */
export type HistoryRowStatus = 'current' | 'scheduled' | 'historical'

/** @internal */
export interface HistoryRow {
  id: string
  effectiveFrom: string
  status: HistoryRowStatus
  values: Record<string, string>
}

/** @internal */
export interface RequirementColumn {
  key: string
  label?: string
}

function isEffectiveDated(
  set: TaxRequirementSet,
): set is TaxRequirementSet & { effectiveFrom: string } {
  return typeof set.effectiveFrom === 'string' && set.effectiveFrom.length > 0
}

/**
 * Tags each effective-dated requirement set for a key as current, scheduled (future), or
 * historical (past), relative to today.
 *
 * @internal
 */
export function toHistoryRows(sets: TaxRequirementSet[]): HistoryRow[] {
  const today = formatDateToStringDate(new Date()) ?? ''
  const sorted = sets
    .filter(isEffectiveDated)
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom))

  const currentIndex = sorted.reduce(
    (acc, set, idx) => (set.effectiveFrom <= today ? idx : acc),
    -1,
  )

  return sorted.map((set, idx) => {
    const values: Record<string, string> = {}
    const requirements = set.requirements ?? []
    requirements.forEach((requirement, reqIndex) => {
      if (!requirement.key || requirement.editable === false) return
      values[getUniqueRhfKey(requirement, reqIndex, requirements)] =
        requirement.value === null || requirement.value === undefined
          ? ''
          : String(requirement.value)
    })
    const status: HistoryRowStatus =
      idx === currentIndex ? 'current' : idx > currentIndex ? 'scheduled' : 'historical'
    return {
      id: `${set.key ?? 'set'}-${set.effectiveFrom}-${idx}`,
      effectiveFrom: set.effectiveFrom,
      status,
      values,
    }
  })
}

/**
 * Builds the union of editable requirement keys/labels across a set of requirement sets,
 * in first-seen order, for use as dynamic table columns.
 *
 * @internal
 */
export function extractRequirementColumns(sets: TaxRequirementSet[]): RequirementColumn[] {
  const seen = new Map<string, RequirementColumn>()
  for (const set of sets) {
    const requirements = set.requirements ?? []
    requirements.forEach((requirement, index) => {
      if (!requirement.key || requirement.editable === false) return
      const columnKey = getUniqueRhfKey(requirement, index, requirements)
      if (!seen.has(columnKey)) {
        seen.set(columnKey, { key: columnKey, label: requirement.label })
      }
    })
  }
  return Array.from(seen.values())
}
