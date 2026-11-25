import type { GustoEmbeddedCore } from '@gusto/embedded-api/core'
import { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
import { fetchAllEmployees } from './resolvePayScheduleEmployees'

// Undocumented, not exposed by the partner API: break/overtime policy assignment is limited
// to hourly or salaried nonexempt employees. Everyone else (Exempt, Owner, Commission Only *)
// is ineligible.
const ELIGIBLE_FLSA_STATUSES = new Set<FlsaStatusType>([
  FlsaStatusType.Nonexempt,
  FlsaStatusType.SalariedNonexempt,
])

export interface TimeTrackingEligibility {
  uuid: string
  firstName: string
  lastName: string
  eligible: boolean
  /** Present when `eligible` is false. */
  reason?: string
}

/**
 * There's no eligibility filter on the employees endpoint, so the only way to know who can be
 * assigned a break or overtime policy is to fetch every employee and apply the backend's own
 * (undocumented) FLSA-status rule client-side.
 */
export async function getEligibleTimeTrackingEmployees(
  client: GustoEmbeddedCore,
  companyId: string,
): Promise<TimeTrackingEligibility[]> {
  const employees = await fetchAllEmployees(client, companyId)

  return employees.map(employee => {
    const base = { uuid: employee.uuid, firstName: employee.firstName, lastName: employee.lastName }

    if (!employee.flsaStatus) {
      return { ...base, eligible: false, reason: 'No FLSA status on record' }
    }
    if (ELIGIBLE_FLSA_STATUSES.has(employee.flsaStatus)) {
      return { ...base, eligible: true }
    }
    return {
      ...base,
      eligible: false,
      reason: `FLSA status "${employee.flsaStatus}" isn't eligible for break/overtime policies (eligible: Nonexempt, Salaried Nonexempt)`,
    }
  })
}
