import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'

/**
 * Identifies an API request rejected because the access token is missing a
 * required OAuth scope.
 *
 * @remarks
 * Partners who bring their own token may not have granted every scope a
 * component's data depends on. Callers use this to degrade gracefully — render
 * the data they could fetch instead of failing the whole surface — rather than
 * surfacing an error the partner's end user cannot act on.
 *
 * @param error - Error thrown by a query.
 * @returns Whether the request was denied for missing OAuth scopes.
 * @internal
 */
export function isMissingOAuthScopesError(error: unknown): boolean {
  if (!(error instanceof GustoEmbeddedError) || error.httpMeta.response.status !== 403) return false
  try {
    const body: unknown = JSON.parse(error.httpMeta.body)
    return (
      typeof body === 'object' &&
      body !== null &&
      'errors' in body &&
      Array.isArray(body.errors) &&
      body.errors.some(
        (entry: unknown) =>
          typeof entry === 'object' &&
          entry !== null &&
          'category' in entry &&
          entry.category === 'missing_oauth_scopes',
      )
    )
  } catch {
    return false
  }
}
