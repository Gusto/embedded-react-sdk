import { Suspense, useMemo, useState } from 'react'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePaySchedulesGetPayPeriodsSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetPayPeriods'
import { useEmployeesList } from '@gusto/embedded-api/react-query/employeesList'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { TimeTrackingOverview } from '../../../components/company/management/TimeTracking/TimeTrackingOverview'
import { PayPeriodTimesheets } from '../../../components/company/management/TimeTracking/PayPeriodTimesheets'
import { EmployeeTimesheet } from '../../../components/company/management/TimeTracking/EmployeeTimesheet'
import { ShiftEditForm } from '../../../components/company/management/TimeTracking/ShiftEditForm'
import { OvertimePolicyForm } from '../../../components/company/management/TimeTracking/OvertimePolicyForm'
import { BreakPolicyForm } from '../../../components/company/management/TimeTracking/BreakPolicyForm'
import { PolicyEmployeeAssignment } from '../../../components/company/management/TimeTracking/PolicyEmployeeAssignment'
import { formatDayWithWeekday } from '../../../components/company/management/TimeTracking/formatters'
import type {
  BulkActionResult,
  PolicyKind,
  TimesheetStatus,
} from '../../../components/company/management/TimeTracking/types'
import {
  countUnassignedForOvertime,
  employeeName,
  jobTitle,
  sheetsInPeriod,
  timeSheetRangeFor,
  toAssignableEmployees,
  toBreakPolicy,
  toEmployeeRows,
  toOvertimePolicy,
  toPayPeriodSummaries,
  toShift,
  toShiftUpdateBody,
  type TimeTrackingEmployee,
} from './adapters'
import {
  TimeTrackingApiError,
  errorMessages,
  useAssignBreakPolicy,
  useAssignOvertimePolicy,
  useBreakPolicies,
  useChangeTimeSheetStatus,
  useOvertimePolicies,
  useSaveBreakPolicy,
  useSaveOvertimePolicy,
  useTimeSheets,
  useUpdateTimeSheet,
  type ApiTimeSheet,
  type StatusChangeResult,
} from './timeTrackingApi'
import { BaseComponent } from '@/components/Base'
import { Flex, Loading } from '@/components/Common'
import { addDays, formatDateToStringDate } from '@/helpers/dateFormatting'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface TimeTrackingProps {
  companyId: string
}

type View =
  | { name: 'overview' }
  | { name: 'period'; periodId: string }
  | { name: 'employee'; periodId: string; employeeUuid: string }
  | { name: 'editShift'; periodId: string; employeeUuid: string; shiftId: string }
  | { name: 'overtimeForm'; policyId?: string }
  | { name: 'breakForm'; policyId?: string }
  | { name: 'assign'; kind: PolicyKind; policyId: string }

const HISTORY_DAYS = 180

const STATUS_ACTION: Record<TimesheetStatus, BulkActionResult['action']> = {
  approved: 'approved',
  rejected: 'rejected',
  pending: 'pending',
}

function policyErrorMessage(error: unknown, resource: string, scope: string): string | null {
  if (!error) return null
  if (error instanceof TimeTrackingApiError && error.status === 404) {
    return `The ${resource} API isn’t enabled for this partner (404). It’s gated behind a per-partner feature flag.`
  }
  if (error instanceof TimeTrackingApiError && error.status === 403) {
    return `This token is missing the ${scope} scope (403).`
  }
  return errorMessages(error).join(' ')
}

function Root({ companyId }: TimeTrackingProps) {
  const Components = useComponentContext()
  const [view, setView] = useState<View>({ name: 'overview' })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [statusResult, setStatusResult] = useState<BulkActionResult | null>(null)
  const [serverErrors, setServerErrors] = useState<string[]>([])

  const navigate = (next: View) => {
    setServerErrors([])
    setStatusResult(null)
    if (next.name !== 'overview') setSuccessMessage(null)
    setView(next)
  }

  const [dateWindow] = useState(() => {
    const today = new Date()
    return {
      today: formatDateToStringDate(today) ?? '',
      start: formatDateToStringDate(addDays(today, -HISTORY_DAYS)) ?? '',
    }
  })

  const { data: schedulesData } = usePaySchedulesGetAllSuspense({ companyId })
  const schedules = useMemo(() => schedulesData.payScheduleShowResponse ?? [], [schedulesData])
  const [selectedScheduleId, setSelectedScheduleId] = useState(schedules[0]?.uuid ?? '')

  const { data: payPeriodsData } = usePaySchedulesGetPayPeriodsSuspense({
    companyId,
    startDate: new RFCDate(dateWindow.start),
    endDate: new RFCDate(dateWindow.today),
  })

  // Non-suspense so a missing employees scope degrades to an empty roster instead of crashing.
  const { data: employeesData } = useEmployeesList({ companyId }, { throwOnError: false })
  const employees = useMemo(
    () => (employeesData?.showEmployees ?? []) as unknown as TimeTrackingEmployee[],
    [employeesData],
  )
  const employeesByUuid = useMemo(() => new Map(employees.map(e => [e.uuid, e])), [employees])

  const overtimeQuery = useOvertimePolicies(companyId)
  const breakQuery = useBreakPolicies(companyId)
  const overtimePolicies = useMemo(
    () => (overtimeQuery.data ?? []).map(toOvertimePolicy),
    [overtimeQuery.data],
  )
  const breakPolicies = useMemo(() => (breakQuery.data ?? []).map(toBreakPolicy), [breakQuery.data])

  const scheduleFilteredPeriods = useMemo(
    () =>
      (payPeriodsData.payPeriods ?? []).filter(
        period => !selectedScheduleId || period.payScheduleUuid === selectedScheduleId,
      ),
    [payPeriodsData, selectedScheduleId],
  )
  const emptySummaries = useMemo(
    () => toPayPeriodSummaries(scheduleFilteredPeriods, [], dateWindow.today),
    [scheduleFilteredPeriods, dateWindow.today],
  )
  const timeSheetsQuery = useTimeSheets(companyId, timeSheetRangeFor(emptySummaries))
  const sheets = useMemo(() => timeSheetsQuery.data ?? [], [timeSheetsQuery.data])
  const summaries = useMemo(
    () => toPayPeriodSummaries(scheduleFilteredPeriods, sheets, dateWindow.today),
    [scheduleFilteredPeriods, sheets, dateWindow.today],
  )

  const updateTimeSheet = useUpdateTimeSheet()
  const changeStatus = useChangeTimeSheetStatus()
  const saveOvertimePolicy = useSaveOvertimePolicy(companyId)
  const saveBreakPolicy = useSaveBreakPolicy(companyId)
  const assignOvertime = useAssignOvertimePolicy()
  const assignBreak = useAssignBreakPolicy()

  const findPeriod = (periodId: string) => summaries.find(summary => summary.id === periodId)
  const periodSheets = (periodId: string): ApiTimeSheet[] => {
    const period = findPeriod(periodId)
    return period ? sheetsInPeriod(sheets, period) : []
  }

  const applyStatusChange = async (
    targets: ApiTimeSheet[],
    status: TimesheetStatus,
    labelFor: (sheet: ApiTimeSheet) => { id: string; label: string },
  ) => {
    const actionable = targets.filter(
      sheet => sheet.status !== status && !sheet.synced_to_payroll_at,
    )
    if (actionable.length === 0) return
    const results = await changeStatus.mutateAsync({
      targets: actionable.map(sheet => ({ uuid: sheet.uuid, version: sheet.version })),
      status,
    })
    setStatusResult(groupResults(actionable, results, status, labelFor))
  }

  const groupResults = (
    targets: ApiTimeSheet[],
    results: StatusChangeResult[],
    status: TimesheetStatus,
    labelFor: (sheet: ApiTimeSheet) => { id: string; label: string },
  ): BulkActionResult => {
    const groups = new Map<string, { label: string; failures: string[] }>()
    targets.forEach((sheet, index) => {
      const { id, label } = labelFor(sheet)
      const group = groups.get(id) ?? { label, failures: [] }
      const result = results[index]
      if (result && !result.ok) group.failures.push(...result.messages)
      groups.set(id, group)
    })
    const succeeded: BulkActionResult['succeeded'] = []
    const failed: BulkActionResult['failed'] = []
    for (const [id, group] of groups) {
      if (group.failures.length === 0) succeeded.push({ id, label: group.label })
      else failed.push({ id, label: group.label, messages: [...new Set(group.failures)] })
    }
    return { action: STATUS_ACTION[status], succeeded, failed }
  }

  const employeeLabel = (sheet: ApiTimeSheet) => {
    const employee = employeesByUuid.get(sheet.entity_uuid)
    return { id: sheet.entity_uuid, label: employee ? employeeName(employee) : 'Unknown employee' }
  }

  const changeEmployeesStatus = (
    periodId: string,
    employeeUuids: string[],
    status: TimesheetStatus,
  ) => {
    const uuids = new Set(employeeUuids)
    void applyStatusChange(
      periodSheets(periodId).filter(sheet => uuids.has(sheet.entity_uuid)),
      status,
      employeeLabel,
    )
  }

  if (view.name === 'period' || view.name === 'employee' || view.name === 'editShift') {
    const period = findPeriod(view.periodId)
    if (!period || timeSheetsQuery.isLoading) return <Loading />

    if (view.name === 'period') {
      return (
        <PayPeriodTimesheets
          key={period.id}
          period={period}
          rows={toEmployeeRows(periodSheets(period.id), employees, overtimePolicies)}
          bulkResult={statusResult}
          isSubmitting={changeStatus.isPending}
          onDismissBulkResult={() => {
            setStatusResult(null)
          }}
          onBack={() => {
            navigate({ name: 'overview' })
          }}
          onReviewEmployee={employeeUuid => {
            navigate({ name: 'employee', periodId: period.id, employeeUuid })
          }}
          onApproveEmployees={uuids => {
            changeEmployeesStatus(period.id, uuids, 'approved')
          }}
          onRejectEmployees={uuids => {
            changeEmployeesStatus(period.id, uuids, 'rejected')
          }}
        />
      )
    }

    const employee = employeesByUuid.get(view.employeeUuid)
    const name = employee ? employeeName(employee) : 'Unknown employee'
    const employeeSheets = periodSheets(period.id).filter(
      sheet => sheet.entity_uuid === view.employeeUuid,
    )
    const shifts = employeeSheets.map(toShift)

    if (view.name === 'editShift') {
      const shift = shifts.find(s => s.id === view.shiftId)
      const backToEmployee = () => {
        navigate({ name: 'employee', periodId: period.id, employeeUuid: view.employeeUuid })
      }
      if (!shift) {
        return (
          <Components.Alert
            status="warning"
            label="This shift is no longer available"
            action={
              <Components.Button variant="secondary" onClick={backToEmployee}>
                Back to timesheet
              </Components.Button>
            }
          />
        )
      }
      return (
        <ShiftEditForm
          key={shift.id}
          shift={shift}
          employeeName={name}
          serverErrors={serverErrors}
          isSubmitting={updateTimeSheet.isPending}
          onCancel={backToEmployee}
          onSubmit={values => {
            setServerErrors([])
            updateTimeSheet
              .mutateAsync({ uuid: shift.id, body: toShiftUpdateBody(shift, values) })
              .then(() => {
                backToEmployee()
                setSuccessMessage(`Shift on ${formatDayWithWeekday(shift.date)} updated.`)
              })
              .catch((error: unknown) => {
                setServerErrors(errorMessages(error))
              })
          }}
        />
      )
    }

    return (
      <Flex flexDirection="column" gap={16} alignItems="stretch">
        {successMessage ? (
          <Components.Alert
            status="success"
            label={successMessage}
            onDismiss={() => {
              setSuccessMessage(null)
            }}
          />
        ) : null}
        <EmployeeTimesheet
          period={period}
          employeeName={name}
          jobTitle={employee ? jobTitle(employee) : null}
          shifts={shifts}
          overtimePolicy={
            overtimePolicies.find(policy => policy.employeeUuids.includes(view.employeeUuid)) ??
            null
          }
          statusResult={statusResult}
          isSubmitting={changeStatus.isPending}
          onDismissStatusResult={() => {
            setStatusResult(null)
          }}
          onBackToOverview={() => {
            navigate({ name: 'overview' })
          }}
          onBackToPeriod={() => {
            navigate({ name: 'period', periodId: period.id })
          }}
          onEditShift={shiftId => {
            navigate({
              name: 'editShift',
              periodId: period.id,
              employeeUuid: view.employeeUuid,
              shiftId,
            })
          }}
          onChangeStatus={(shiftIds, status) => {
            const ids = new Set(shiftIds)
            void applyStatusChange(
              employeeSheets.filter(sheet => ids.has(sheet.uuid)),
              status,
              sheet => ({ id: sheet.uuid, label: formatDayWithWeekday(toShift(sheet).date) }),
            )
          }}
        />
      </Flex>
    )
  }

  const returnToOverview = (message: string) => {
    navigate({ name: 'overview' })
    setSuccessMessage(message)
  }

  if (view.name === 'overtimeForm') {
    const policy = overtimePolicies.find(p => p.id === view.policyId)
    return (
      <OvertimePolicyForm
        key={policy?.id ?? 'new'}
        policy={policy}
        serverErrors={serverErrors}
        isSubmitting={saveOvertimePolicy.isPending}
        onCancel={() => {
          navigate({ name: 'overview' })
        }}
        onSubmit={values => {
          setServerErrors([])
          saveOvertimePolicy
            .mutateAsync({
              uuid: policy?.id,
              version: policy?.version,
              body: {
                name: values.name,
                weekly_overtime_hours_threshold: values.weeklyThreshold,
                daily_overtime_hours_threshold: values.dailyThreshold,
                double_overtime_hours_threshold: values.doubleOvertimeThreshold,
                work_week_consecutive_days_threshold: values.consecutiveDaysThreshold,
              },
            })
            .then(saved => {
              if (policy) {
                returnToOverview(`${saved.name} updated.`)
              } else {
                navigate({ name: 'assign', kind: 'overtime', policyId: saved.uuid })
              }
            })
            .catch((error: unknown) => {
              setServerErrors(errorMessages(error))
            })
        }}
      />
    )
  }

  if (view.name === 'breakForm') {
    const policy = breakPolicies.find(p => p.id === view.policyId)
    return (
      <BreakPolicyForm
        key={policy?.id ?? 'new'}
        policy={policy}
        serverErrors={serverErrors}
        isSubmitting={saveBreakPolicy.isPending}
        onCancel={() => {
          navigate({ name: 'overview' })
        }}
        onSubmit={values => {
          setServerErrors([])
          saveBreakPolicy
            .mutateAsync({
              uuid: policy?.id,
              version: policy?.version,
              body: {
                name: values.name,
                pay_premium: values.payPremium,
                jurisdiction: values.jurisdiction,
                rules: values.rules.map(rule => ({
                  ...(rule.id ? { uuid: rule.id } : {}),
                  break_type: rule.breakType,
                  is_paid: rule.isPaid,
                  break_duration_in_minutes: rule.durationMinutes,
                  for_hours_worked_in_minutes: rule.afterHoursWorkedMinutes,
                })),
              },
            })
            .then(saved => {
              if (policy) {
                returnToOverview(`${saved.name} updated.`)
              } else {
                navigate({ name: 'assign', kind: 'break', policyId: saved.uuid })
              }
            })
            .catch((error: unknown) => {
              setServerErrors(errorMessages(error))
            })
        }}
      />
    )
  }

  if (view.name === 'assign') {
    const policies = view.kind === 'overtime' ? overtimePolicies : breakPolicies
    const policy = policies.find(p => p.id === view.policyId)
    if (!policy) return <Loading />
    const mutation = view.kind === 'overtime' ? assignOvertime : assignBreak
    return (
      <PolicyEmployeeAssignment
        key={`${view.kind}-${policy.id}`}
        kind={view.kind}
        policyId={policy.id}
        policyName={policy.name}
        employees={toAssignableEmployees(employees, policies)}
        serverErrors={serverErrors}
        isSubmitting={mutation.isPending}
        onCancel={() => {
          navigate({ name: 'overview' })
        }}
        onSave={changes => {
          setServerErrors([])
          mutation
            .mutateAsync({ policyUuid: policy.id, version: policy.version, ...changes })
            .then(() => {
              returnToOverview(`Employees on ${policy.name} updated.`)
            })
            .catch((error: unknown) => {
              setServerErrors(errorMessages(error))
            })
        }}
      />
    )
  }

  const currentPeriod = summaries.find(summary => summary.isCurrent) ?? null

  return (
    <Flex flexDirection="column" gap={16} alignItems="stretch">
      {successMessage ? (
        <Components.Alert
          status="success"
          label={successMessage}
          onDismiss={() => {
            setSuccessMessage(null)
          }}
        />
      ) : null}
      {timeSheetsQuery.error ? (
        <Components.Alert status="error" label="Timesheets couldn’t be loaded">
          <Components.Text>
            {policyErrorMessage(timeSheetsQuery.error, 'time sheets', 'time_sheet:read')}
          </Components.Text>
        </Components.Alert>
      ) : null}
      <TimeTrackingOverview
        currentPeriod={currentPeriod}
        pastPeriods={summaries.filter(summary => !summary.isCurrent)}
        overtimePolicies={overtimePolicies}
        breakPolicies={breakPolicies}
        overtimePoliciesError={policyErrorMessage(
          overtimeQuery.error,
          'overtime policies',
          'overtime_policies:read',
        )}
        breakPoliciesError={policyErrorMessage(
          breakQuery.error,
          'break policies',
          'break_policies:read',
        )}
        unassignedEmployeeCount={countUnassignedForOvertime(employees, overtimePolicies)}
        isLoadingTimesheets={timeSheetsQuery.isLoading}
        paySchedules={schedules.map(schedule => ({
          value: schedule.uuid,
          label: schedule.customName || schedule.frequency || schedule.uuid,
        }))}
        selectedPayScheduleId={selectedScheduleId}
        onPayScheduleChange={setSelectedScheduleId}
        onReviewPeriod={periodId => {
          navigate({ name: 'period', periodId })
        }}
        onAddOvertimePolicy={() => {
          navigate({ name: 'overtimeForm' })
        }}
        onEditOvertimePolicy={policyId => {
          navigate({ name: 'overtimeForm', policyId })
        }}
        onAssignOvertimePolicy={policyId => {
          navigate({ name: 'assign', kind: 'overtime', policyId })
        }}
        onAddBreakPolicy={() => {
          navigate({ name: 'breakForm' })
        }}
        onEditBreakPolicy={policyId => {
          navigate({ name: 'breakForm', policyId })
        }}
        onAssignBreakPolicy={policyId => {
          navigate({ name: 'assign', kind: 'break', policyId })
        }}
      />
    </Flex>
  )
}

export function TimeTracking(props: TimeTrackingProps) {
  return (
    <BaseComponent onEvent={() => {}}>
      <Suspense fallback={<Loading />}>
        <Root {...props} />
      </Suspense>
    </BaseComponent>
  )
}
