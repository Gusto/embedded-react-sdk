import { Suspense, useEffect, useMemo, useState } from 'react'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePaySchedulesGetAssignmentsSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAssignments'
import { usePaySchedulesUpdateMutation } from '@gusto/embedded-api/react-query/paySchedulesUpdate'
import { usePaySchedulesPreviewAssignmentMutation } from '@gusto/embedded-api/react-query/paySchedulesPreviewAssignment'
import { usePaySchedulesAssignMutation } from '@gusto/embedded-api/react-query/paySchedulesAssign'
import { useDepartmentsGetAll } from '@gusto/embedded-api/react-query/departmentsGetAll'
import { useEmployeesList } from '@gusto/embedded-api/react-query/employeesList'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import type { PayScheduleAssignment } from '@gusto/embedded-api/models/components/payscheduleassignment'
import type { PayScheduleAssignmentPreview } from '@gusto/embedded-api/models/components/payscheduleassignmentpreview'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import {
  PaySchedulesList,
  type PaySchedulesListRow,
} from '../../../components/company/management/PaySchedulesList/PaySchedulesList'
import { AutoPilotDialog } from '../../../components/company/management/PaySchedulesList/AutoPilotDialog'
import { PayScheduleForm } from '../../../components/company/management/PaySchedulesList/PayScheduleForm'
import {
  PayScheduleTypeSelection,
  type PayScheduleType,
} from '../../../components/company/management/PaySchedulesList/PayScheduleTypeSelection'
import {
  PayScheduleAssignmentForm,
  type AssignmentDraft,
} from '../../../components/company/management/PaySchedulesList/PayScheduleAssignmentForm'
import { PayScheduleAssignmentReview } from '../../../components/company/management/PaySchedulesList/PayScheduleAssignmentReview'
import { toRows } from './states'
import { BaseComponent } from '@/components/Base'
import { Flex } from '@/components/Common'
import { FlsaStatus } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface ManagePaySchedulesProps {
  companyId: string
}

type SuccessAlert = 'assignmentsUpdated' | 'scheduleUpdated'

type ReturnContext = 'list' | 'assignment'

type View =
  | { name: 'list'; successAlert?: SuccessAlert }
  | { name: 'form'; payScheduleId?: string; returnContext: ReturnContext }
  | { name: 'typeSelection' }
  | { name: 'assignment'; assignmentType: PayScheduleType }
  | { name: 'review'; preview: PayScheduleAssignmentPreview | null; isLoading: boolean }

function isAssignableEmployee(employee: Employee): boolean {
  return (
    !employee.terminated &&
    !employee.historical &&
    employee.onboarded === true &&
    !!employee.jobs &&
    employee.jobs.length > 0 &&
    !!employee.jobs[0]?.compensations?.length
  )
}

function toAutoPilotState(
  schedules: PayScheduleShow[],
): Map<string, { autoPayroll: boolean; version: string; name: string }> {
  return new Map(
    schedules.map(s => [
      s.uuid,
      {
        autoPayroll: s.autoPayroll ?? false,
        version: s.version,
        name: s.customName ?? '',
      },
    ]),
  )
}

function getEmployeeCurrentSchedule(
  employee: Employee,
  assignment: PayScheduleAssignment | undefined,
  fallback: string,
  departmentScheduleMap: Map<string, string>,
  employeeScheduleMap: Map<string, string>,
): string {
  const type = assignment?.type
  if (type === PayScheduleAssignmentBodyType.HourlySalaried) {
    const flsaStatus = employee.jobs?.[0]?.compensations?.[0]?.flsaStatus
    const isHourly = flsaStatus === FlsaStatus.NONEXEMPT
    return isHourly
      ? (assignment?.hourlyPayScheduleUuid ?? fallback)
      : (assignment?.salariedPayScheduleUuid ?? fallback)
  }
  if (type === PayScheduleAssignmentBodyType.ByDepartment) {
    const deptUuid = employee.departmentUuid
    if (deptUuid && departmentScheduleMap.has(deptUuid)) {
      return departmentScheduleMap.get(deptUuid) ?? fallback
    }
    return assignment?.defaultPayScheduleUuid ?? fallback
  }
  if (type === PayScheduleAssignmentBodyType.ByEmployee) {
    if (employee.uuid && employeeScheduleMap.has(employee.uuid)) {
      return employeeScheduleMap.get(employee.uuid) ?? fallback
    }
  }
  return assignment?.defaultPayScheduleUuid ?? fallback
}

function seedDraft(
  type: PayScheduleType,
  assignment: PayScheduleAssignment | undefined,
  assignableEmployees: Employee[],
  departmentsList: Array<{ uuid?: string }>,
  fallback: string,
): AssignmentDraft {
  const departmentScheduleMap = new Map<string, string>()
  for (const d of assignment?.departments ?? []) {
    if (d.departmentUuid && d.payScheduleUuid) {
      departmentScheduleMap.set(d.departmentUuid, d.payScheduleUuid)
    }
  }
  const employeeScheduleMap = new Map<string, string>()
  for (const e of assignment?.employees ?? []) {
    if (e.employeeUuid && e.payScheduleUuid) {
      employeeScheduleMap.set(e.employeeUuid, e.payScheduleUuid)
    }
  }

  const employees = new Map<string, string>()
  for (const employee of assignableEmployees) {
    if (employee.uuid) {
      employees.set(
        employee.uuid,
        getEmployeeCurrentSchedule(
          employee,
          assignment,
          fallback,
          departmentScheduleMap,
          employeeScheduleMap,
        ),
      )
    }
  }

  const departments = new Map<string, string>()
  const defaultForDept = assignment?.defaultPayScheduleUuid ?? fallback
  for (const d of departmentsList) {
    if (d.uuid) {
      departments.set(d.uuid, departmentScheduleMap.get(d.uuid) ?? defaultForDept)
    }
  }

  return {
    type,
    defaultPayScheduleUuid: assignment?.defaultPayScheduleUuid ?? fallback,
    hourlyPayScheduleUuid: assignment?.hourlyPayScheduleUuid ?? fallback,
    salariedPayScheduleUuid: assignment?.salariedPayScheduleUuid ?? fallback,
    employees,
    departments,
  }
}

function computeHasChanges(
  draft: AssignmentDraft,
  assignment: PayScheduleAssignment | undefined,
): boolean {
  if (!assignment) return true
  if (draft.type !== assignment.type) return true

  switch (draft.type) {
    case PayScheduleAssignmentBodyType.Single:
      return draft.defaultPayScheduleUuid !== assignment.defaultPayScheduleUuid
    case PayScheduleAssignmentBodyType.HourlySalaried:
      return (
        draft.hourlyPayScheduleUuid !== assignment.hourlyPayScheduleUuid ||
        draft.salariedPayScheduleUuid !== assignment.salariedPayScheduleUuid
      )
    case PayScheduleAssignmentBodyType.ByEmployee: {
      const current = new Map<string, string>()
      for (const e of assignment.employees ?? []) {
        if (e.employeeUuid && e.payScheduleUuid) current.set(e.employeeUuid, e.payScheduleUuid)
      }
      for (const [uuid, value] of draft.employees) {
        if (current.get(uuid) !== value) return true
      }
      return false
    }
    case PayScheduleAssignmentBodyType.ByDepartment: {
      if (draft.defaultPayScheduleUuid !== assignment.defaultPayScheduleUuid) return true
      const current = new Map<string, string>()
      for (const d of assignment.departments ?? []) {
        if (d.departmentUuid && d.payScheduleUuid) current.set(d.departmentUuid, d.payScheduleUuid)
      }
      for (const [uuid, value] of draft.departments) {
        if (current.get(uuid) !== value) return true
      }
      return false
    }
    default:
      return true
  }
}

function normalizeDraft(
  draft: AssignmentDraft,
  assignableEmployeeUuids: Set<string>,
): AssignmentDraft {
  const { type } = draft

  if (type === PayScheduleAssignmentBodyType.HourlySalaried) {
    if (
      draft.hourlyPayScheduleUuid &&
      draft.hourlyPayScheduleUuid === draft.salariedPayScheduleUuid
    ) {
      return {
        ...draft,
        type: PayScheduleAssignmentBodyType.Single,
        defaultPayScheduleUuid: draft.hourlyPayScheduleUuid,
        hourlyPayScheduleUuid: undefined,
        salariedPayScheduleUuid: undefined,
      }
    }
  }

  if (type === PayScheduleAssignmentBodyType.ByEmployee) {
    const entries = Array.from(draft.employees.entries()).filter(([uuid]) =>
      assignableEmployeeUuids.has(uuid),
    )
    const firstSchedule = entries[0]?.[1]
    if (entries.length > 0 && firstSchedule && entries.every(([, v]) => v === firstSchedule)) {
      return {
        ...draft,
        type: PayScheduleAssignmentBodyType.Single,
        defaultPayScheduleUuid: firstSchedule,
      }
    }
  }

  if (type === PayScheduleAssignmentBodyType.ByDepartment) {
    const entries = Array.from(draft.departments.entries())
    const defaultSchedule = draft.defaultPayScheduleUuid
    if (entries.length > 0 && defaultSchedule && entries.every(([, v]) => v === defaultSchedule)) {
      return {
        ...draft,
        type: PayScheduleAssignmentBodyType.Single,
      }
    }
  }

  return draft
}

function buildRequestBody(
  draft: AssignmentDraft,
  assignableEmployeeUuids: Set<string>,
): {
  type: PayScheduleType
  defaultPayScheduleUuid?: string
  hourlyPayScheduleUuid?: string
  salariedPayScheduleUuid?: string
  employees?: Array<{ employeeUuid: string; payScheduleUuid: string }>
  departments?: Array<{ departmentUuid: string; payScheduleUuid: string }>
} {
  switch (draft.type) {
    case PayScheduleAssignmentBodyType.Single:
      return { type: draft.type, defaultPayScheduleUuid: draft.defaultPayScheduleUuid }
    case PayScheduleAssignmentBodyType.HourlySalaried:
      return {
        type: draft.type,
        hourlyPayScheduleUuid: draft.hourlyPayScheduleUuid,
        salariedPayScheduleUuid: draft.salariedPayScheduleUuid,
      }
    case PayScheduleAssignmentBodyType.ByEmployee:
      return {
        type: draft.type,
        employees: Array.from(draft.employees.entries())
          .filter(([employeeUuid]) => assignableEmployeeUuids.has(employeeUuid))
          .map(([employeeUuid, payScheduleUuid]) => ({ employeeUuid, payScheduleUuid })),
      }
    case PayScheduleAssignmentBodyType.ByDepartment:
      return {
        type: draft.type,
        defaultPayScheduleUuid: draft.defaultPayScheduleUuid,
        departments: Array.from(draft.departments.entries()).map(
          ([departmentUuid, payScheduleUuid]) => ({ departmentUuid, payScheduleUuid }),
        ),
      }
    default:
      return { type: draft.type }
  }
}

function Root({ companyId }: ManagePaySchedulesProps) {
  const Components = useComponentContext()

  const { data: schedulesData, refetch: refetchSchedules } = usePaySchedulesGetAllSuspense({
    companyId,
  })
  const { data: assignmentsData, refetch: refetchAssignments } =
    usePaySchedulesGetAssignmentsSuspense({ companyId })
  // Non-suspense: departments + employees may fail on demos without those OAuth scopes.
  // Treat missing scopes as "empty list" so the flow still renders.
  const { data: departmentsData } = useDepartmentsGetAll(
    { companyUuid: companyId },
    { throwOnError: false },
  )
  const { data: employeesData } = useEmployeesList({ companyId }, { throwOnError: false })

  const schedules = useMemo(() => schedulesData.payScheduleShowResponse ?? [], [schedulesData])
  const assignment: PayScheduleAssignment | undefined = assignmentsData.payScheduleAssignment
  const departments = useMemo(() => departmentsData?.departmentList ?? [], [departmentsData])
  const employees = useMemo(() => employeesData?.showEmployees ?? [], [employeesData])
  const assignableEmployees = useMemo(
    () =>
      employees.filter(e =>
        isAssignableEmployee(e as unknown as Employee),
      ) as unknown as Employee[],
    [employees],
  )
  const assignableEmployeeUuids = useMemo(
    () => new Set(assignableEmployees.map(e => e.uuid).filter(Boolean) as string[]),
    [assignableEmployees],
  )

  const hasSchedules = schedules.length > 0
  const hasEmployees = assignableEmployees.length > 0
  const hasDepartments = departments.length > 0

  const payScheduleOptions = useMemo(
    () =>
      schedules.map(s => ({
        value: s.uuid,
        label: `${s.frequency ?? ''}${s.customName ? ` — ${s.customName}` : ''}`.trim() || s.uuid,
      })),
    [schedules],
  )
  const fallbackScheduleUuid = schedules[0]?.uuid ?? ''

  const rows = toRows(schedules, assignment)
  const scheduleMeta = toAutoPilotState(schedules)

  const [view, setView] = useState<View>({ name: 'list' })
  const [draft, setDraft] = useState<AssignmentDraft | null>(null)
  const [autoPilotTargetId, setAutoPilotTargetId] = useState<string | null>(null)

  const { mutateAsync: updatePaySchedule, isPending: isSavingAutoPilot } =
    usePaySchedulesUpdateMutation()
  const { mutateAsync: previewAssignment } = usePaySchedulesPreviewAssignmentMutation()
  const { mutateAsync: assignPaySchedules, isPending: isSubmittingAssign } =
    usePaySchedulesAssignMutation()

  const target = autoPilotTargetId ? scheduleMeta.get(autoPilotTargetId) : undefined

  const startTypeSelection = () => {
    setView({ name: 'typeSelection' })
  }

  const startAssignment = (type: PayScheduleType) => {
    if (!hasSchedules) {
      setView({ name: 'form', returnContext: 'assignment' })
      setDraft({
        type,
        defaultPayScheduleUuid: undefined,
        hourlyPayScheduleUuid: undefined,
        salariedPayScheduleUuid: undefined,
        employees: new Map(),
        departments: new Map(),
      })
      return
    }
    if (type === PayScheduleAssignmentBodyType.ByEmployee && !hasEmployees) {
      setDraft({
        type,
        defaultPayScheduleUuid: undefined,
        hourlyPayScheduleUuid: undefined,
        salariedPayScheduleUuid: undefined,
        employees: new Map(),
        departments: new Map(),
      })
      setView({ name: 'form', returnContext: 'assignment' })
      return
    }
    if (type === PayScheduleAssignmentBodyType.ByDepartment && !hasDepartments) {
      setDraft({
        type,
        defaultPayScheduleUuid: undefined,
        hourlyPayScheduleUuid: undefined,
        salariedPayScheduleUuid: undefined,
        employees: new Map(),
        departments: new Map(),
      })
      setView({ name: 'form', returnContext: 'assignment' })
      return
    }

    const seeded = seedDraft(
      type,
      assignment,
      assignableEmployees,
      departments,
      fallbackScheduleUuid,
    )
    setDraft(seeded)
    setView({ name: 'assignment', assignmentType: type })
  }

  const handleDraftChange = (patch: Partial<AssignmentDraft>) => {
    setDraft(prev => (prev ? { ...prev, ...patch } : prev))
  }

  const handleEmployeeAssignmentChange = (employeeUuid: string, payScheduleUuid: string) => {
    setDraft(prev => {
      if (!prev) return prev
      const next = new Map(prev.employees)
      next.set(employeeUuid, payScheduleUuid)
      return { ...prev, employees: next }
    })
  }

  const handleDepartmentAssignmentChange = (departmentUuid: string, payScheduleUuid: string) => {
    setDraft(prev => {
      if (!prev) return prev
      const next = new Map(prev.departments)
      next.set(departmentUuid, payScheduleUuid)
      return { ...prev, departments: next }
    })
  }

  const openReview = async () => {
    if (!draft) return
    setView({ name: 'review', preview: null, isLoading: true })
    const normalized = normalizeDraft(draft, assignableEmployeeUuids)
    const body = buildRequestBody(normalized, assignableEmployeeUuids)
    try {
      const result = await previewAssignment({
        request: {
          companyId,
          payScheduleAssignmentBody: {
            ...body,
            type: body.type,
          },
        },
      })
      setView({
        name: 'review',
        preview: result.payScheduleAssignmentPreview ?? null,
        isLoading: false,
      })
    } catch {
      setView({ name: 'review', preview: null, isLoading: false })
    }
  }

  const handleConfirmAssignment = async () => {
    if (!draft) return
    const normalized = normalizeDraft(draft, assignableEmployeeUuids)
    const body = buildRequestBody(normalized, assignableEmployeeUuids)
    await assignPaySchedules({
      request: {
        companyId,
        payScheduleAssignmentBody: {
          ...body,
          type: body.type,
        },
      },
    })
    setDraft(null)
    setView({ name: 'list', successAlert: 'assignmentsUpdated' })
    await Promise.all([refetchSchedules(), refetchAssignments()])
  }

  const handleAutoPilotSave = async (enabled: boolean) => {
    if (!autoPilotTargetId || !target) return
    await updatePaySchedule({
      request: {
        companyId,
        payScheduleId: autoPilotTargetId,
        payScheduleUpdateRequest: {
          version: target.version,
          autoPayroll: enabled,
        },
      },
    })
    setAutoPilotTargetId(null)
    await refetchSchedules()
  }

  // Re-seed draft when refreshed data yields a new schedule (needed after "Add new pay schedule"
  // returns to Assignment with a newly-created schedule available in the dropdown).
  useEffect(() => {
    if (view.name !== 'assignment' || !draft) return
    // If the draft's defaults reference an unknown schedule (e.g. we created one and returned),
    // don't clobber user selections; only ensure the fallback is valid.
    const validUuids = new Set(schedules.map(s => s.uuid))
    if (
      draft.defaultPayScheduleUuid &&
      !validUuids.has(draft.defaultPayScheduleUuid) &&
      fallbackScheduleUuid
    ) {
      setDraft({ ...draft, defaultPayScheduleUuid: fallbackScheduleUuid })
    }
  }, [view.name, schedules, draft, fallbackScheduleUuid])

  // Views
  if (view.name === 'form') {
    return (
      <PayScheduleForm
        companyId={companyId}
        payScheduleId={view.payScheduleId}
        onSaved={() => {
          if (view.returnContext === 'assignment' && draft) {
            setView({ name: 'assignment', assignmentType: draft.type })
            void refetchSchedules()
          } else {
            setView({ name: 'list', successAlert: 'scheduleUpdated' })
            void refetchSchedules()
          }
        }}
        onCancel={() => {
          if (view.returnContext === 'assignment' && draft) {
            setView({ name: 'assignment', assignmentType: draft.type })
          } else {
            setView({ name: 'list' })
          }
        }}
      />
    )
  }

  if (view.name === 'typeSelection') {
    return (
      <PayScheduleTypeSelection
        currentType={assignment?.type}
        hasEmployees={hasEmployees}
        hasDepartments={hasDepartments}
        onContinue={startAssignment}
        onBack={() => {
          setView({ name: 'list' })
        }}
      />
    )
  }

  if (view.name === 'assignment') {
    if (!draft) {
      setView({ name: 'typeSelection' })
      return null
    }
    return (
      <PayScheduleAssignmentForm
        assignmentType={view.assignmentType}
        payScheduleOptions={payScheduleOptions}
        employees={assignableEmployees}
        departments={departments}
        draft={draft}
        hasChanges={computeHasChanges(draft, assignment)}
        onDraftChange={handleDraftChange}
        onEmployeeAssignmentChange={handleEmployeeAssignmentChange}
        onDepartmentAssignmentChange={handleDepartmentAssignmentChange}
        onCreateNew={() => {
          setView({ name: 'form', returnContext: 'assignment' })
        }}
        onContinue={() => {
          void openReview()
        }}
        onBack={() => {
          setView({ name: 'typeSelection' })
        }}
      />
    )
  }

  if (view.name === 'review') {
    return (
      <PayScheduleAssignmentReview
        preview={view.preview}
        assignmentType={draft?.type ?? PayScheduleAssignmentBodyType.Single}
        employeesList={employees}
        isLoading={view.isLoading}
        isSubmitting={isSubmittingAssign}
        onConfirm={() => {
          void handleConfirmAssignment()
        }}
        onBack={() => {
          if (draft) setView({ name: 'assignment', assignmentType: draft.type })
          else setView({ name: 'list' })
        }}
      />
    )
  }

  const successMessage: string | null =
    view.successAlert === 'assignmentsUpdated'
      ? 'Pay schedule assignments updated successfully.'
      : view.successAlert === 'scheduleUpdated'
        ? 'Pay schedule updated successfully.'
        : null

  return (
    <Flex flexDirection="column" gap={16} alignItems="stretch">
      {successMessage ? (
        <Components.Alert
          status="success"
          label={successMessage}
          onDismiss={() => {
            setView({ name: 'list' })
          }}
        />
      ) : null}
      <PaySchedulesList
        rows={rows}
        assignmentType={assignment?.type}
        onManage={startTypeSelection}
        onEdit={(row: PaySchedulesListRow) => {
          setView({ name: 'form', payScheduleId: row.id, returnContext: 'list' })
        }}
        onEditAutoPilot={(row: PaySchedulesListRow) => {
          setAutoPilotTargetId(row.id)
        }}
        onManageEmployees={() => {
          startTypeSelection()
        }}
      />
      <AutoPilotDialog
        isOpen={autoPilotTargetId !== null && target !== undefined}
        scheduleName={target?.name ?? ''}
        autoPilotEnabled={target?.autoPayroll ?? false}
        onClose={() => {
          if (!isSavingAutoPilot) setAutoPilotTargetId(null)
        }}
        onSave={enabled => {
          void handleAutoPilotSave(enabled)
        }}
      />
    </Flex>
  )
}

export function ManagePaySchedules(props: ManagePaySchedulesProps) {
  return (
    <BaseComponent onEvent={() => {}}>
      <Flex flexDirection="column" gap={32} alignItems="stretch">
        <Suspense fallback={<div>Loading...</div>}>
          <Root {...props} />
        </Suspense>
      </Flex>
    </BaseComponent>
  )
}
