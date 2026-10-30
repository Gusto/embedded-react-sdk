import type { Department } from '@gusto/embedded-api/models/components/department'
import { isMissingOAuthScopesError } from '@/helpers/missingOAuthScopes'

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
  return isMissingOAuthScopesError(error)
}
