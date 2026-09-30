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
 * `{ key, state }` identifying which requirement set an incomplete-requirement-set error targets.
 *
 * @internal
 */
export interface RequirementSetError {
  key: string
  state?: string
}

/**
 * Extracts `{ key, state }` from a tax-requirements-update error shaped as
 * `{ errorKey: "requirement_sets", category: "nested_errors", metadata: { key, state } }` —
 * the update endpoint's response when a requirement set (e.g. "registrations") was submitted
 * incomplete. Returns `null` for any other error shape.
 *
 * @internal
 */
export function parseRequirementSetError(error: unknown): RequirementSetError | null {
  if (!(error instanceof UnprocessableEntityError)) return null

  const match = error.errors.find(
    err => err.errorKey === 'requirement_sets' && err.category === 'nested_errors',
  )
  if (!match || !hasMetadataKey(match.metadata)) return null

  return { key: match.metadata.key, state: match.metadata.state }
}
