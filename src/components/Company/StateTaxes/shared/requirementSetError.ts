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
 * Extracts `{ key, state }` from a tax-requirements-update error shaped as
 * `{ errorKey: "requirement_sets", category: "nested_errors", metadata: { key, state } }` —
 * the update endpoint's response when a requirement set (e.g. "registrations") was rejected —
 * along with the nested per-requirement value errors (e.g. an invalid ID format). Returns `null`
 * for any other error shape.
 *
 * @internal
 */
export function parseRequirementSetError(error: unknown): RequirementSetError | null {
  if (!(error instanceof UnprocessableEntityError)) return null

  const match = error.errors.find(
    err => err.errorKey === 'requirement_sets' && err.category === 'nested_errors',
  )
  if (!match || !hasMetadataKey(match.metadata)) return null

  const { effective_from: effectiveFrom } = match.metadata as { effective_from?: unknown }

  return {
    key: match.metadata.key,
    state: match.metadata.state,
    effectiveFrom: typeof effectiveFrom === 'string' ? effectiveFrom : undefined,
    valueErrors: extractValueErrors(match),
  }
}
