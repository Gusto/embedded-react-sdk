import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'
import type { Department } from '@gusto/embedded-api/models/components/department'

/**
 * Narrows department responses to entries that can be assigned a schedule.
 *
 * @param departments - Departments returned by the API.
 * @returns Departments with a usable UUID.
 * @internal
 */
export function getCompanyDepartments(departments: Department[] | undefined) {
  return (departments ?? []).filter((department): department is Department & { uuid: string } =>
    Boolean(department.uuid),
  )
}

/**
 * Identifies an assignment data request rejected for missing OAuth scopes.
 *
 * @param error - Assignment query error.
 * @returns Whether access is unavailable because a required scope is missing.
 * @internal
 */
export function isAssignmentAccessDenied(error: unknown): boolean {
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
