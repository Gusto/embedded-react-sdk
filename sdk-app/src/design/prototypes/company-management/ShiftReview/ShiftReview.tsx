import { useMemo, useState } from 'react'
import { useEmployeesList } from '@gusto/embedded-api/react-query/employeesList'
import { usePaySchedulesGetAll } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import {
  ShiftReviewTabs,
  type ShiftReviewTab,
} from '../../../components/company/management/ShiftReview/ShiftReviewTabs'
import { BreakPolicyModal } from '../../../components/company/management/TimeTracking/BreakPolicyModal'
import { CreateBreakPolicy } from '../../../components/company/management/TimeTracking/CreateBreakPolicy'
import { CreateOvertimePolicy } from '../../../components/company/management/TimeTracking/CreateOvertimePolicy'
import { OvertimePolicyModal } from '../../../components/company/management/TimeTracking/OvertimePolicyModal'
import { TimeTrackingPolicies } from '../../../components/company/management/TimeTracking/TimeTrackingPolicies'
import type {
  BreakPolicy,
  OvertimePolicy,
} from '../../../components/company/management/TimeTracking/types'
import type { BreakPolicyFormValues } from '../../../components/company/management/TimeTracking/useBreakPolicyForm'
import type { OvertimePolicyFormValues } from '../../../components/company/management/TimeTracking/useOvertimePolicyForm'
import {
  currentWorkweekStart,
  employeeName,
  toBreakPolicy,
  toOvertimePolicy,
  toPeople,
  type TimeTrackingEmployee,
} from '../TimeTracking/adapters'
import {
  errorMessages,
  loadErrorMessage,
  useAssignBreakPolicy,
  useAssignOvertimePolicy,
  useBreakPolicies,
  useDeletePolicy,
  useOvertimePolicies,
  useSaveBreakPolicy,
  useSaveOvertimePolicy,
} from '../TimeTracking/timeTrackingApi'
import { AddShiftModal } from './AddShiftModal'
import { EditShiftModal } from './EditShiftModal'
import { Shifts, type AddShiftRequest, type EditShiftRequest } from './Shifts'
import { formatDateToStringDate } from '@/helpers/dateFormatting'

export interface ShiftReviewProps {
  companyId: string
}

type PolicyModal = { kind: 'overtime'; policyId: string } | { kind: 'break'; policyId: string }

type View =
  | { name: 'tabs'; tab: ShiftReviewTab; modal?: PolicyModal }
  | { name: 'createOvertimePolicy' }
  | { name: 'createBreakPolicy' }

export function ShiftReview({ companyId }: ShiftReviewProps) {
  const [view, setView] = useState<View>({ name: 'tabs', tab: 'shifts' })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [serverErrors, setServerErrors] = useState<string[]>([])
  const [addShiftRequest, setAddShiftRequest] = useState<AddShiftRequest | null>(null)
  const [editShiftRequest, setEditShiftRequest] = useState<EditShiftRequest | null>(null)
  const [today] = useState(() => formatDateToStringDate(new Date()) ?? '')

  const navigate = (next: View) => {
    setServerErrors([])
    if (next.name !== view.name) setSuccessMessage(null)
    setView(next)
  }

  const returnToPolicies = (message: string) => {
    navigate({ name: 'tabs', tab: 'policies' })
    setSuccessMessage(message)
  }

  const employeesQuery = useEmployeesList({ companyId }, { throwOnError: false })
  const employees = useMemo(
    () => (employeesQuery.data?.showEmployees ?? []) as TimeTrackingEmployee[],
    [employeesQuery.data],
  )
  const employeeOptions = useMemo(
    () =>
      employees
        .filter(employee => !employee.terminated)
        .map(employee => ({ value: employee.uuid, label: employeeName(employee) })),
    [employees],
  )
  const schedulesQuery = usePaySchedulesGetAll({ companyId }, { throwOnError: false })
  const workweekStartDay =
    schedulesQuery.data?.payScheduleShowResponse?.find(schedule => schedule.workweekStartDay)
      ?.workweekStartDay ?? null

  const overtimeQuery = useOvertimePolicies(companyId)
  const breakQuery = useBreakPolicies(companyId)
  const overtimePolicies = useMemo(
    () => (overtimeQuery.data ?? []).map(toOvertimePolicy),
    [overtimeQuery.data],
  )
  const breakPolicies = useMemo(() => (breakQuery.data ?? []).map(toBreakPolicy), [breakQuery.data])
  const people = useMemo(
    () => toPeople(employees, overtimePolicies, breakPolicies),
    [employees, overtimePolicies, breakPolicies],
  )
  const overtimePolicyNames = Object.fromEntries(overtimePolicies.map(p => [p.id, p.name]))
  const breakPolicyNames = Object.fromEntries(breakPolicies.map(p => [p.id, p.name]))

  const saveOvertimePolicy = useSaveOvertimePolicy(companyId)
  const saveBreakPolicy = useSaveBreakPolicy(companyId)
  const deleteOvertimePolicy = useDeletePolicy('overtime')
  const deleteBreakPolicy = useDeletePolicy('break')
  const assignOvertime = useAssignOvertimePolicy()
  const assignBreak = useAssignBreakPolicy()

  async function saveBreak(values: BreakPolicyFormValues, editingBreak?: BreakPolicy) {
    setServerErrors([])
    try {
      const saved = await saveBreakPolicy.mutateAsync({
        uuid: editingBreak?.id,
        version: editingBreak?.version,
        body: {
          name: values.name,
          pay_premium: values.payPremium,
          ...(values.jurisdiction ? { jurisdiction: values.jurisdiction } : {}),
          rules: values.rules.map(rule => ({
            ...(rule.id ? { uuid: rule.id } : {}),
            break_type: rule.breakType,
            is_paid: rule.isPaid,
            break_duration_in_minutes: rule.durationMinutes,
            for_hours_worked_in_minutes: rule.afterHoursWorkedMinutes,
          })),
        },
      })
      const previous = editingBreak?.employeeUuids ?? []
      const assign = values.employeeUuids.filter(uuid => !previous.includes(uuid))
      const remove = previous.filter(uuid => !values.employeeUuids.includes(uuid))
      if (assign.length > 0 || remove.length > 0) {
        await assignBreak.mutateAsync({
          policyUuid: saved.uuid,
          version: saved.version,
          assign,
          remove,
        })
      }
      returnToPolicies(editingBreak ? `${saved.name} updated.` : `${saved.name} created.`)
    } catch (error) {
      setServerErrors(errorMessages(error))
    }
  }

  async function saveOvertime(values: OvertimePolicyFormValues, editingOvertime?: OvertimePolicy) {
    setServerErrors([])
    try {
      const saved = await saveOvertimePolicy.mutateAsync({
        uuid: editingOvertime?.id,
        version: editingOvertime?.version,
        body: {
          name: values.name,
          weekly_overtime_hours_threshold: values.weeklyThreshold,
          daily_overtime_hours_threshold: values.dailyThreshold,
          double_overtime_hours_threshold: values.doubleOvertimeThreshold,
          work_week_consecutive_days_threshold: values.consecutiveDaysThreshold,
        },
      })
      const assign = values.employeeUuids.filter(
        uuid => !editingOvertime?.employeeUuids.includes(uuid),
      )
      if (assign.length > 0) {
        await assignOvertime.mutateAsync({
          policyUuid: saved.uuid,
          version: saved.version,
          assign,
          remove: [],
        })
      }
      returnToPolicies(editingOvertime ? `${saved.name} updated.` : `${saved.name} created.`)
    } catch (error) {
      setServerErrors(errorMessages(error))
    }
  }

  if (view.name === 'createOvertimePolicy') {
    return (
      <CreateOvertimePolicy
        people={people}
        policyNames={overtimePolicyNames}
        serverErrors={serverErrors}
        isSubmitting={saveOvertimePolicy.isPending || assignOvertime.isPending}
        onCancel={() => {
          navigate({ name: 'tabs', tab: 'policies' })
        }}
        onSubmit={values => {
          void saveOvertime(values)
        }}
      />
    )
  }

  if (view.name === 'createBreakPolicy') {
    return (
      <CreateBreakPolicy
        people={people}
        policyNames={breakPolicyNames}
        serverErrors={serverErrors}
        isSubmitting={saveBreakPolicy.isPending || assignBreak.isPending}
        onCancel={() => {
          navigate({ name: 'tabs', tab: 'policies' })
        }}
        onSubmit={values => {
          void saveBreak(values)
        }}
      />
    )
  }

  const modal = view.modal
  const closeModal = () => {
    navigate({ name: 'tabs', tab: view.tab })
  }
  const editingOvertime =
    modal?.kind === 'overtime' ? overtimePolicies.find(p => p.id === modal.policyId) : undefined
  const editingBreak =
    modal?.kind === 'break' ? breakPolicies.find(p => p.id === modal.policyId) : undefined

  return (
    <>
      <ShiftReviewTabs
        selectedTab={view.tab}
        successMessage={successMessage}
        onTabChange={tab => {
          navigate({ name: 'tabs', tab })
        }}
        onDismissSuccess={() => {
          setSuccessMessage(null)
        }}
        shifts={
          <Shifts
            companyId={companyId}
            onAddShift={request => {
              setSuccessMessage(null)
              setAddShiftRequest(request)
            }}
            onEditShift={request => {
              setSuccessMessage(null)
              setEditShiftRequest(request)
            }}
          />
        }
        policies={
          <TimeTrackingPolicies
            overtimePolicies={overtimePolicies}
            breakPolicies={breakPolicies}
            overtimePoliciesError={loadErrorMessage(
              overtimeQuery.error,
              'overtime policies',
              'overtime_policies:read',
            )}
            breakPoliciesError={loadErrorMessage(
              breakQuery.error,
              'break policies',
              'break_policies:read',
            )}
            onAddOvertimePolicy={() => {
              navigate({ name: 'createOvertimePolicy' })
            }}
            onEditOvertimePolicy={policyId => {
              navigate({ name: 'tabs', tab: 'policies', modal: { kind: 'overtime', policyId } })
            }}
            onAddBreakPolicy={() => {
              navigate({ name: 'createBreakPolicy' })
            }}
            onEditBreakPolicy={policyId => {
              navigate({ name: 'tabs', tab: 'policies', modal: { kind: 'break', policyId } })
            }}
          />
        }
      />

      {addShiftRequest ? (
        <AddShiftModal
          companyId={companyId}
          employees={employees}
          employeeOptions={employeeOptions}
          initialEmployeeUuid={addShiftRequest.initialEmployeeUuid}
          knownSheets={addShiftRequest.knownSheets}
          onClose={() => {
            setAddShiftRequest(null)
          }}
          onCreated={message => {
            setAddShiftRequest(null)
            setSuccessMessage(message)
          }}
        />
      ) : null}

      {editShiftRequest ? (
        <EditShiftModal
          key={editShiftRequest.sheet.uuid}
          sheet={editShiftRequest.sheet}
          employee={editShiftRequest.employee}
          onClose={() => {
            setEditShiftRequest(null)
          }}
          onSaved={message => {
            setEditShiftRequest(null)
            setSuccessMessage(message)
          }}
        />
      ) : null}

      {editingOvertime ? (
        <OvertimePolicyModal
          key={editingOvertime.id}
          policy={editingOvertime}
          people={people}
          policyNames={overtimePolicyNames}
          workweekStartedOn={currentWorkweekStart(today, workweekStartDay)}
          serverErrors={serverErrors}
          isSubmitting={saveOvertimePolicy.isPending || assignOvertime.isPending}
          isDeleting={deleteOvertimePolicy.isPending}
          onClose={closeModal}
          onDelete={() => {
            deleteOvertimePolicy
              .mutateAsync({ uuid: editingOvertime.id, version: editingOvertime.version })
              .then(() => {
                returnToPolicies(`${editingOvertime.name} deleted.`)
              })
              .catch((error: unknown) => {
                setServerErrors(errorMessages(error))
              })
          }}
          onSubmit={values => {
            void saveOvertime(values, editingOvertime)
          }}
        />
      ) : null}

      {editingBreak ? (
        <BreakPolicyModal
          key={editingBreak.id}
          policy={editingBreak}
          people={people}
          policyNames={breakPolicyNames}
          serverErrors={serverErrors}
          isSubmitting={saveBreakPolicy.isPending || assignBreak.isPending}
          isDeleting={deleteBreakPolicy.isPending}
          onClose={closeModal}
          onDelete={() => {
            deleteBreakPolicy
              .mutateAsync({ uuid: editingBreak.id, version: editingBreak.version })
              .then(() => {
                returnToPolicies(`${editingBreak.name} deleted.`)
              })
              .catch((error: unknown) => {
                setServerErrors(errorMessages(error))
              })
          }}
          onSubmit={values => {
            void saveBreak(values, editingBreak)
          }}
        />
      ) : null}
    </>
  )
}
