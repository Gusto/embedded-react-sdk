import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Not in the generated `@gusto/embedded-api` client yet. Member routes are shallow (no company
// prefix), and policy endpoints return 404 when the partner's feature flag is off.

export type TimeSheetStatus = 'pending' | 'approved' | 'rejected'

export type PayClassification = 'Regular' | 'Overtime' | 'Double overtime' | 'Unclassified'

export interface ApiTimeSheetEntry {
  uuid: string
  hours_worked: string
  pay_classification: PayClassification
}

export interface ApiTimeSheetBreak {
  uuid: string
  break_rule_uuid: string | null
  start_time: string
  end_time: string | null
}

export interface ApiBreakRule {
  uuid: string
  break_type: 'meal' | 'rest'
  break_duration_in_minutes: number
  for_hours_worked_in_minutes: number
  minimum_time_required_in_minutes?: number
  is_paid: boolean
}

export interface ApiEffectiveBreakPolicy {
  uuid: string
  name: string
  jurisdiction: string | null
  pay_premium: boolean
  rules: ApiBreakRule[]
}

export interface ApiTimeSheet {
  uuid: string
  company_uuid: string
  status: TimeSheetStatus
  time_zone: string
  entity_type: 'Employee' | 'Contractor'
  entity_uuid: string
  job_uuid: string | null
  version: string
  entries: ApiTimeSheetEntry[]
  shift_started_at: string
  shift_ended_at: string | null
  synced_to_payroll_at: string | null
  created_at: string
  updated_at: string
  metadata?: Record<string, string>
  breaks?: ApiTimeSheetBreak[]
  effective_break_policy?: ApiEffectiveBreakPolicy | null
}

export interface ApiOvertimePolicy {
  uuid: string
  company_uuid: string
  name: string
  weekly_overtime_hours_threshold: number
  daily_overtime_hours_threshold: number | null
  double_overtime_hours_threshold: number | null
  work_week_consecutive_days_threshold: number | null
  version: string
  assigned_employees: Array<{ uuid: string }>
}

export interface ApiBreakPolicy {
  uuid: string
  company_uuid: string
  name: string
  jurisdiction: string | null
  pay_premium: boolean
  version: string
  rules: ApiBreakRule[]
  assigned_employees: Array<{ uuid: string }>
}

export interface ApiError {
  error_key: string
  category: string
  message: string
}

export class TimeTrackingApiError extends Error {
  status: number
  errors: ApiError[]

  constructor(status: number, errors: ApiError[], fallback: string) {
    super(errors.map(e => e.message).join(' ') || fallback)
    this.status = status
    this.errors = errors
  }

  get messages(): string[] {
    return this.errors.length > 0 ? this.errors.map(e => e.message) : [this.message]
  }
}

export function errorMessages(error: unknown): string[] {
  if (error instanceof TimeTrackingApiError) return error.messages
  if (error instanceof Error) return [error.message]
  return ['Something went wrong. Please try again.']
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string> | undefined),
    },
  })
  if (res.status === 204) return undefined as T
  const body = (await res.json().catch(() => null)) as unknown
  if (!res.ok) {
    const errors = (body as { errors?: ApiError[] } | null)?.errors ?? []
    throw new TimeTrackingApiError(res.status, errors, `Request failed (${res.status})`)
  }
  return body as T
}

function toQueryString(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, value)
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

export const timeTrackingKeys = {
  all: ['sdk-app', 'timeTracking'] as const,
  timeSheets: (companyId: string, after: string, before: string) =>
    [...timeTrackingKeys.all, 'timeSheets', companyId, after, before] as const,
  overtimePolicies: (companyId: string) =>
    [...timeTrackingKeys.all, 'overtimePolicies', companyId] as const,
  breakPolicies: (companyId: string) =>
    [...timeTrackingKeys.all, 'breakPolicies', companyId] as const,
}

export interface TimeSheetRange {
  shiftStartedAfter: string
  shiftStartedBefore: string
}

export function useTimeSheets(companyId: string, range: TimeSheetRange | null) {
  return useQuery({
    queryKey: timeTrackingKeys.timeSheets(
      companyId,
      range?.shiftStartedAfter ?? '',
      range?.shiftStartedBefore ?? '',
    ),
    enabled: range !== null,
    queryFn: () =>
      request<ApiTimeSheet[]>(
        `/v1/companies/${companyId}/time_tracking/time_sheets${toQueryString({
          entity_type: 'Employee',
          shift_started_after: range?.shiftStartedAfter,
          shift_started_before: range?.shiftStartedBefore,
          sort_by: 'shift_started_at',
          include: 'effective_break_policy',
        })}`,
      ),
  })
}

export function useOvertimePolicies(companyId: string) {
  return useQuery({
    queryKey: timeTrackingKeys.overtimePolicies(companyId),
    retry: false,
    queryFn: () =>
      request<ApiOvertimePolicy[]>(`/v1/companies/${companyId}/time_tracking/overtime_policies`),
  })
}

export function useBreakPolicies(companyId: string) {
  return useQuery({
    queryKey: timeTrackingKeys.breakPolicies(companyId),
    retry: false,
    queryFn: () =>
      request<ApiBreakPolicy[]>(`/v1/companies/${companyId}/time_tracking/break_policies`),
  })
}

// The SDK QueryClient's global invalidation only covers `@gusto/embedded-api` mutation keys.
function useTimeTrackingMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: timeTrackingKeys.all }),
  })
}

export interface TimeSheetUpdateBody {
  version: string
  status?: TimeSheetStatus
  shift_started_at?: string
  shift_ended_at?: string | null
  entries?: Array<{
    uuid?: string
    hours_worked?: number
    pay_classification?: PayClassification
    _destroy?: boolean
  }>
  breaks?: Array<{
    uuid?: string
    start_time?: string
    end_time?: string | null
    break_rule_uuid?: string | null
    _destroy?: boolean
  }>
}

export function updateTimeSheet(uuid: string, body: TimeSheetUpdateBody) {
  return request<ApiTimeSheet>(`/v1/time_tracking/time_sheets/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function useUpdateTimeSheet() {
  return useTimeTrackingMutation(({ uuid, body }: { uuid: string; body: TimeSheetUpdateBody }) =>
    updateTimeSheet(uuid, body),
  )
}

export interface StatusChangeTarget {
  uuid: string
  version: string
}

export interface StatusChangeResult {
  uuid: string
  ok: boolean
  messages: string[]
}

/** No bulk status endpoint, so this fans out per time sheet and reports each outcome. */
export function useChangeTimeSheetStatus() {
  return useTimeTrackingMutation(
    async ({ targets, status }: { targets: StatusChangeTarget[]; status: TimeSheetStatus }) => {
      const settled = await Promise.allSettled(
        targets.map(target => updateTimeSheet(target.uuid, { version: target.version, status })),
      )
      return settled.map<StatusChangeResult>((outcome, index) => ({
        uuid: targets[index]!.uuid,
        ok: outcome.status === 'fulfilled',
        messages: outcome.status === 'rejected' ? errorMessages(outcome.reason) : [],
      }))
    },
  )
}

export interface OvertimePolicyBody {
  name: string
  weekly_overtime_hours_threshold: number
  daily_overtime_hours_threshold: number | null
  double_overtime_hours_threshold: number | null
  work_week_consecutive_days_threshold: number | null
}

export function useSaveOvertimePolicy(companyId: string) {
  return useTimeTrackingMutation(
    ({ uuid, version, body }: { uuid?: string; version?: string; body: OvertimePolicyBody }) =>
      uuid
        ? request<ApiOvertimePolicy>(`/v1/time_tracking/overtime_policies/${uuid}`, {
            method: 'PATCH',
            body: JSON.stringify({ ...body, version }),
          })
        : request<ApiOvertimePolicy>(`/v1/companies/${companyId}/time_tracking/overtime_policies`, {
            method: 'POST',
            body: JSON.stringify(body),
          }),
  )
}

export interface BreakPolicyBody {
  name: string
  pay_premium: boolean
  jurisdiction?: string
  rules: Array<{
    uuid?: string
    break_type: 'meal' | 'rest'
    is_paid: boolean
    break_duration_in_minutes: number
    for_hours_worked_in_minutes: number
  }>
}

export function useSaveBreakPolicy(companyId: string) {
  return useTimeTrackingMutation(
    ({ uuid, version, body }: { uuid?: string; version?: string; body: BreakPolicyBody }) => {
      if (!uuid) {
        return request<ApiBreakPolicy>(`/v1/companies/${companyId}/time_tracking/break_policies`, {
          method: 'POST',
          body: JSON.stringify(body),
        })
      }
      // Update is a full replacement and rejects `jurisdiction` (it's fixed at creation).
      const { jurisdiction: _jurisdiction, ...updateBody } = body
      return request<ApiBreakPolicy>(`/v1/time_tracking/break_policies/${uuid}`, {
        method: 'PUT',
        body: JSON.stringify({ ...updateBody, version }),
      })
    },
  )
}

export interface AssignmentChange {
  policyUuid: string
  version: string
  assign: string[]
  remove: string[]
}

export function useAssignOvertimePolicy() {
  return useTimeTrackingMutation(({ policyUuid, version, assign }: AssignmentChange) =>
    request<ApiOvertimePolicy>(
      `/v1/time_tracking/overtime_policies/${policyUuid}/assign_employees`,
      {
        method: 'PUT',
        body: JSON.stringify({ version, employees: assign.map(uuid => ({ uuid })) }),
      },
    ),
  )
}

/** Assign bumps the policy version, so remove must use the version it returns. */
export function useAssignBreakPolicy() {
  return useTimeTrackingMutation(
    async ({ policyUuid, version, assign, remove }: AssignmentChange) => {
      let currentVersion = version
      if (assign.length > 0) {
        const assigned = await request<ApiBreakPolicy>(
          `/v1/time_tracking/break_policies/${policyUuid}/assign_employees`,
          {
            method: 'PUT',
            body: JSON.stringify({
              version: currentVersion,
              employees: assign.map(uuid => ({ uuid })),
            }),
          },
        )
        currentVersion = assigned.version
      }
      if (remove.length > 0) {
        await request<ApiBreakPolicy>(
          `/v1/time_tracking/break_policies/${policyUuid}/remove_employees`,
          {
            method: 'PUT',
            body: JSON.stringify({
              version: currentVersion,
              employees: remove.map(uuid => ({ uuid })),
            }),
          },
        )
      }
    },
  )
}
