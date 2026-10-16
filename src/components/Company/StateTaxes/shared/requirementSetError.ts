import type { EntityErrorObject } from '@gusto/embedded-api/models/components/entityerrorobject'
import { UnprocessableEntityError } from '@gusto/embedded-api/models/errors/unprocessableentityerror'

function hasMetadataKey(metadata: unknown): metadata is { key: string; state?: string } {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    'key' in metadata &&
    typeof (metadata as { key: unknown }).key === 'string'
  )
}

/**
 * A server-reported problem with a single requirement's submitted value.
 *
 * @internal
 */
export interface RequirementValueError {
  requirementKey: string
  message: string
}

/**
 * Identifies which requirement set a requirement-set error targets, plus any per-requirement
 * value errors the server reported inside it.
 *
 * @internal
 */
export interface RequirementSetError {
  key: string
  state?: string
  effectiveFrom?: string
  valueErrors: RequirementValueError[]
}

function extractValueErrors(requirementSetError: EntityErrorObject): RequirementValueError[] {
  return (requirementSetError.errors ?? []).flatMap(requirementError => {
    if (
      requirementError.errorKey !== 'requirements' ||
      !hasMetadataKey(requirementError.metadata)
    ) {
      return []
    }
    const { key } = requirementError.metadata
    return (requirementError.errors ?? [])
      .filter(valueError => typeof valueError.message === 'string')
      .map(valueError => ({ requirementKey: key, message: valueError.message as string }))
  })
}

/**
 * Extracts every requirement-set error from a tax-requirements-update error shaped as
 * `{ errorKey: "requirement_sets", category: "nested_errors", metadata: { key, state } }` —
 * the update endpoint's response when requirement sets (e.g. "registrations", "taxrates") were
 * rejected; one response can carry several sets. Each result includes the nested per-requirement
 * value errors (e.g. an invalid ID format). Returns `null` when no entry has that shape.
 *
 * @internal
 */
export function parseRequirementSetErrors(error: unknown): RequirementSetError[] | null {
  if (!(error instanceof UnprocessableEntityError)) return null

  const requirementSetErrors = error.errors
    .filter(err => err.errorKey === 'requirement_sets' && err.category === 'nested_errors')
    .flatMap(err => {
      if (!hasMetadataKey(err.metadata)) return []
      const { effective_from: effectiveFrom } = err.metadata as { effective_from?: unknown }
      return [
        {
          key: err.metadata.key,
          state: err.metadata.state,
          effectiveFrom: typeof effectiveFrom === 'string' ? effectiveFrom : undefined,
          valueErrors: extractValueErrors(err),
        },
      ]
    })

  return requirementSetErrors.length > 0 ? requirementSetErrors : null
}
