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

export function loadErrorMessage(error: unknown, resource: string, scope: string): string | null {
  if (!error) return null
  if (error instanceof TimeTrackingApiError && error.status === 404) {
    return `The ${resource} API isn’t enabled for this partner (404). It’s gated behind a per-partner feature flag.`
  }
  if (error instanceof TimeTrackingApiError && error.status === 403) {
    return `This token is missing the ${scope} scope (403).`
  }
  return errorMessages(error).join(' ')
}

async function requestWithHeaders(
  path: string,
  init?: RequestInit,
): Promise<{ body: unknown; headers: Headers }> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string> | undefined),
    },
  })
  if (res.status === 204) return { body: undefined, headers: res.headers }
  const body = (await res.json().catch(() => null)) as unknown
  if (!res.ok) {
    const errors = (body as { errors?: ApiError[] } | null)?.errors ?? []
    throw new TimeTrackingApiError(res.status, errors, `Request failed (${res.status})`)
  }
  return { body, headers: res.headers }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  return (await requestWithHeaders(path, init)).body as T
}

function toQueryString(params: Record<string, string | string[] | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, item)
    } else if (value !== undefined) {
      search.set(key, value)
    }
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

export const timeTrackingKeys = {
  all: ['sdk-app', 'timeTracking'] as const,
  timeSheets: (companyId: string, after: string, before: string, entityType: string) =>
    [...timeTrackingKeys.all, 'timeSheets', companyId, after, before, entityType] as const,
  timeSheetPage: (companyId: string, params: TimeSheetPageParams) =>
    [...timeTrackingKeys.all, 'timeSheetPage', companyId, params] as const,
  overtimePolicies: (companyId: string) =>
    [...timeTrackingKeys.all, 'overtimePolicies', companyId] as const,
  breakPolicies: (companyId: string) =>
    [...timeTrackingKeys.all, 'breakPolicies', companyId] as const,
}

export interface TimeSheetRange {
  shiftStartedAfter: string
  shiftStartedBefore: string
}

export function useTimeSheets(
  companyId: string,
  range: TimeSheetRange | null,
  entityType: 'Employee' | 'Contractor' = 'Employee',
) {
  return useQuery({
    queryKey: timeTrackingKeys.timeSheets(
      companyId,
      range?.shiftStartedAfter ?? '',
      range?.shiftStartedBefore ?? '',
      entityType,
    ),
    enabled: range !== null,
    queryFn: () =>
      request<ApiTimeSheet[]>(
        `/v1/companies/${companyId}/time_tracking/time_sheets${toQueryString({
          entity_type: entityType,
          per: '500',
          shift_started_after: range?.shiftStartedAfter,
          shift_started_before: range?.shiftStartedBefore,
          sort_by: 'shift_started_at',
          include: 'effective_break_policy',
        })}`,
      ),
  })
}

export interface TimeSheetPageParams extends TimeSheetRange {
  status: TimeSheetStatus | null
  employeeUuids: string[]
  page: number
  per: number
}

/** Filtering, sorting, and paging all happen server-side; totals come from the `x-total-*` headers. */
export function useTimeSheetPage(companyId: string, params: TimeSheetPageParams) {
  return useQuery({
    queryKey: timeTrackingKeys.timeSheetPage(companyId, params),
    placeholderData: previous => previous,
    queryFn: async () => {
      const { body, headers } = await requestWithHeaders(
        `/v1/companies/${companyId}/time_tracking/time_sheets${toQueryString({
          entity_type: 'Employee',
          shift_started_after: params.shiftStartedAfter,
          shift_started_before: params.shiftStartedBefore,
          status: params.status ?? undefined,
          'entity_uuids[]': params.employeeUuids,
          sort_by: 'shift_started_at',
          sort_order: 'desc',
          page: String(params.page),
          per: String(params.per),
          include: 'effective_break_policy',
        })}`,
      )
      return { body: body as ApiTimeSheet[], headers }
    },
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
  job_uuid?: string
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

export interface TimeSheetCreateBody {
  entity_uuid: string
  entity_type: 'Employee'
  status: TimeSheetStatus
  job_uuid: string | null
  time_zone: string
  shift_started_at: string
  shift_ended_at: string | null
  entries: Array<{ hours_worked: number; pay_classification: PayClassification }>
  breaks: Array<{ start_time: string; end_time: string | null; break_rule_uuid: string | null }>
}

export function useCreateTimeSheet(companyId: string) {
  return useTimeTrackingMutation((body: TimeSheetCreateBody) =>
    request<ApiTimeSheet>(`/v1/companies/${companyId}/time_tracking/time_sheets`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  )
}

export function useDeleteTimeSheet() {
  return useTimeTrackingMutation(({ uuid, version }: { uuid: string; version: string }) =>
    request<unknown>(`/v1/time_tracking/time_sheets/${uuid}${toQueryString({ version })}`, {
      method: 'DELETE',
    }),
  )
}

/** The batch endpoint only supports create and update, so each time sheet gets its own DELETE. */
export function useDeleteTimeSheets() {
  return useTimeTrackingMutation(async (targets: StatusChangeTarget[]) => {
    const settled = await Promise.allSettled(
      targets.map(target =>
        request<unknown>(
          `/v1/time_tracking/time_sheets/${target.uuid}${toQueryString({ version: target.version })}`,
          { method: 'DELETE' },
        ),
      ),
    )
    return settled.map<StatusChangeResult>((outcome, index) => ({
      uuid: targets[index]!.uuid,
      ok: outcome.status === 'fulfilled',
      messages: outcome.status === 'rejected' ? errorMessages(outcome.reason) : [],
    }))
  })
}

export function useDeletePolicy(kind: 'overtime' | 'break') {
  const resource = kind === 'overtime' ? 'overtime_policies' : 'break_policies'
  return useTimeTrackingMutation(({ uuid, version }: { uuid: string; version: string }) =>
    request<unknown>(`/v1/time_tracking/${resource}/${uuid}${toQueryString({ version })}`, {
      method: 'DELETE',
    }),
  )
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

interface ApiBatch {
  uuid: string
  status: string
  completed_at?: string | null
  results: Array<{ external_id: string; status: string; errors?: ApiError[] }>
}

const BATCH_LIMIT = 500
const BATCH_POLL_ATTEMPTS = 20
const BATCH_POLL_INTERVAL_MS = 1000

async function waitForBatch(batchUuid: string): Promise<ApiBatch> {
  for (let attempt = 0; attempt < BATCH_POLL_ATTEMPTS; attempt++) {
    const batch = await request<ApiBatch>(`/v1/time_tracking/time_sheets_batches/${batchUuid}`)
    if (batch.completed_at) return batch
    await new Promise(resolve => setTimeout(resolve, BATCH_POLL_INTERVAL_MS))
  }
  throw new Error('Approval is taking longer than expected. Refresh to see the latest status.')
}

/** Requests over the 500-item limit fail entirely, so status changes are chunked. */
async function changeStatusInBatches(
  companyId: string,
  targets: StatusChangeTarget[],
  status: TimeSheetStatus,
): Promise<StatusChangeResult[]> {
  const results: StatusChangeResult[] = []
  for (let index = 0; index < targets.length; index += BATCH_LIMIT) {
    const chunk = targets.slice(index, index + BATCH_LIMIT)
    const created = await request<ApiBatch>(
      `/v1/companies/${companyId}/time_tracking/time_sheets_batches`,
      {
        method: 'POST',
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          batch_action: 'update',
          time_sheets: chunk.map(target => ({
            external_id: target.uuid,
            uuid: target.uuid,
            version: target.version,
            status,
          })),
        }),
      },
    )
    const batch = created.completed_at ? created : await waitForBatch(created.uuid)
    for (const target of chunk) {
      const item = batch.results.find(result => result.external_id === target.uuid)
      const messages = item?.errors?.map(error => error.message) ?? []
      results.push({ uuid: target.uuid, ok: item !== undefined && messages.length === 0, messages })
    }
  }
  // Approving one sheet re-versions the employee's other sheets, so their items fail as stale.
  return Promise.all(
    results.map(async result => {
      if (result.ok) return result
      const current = await request<ApiTimeSheet>(`/v1/time_tracking/time_sheets/${result.uuid}`)
      return current.status === status ? { uuid: result.uuid, ok: true, messages: [] } : result
    }),
  )
}

async function changeStatusIndividually(
  targets: StatusChangeTarget[],
  status: TimeSheetStatus,
): Promise<StatusChangeResult[]> {
  const settled = await Promise.allSettled(
    targets.map(target => updateTimeSheet(target.uuid, { version: target.version, status })),
  )
  // Without the partner's approval-enhancements flag the API drops `status` and still returns 200.
  return settled.map<StatusChangeResult>((outcome, index) => {
    const uuid = targets[index]!.uuid
    if (outcome.status === 'rejected') {
      return { uuid, ok: false, messages: errorMessages(outcome.reason) }
    }
    if (outcome.value.status !== status) {
      return {
        uuid,
        ok: false,
        messages: ['Changing timesheet approval isn’t enabled for this partner.'],
      }
    }
    return { uuid, ok: true, messages: [] }
  })
}

/**
 * Uses the batch endpoint, which is gated behind the partner's approval-enhancements flag.
 * Falls back to one PATCH per time sheet when batch updates aren't available.
 */
export function useChangeTimeSheetStatus(companyId: string) {
  return useTimeTrackingMutation(
    async ({ targets, status }: { targets: StatusChangeTarget[]; status: TimeSheetStatus }) => {
      if (targets.length === 1) return changeStatusIndividually(targets, status)
      try {
        return await changeStatusInBatches(companyId, targets, status)
      } catch (error) {
        if (error instanceof TimeTrackingApiError && [404, 422].includes(error.status)) {
          return changeStatusIndividually(targets, status)
        }
        throw error
      }
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
