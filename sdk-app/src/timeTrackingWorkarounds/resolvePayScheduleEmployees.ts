import type { GustoEmbeddedCore } from '@gusto/embedded-api/core'
import { employeesList } from '@gusto/embedded-api/funcs/employeesList'
import { paySchedulesGetAssignments } from '@gusto/embedded-api/funcs/paySchedulesGetAssignments'
import { unwrapAsync } from '@gusto/embedded-api/types/fp'
import type { ShowEmployees } from '@gusto/embedded-api/models/components/showemployees'
import { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
import { PayScheduleAssignmentType } from '@gusto/embedded-api/models/components/payscheduleassignment'

// Not documented anywhere -- inferred from FlsaStatusType's description ("Hourly
// ('Nonexempt')... Commissioned with overtime ('Commission Only Nonexempt')...").
// Everything else (Exempt, Salaried Nonexempt, Owner, Commission Only Exempt) is
// treated as salaried. Ported from the raw-fetch PayPeriodShiftsExplorer.tsx assumption.
const HOURLY_FLSA_STATUSES = new Set<FlsaStatusType>([
  FlsaStatusType.Nonexempt,
  FlsaStatusType.CommissionOnlyNonexempt,
])

export type PayScheduleResolutionMethod =
  | 'employee override'
  | 'hourly/salaried split (inferred)'
  | 'department default'
  | 'company default'

export interface ResolvedPayScheduleEmployee {
  uuid: string
  payScheduleUuid: string
  method: PayScheduleResolutionMethod
}

export interface PayScheduleEmployeeResolution {
  resolvedEmployees: ResolvedPayScheduleEmployee[]
  unresolvedEmployees: ShowEmployees[]
}

/**
 * Fetches every page of `/v1/companies/{company_id}/employees`. There's no endpoint-level
 * "give me everyone" option -- callers that need the full roster (eligibility checks, pay
 * schedule resolution) have to walk `x-total-pages` themselves.
 */
export async function fetchAllEmployees(
  client: GustoEmbeddedCore,
  companyId: string,
): Promise<ShowEmployees[]> {
  const perPage = 100
  const all: ShowEmployees[] = []
  let page = 1
  let totalPages = 1
  do {
    const result = await unwrapAsync(employeesList(client, { companyId, page, per: perPage }))
    all.push(...(result.showEmployees ?? []))
    totalPages = Number(result.httpMeta.response.headers.get('x-total-pages') ?? 1)
    page += 1
  } while (page <= totalPages)
  return all
}

function resolveOne(
  employee: ShowEmployees,
  assignmentType: PayScheduleAssignmentType | null | undefined,
  defaultPayScheduleUuid: string | null | undefined,
  hourlyPayScheduleUuid: string | null | undefined,
  salariedPayScheduleUuid: string | null | undefined,
  employeeOverrides: Map<string, string>,
  departmentSchedules: Map<string, string>,
): ResolvedPayScheduleEmployee | null {
  const override = employeeOverrides.get(employee.uuid)
  if (override) {
    return { uuid: employee.uuid, payScheduleUuid: override, method: 'employee override' }
  }

  switch (assignmentType) {
    case PayScheduleAssignmentType.Single:
      return defaultPayScheduleUuid
        ? {
            uuid: employee.uuid,
            payScheduleUuid: defaultPayScheduleUuid,
            method: 'company default',
          }
        : null
    case PayScheduleAssignmentType.HourlySalaried: {
      const payScheduleUuid =
        employee.flsaStatus && HOURLY_FLSA_STATUSES.has(employee.flsaStatus)
          ? hourlyPayScheduleUuid
          : salariedPayScheduleUuid
      return payScheduleUuid
        ? { uuid: employee.uuid, payScheduleUuid, method: 'hourly/salaried split (inferred)' }
        : null
    }
    case PayScheduleAssignmentType.ByDepartment: {
      const departmentSchedule = employee.departmentUuid
        ? departmentSchedules.get(employee.departmentUuid)
        : undefined
      if (departmentSchedule) {
        return {
          uuid: employee.uuid,
          payScheduleUuid: departmentSchedule,
          method: 'department default',
        }
      }
      return defaultPayScheduleUuid
        ? {
            uuid: employee.uuid,
            payScheduleUuid: defaultPayScheduleUuid,
            method: 'company default',
          }
        : null
    }
    case PayScheduleAssignmentType.ByEmployee:
      return defaultPayScheduleUuid
        ? {
            uuid: employee.uuid,
            payScheduleUuid: defaultPayScheduleUuid,
            method: 'company default',
          }
        : null
    default:
      return null
  }
}

/**
 * No endpoint filters anything by pay schedule, so the only way to know who's on one is to
 * fetch the company's assignment rule and every employee, then replicate the backend's
 * resolution logic client-side.
 *
 * This resolves *current* assignment only -- there's no API surface for past assignment-rule
 * changes to resolve historical membership against.
 */
export async function resolvePayScheduleEmployees(
  client: GustoEmbeddedCore,
  companyId: string,
): Promise<PayScheduleEmployeeResolution> {
  const [assignment, employees] = await Promise.all([
    unwrapAsync(paySchedulesGetAssignments(client, { companyId })).then(
      r => r.payScheduleAssignment,
    ),
    fetchAllEmployees(client, companyId),
  ])

  const employeeOverrides = new Map<string, string>()
  for (const entry of assignment?.employees ?? []) {
    if (entry.employeeUuid && entry.payScheduleUuid) {
      employeeOverrides.set(entry.employeeUuid, entry.payScheduleUuid)
    }
  }
  const departmentSchedules = new Map<string, string>()
  for (const entry of assignment?.departments ?? []) {
    if (entry.departmentUuid && entry.payScheduleUuid) {
      departmentSchedules.set(entry.departmentUuid, entry.payScheduleUuid)
    }
  }

  const resolvedEmployees: ResolvedPayScheduleEmployee[] = []
  const unresolvedEmployees: ShowEmployees[] = []
  if (assignment) {
    for (const employee of employees) {
      const resolved = resolveOne(
        employee,
        assignment.type,
        assignment.defaultPayScheduleUuid,
        assignment.hourlyPayScheduleUuid,
        assignment.salariedPayScheduleUuid,
        employeeOverrides,
        departmentSchedules,
      )
      if (resolved) resolvedEmployees.push(resolved)
      else unresolvedEmployees.push(employee)
    }
  } else {
    unresolvedEmployees.push(...employees)
  }

  return { resolvedEmployees, unresolvedEmployees }
}
