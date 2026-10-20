import { usePaySchedulesGetAssignmentsSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAssignments'
import {
  useDepartmentsGetAll,
  useDepartmentsGetAllSuspense,
} from '@gusto/embedded-api/react-query/departmentsGetAll'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePaySchedulesPreviewAssignmentMutation } from '@gusto/embedded-api/react-query/paySchedulesPreviewAssignment'
import { usePaySchedulesAssignMutation } from '@gusto/embedded-api/react-query/paySchedulesAssign'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { PayScheduleAssignmentEmployeeChange } from '@gusto/embedded-api/models/components/payscheduleassignmentemployeechange'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import {
  AssignmentEmployeeStepPresentation,
  type EmployeeSelection,
} from './AssignmentEmployeeStepPresentation'
import { useAssignableEmployees } from './useAssignableEmployees'
import {
  AssignmentDepartmentStepPresentation,
  type DepartmentSelection,
} from './AssignmentDepartmentStepPresentation'
import { AssignmentTypeStepPresentation } from './AssignmentTypeStepPresentation'
import { AssignmentScheduleStepPresentation } from './AssignmentScheduleStepPresentation'
import { AssignmentCompensationStepPresentation } from './AssignmentCompensationStepPresentation'
import { AssignmentReviewStepPresentation } from './AssignmentReviewStepPresentation'
import { getCompanyDepartments, isAssignmentAccessDenied } from './departmentAccess'
import type { assignmentDraftUpdated } from './usePayScheduleAssignment'
import type {
  AssignmentDraft,
  PayScheduleAssignmentContextInterface,
  SupportedAssignmentType,
} from './usePayScheduleAssignment'
import { PayScheduleForm } from '@/components/Company/PaySchedule/PayScheduleForm'
import { useFlow } from '@/components/Flow/useFlow'
import { useBase, BaseLayout } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents, FlsaStatus } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * The assignment the user built, already collapsed to the type that actually gets submitted.
 * Doubles as the request body and as the `assigned` event payload.
 *
 * @internal
 */
export type AssignmentSelection =
  | {
      type: typeof PayScheduleAssignmentBodyType.Single
      defaultPayScheduleUuid: string
    }
  | {
      type: typeof PayScheduleAssignmentBodyType.HourlySalaried
      hourlyPayScheduleUuid: string
      salariedPayScheduleUuid: string
    }
  | ({ type: typeof PayScheduleAssignmentBodyType.ByDepartment } & DepartmentSelection)
  | ({ type: typeof PayScheduleAssignmentBodyType.ByEmployee } & EmployeeSelection)

/** @internal */
export type EventPayloads = {
  [componentEvents.PAY_SCHEDULE_ASSIGNMENT_TYPE_SELECTED]: { type: SupportedAssignmentType }
  [componentEvents.PAY_SCHEDULE_ASSIGNMENT_SCHEDULE_SELECTED]:
    | { defaultPayScheduleUuid: string }
    | { hourlyPayScheduleUuid: string; salariedPayScheduleUuid: string }
    | DepartmentSelection
    | EmployeeSelection
  [assignmentDraftUpdated]: AssignmentDraft
  [componentEvents.PAY_SCHEDULE_ASSIGNMENT_BACK]: AssignmentDraft | undefined
  [componentEvents.PAY_SCHEDULE_CREATED]: { paySchedule: PayScheduleShow }
  [componentEvents.PAY_SCHEDULE_ASSIGNED]: AssignmentSelection & {
    employeeChanges: PayScheduleAssignmentEmployeeChange[]
  }
}

/** @internal */
export function AssignmentTypeStep() {
  const { companyId, assignmentType, onEvent } = useFlow<PayScheduleAssignmentContextInterface>()

  const { data, error, isPending } = useDepartmentsGetAll(
    { companyUuid: companyId },
    {
      throwOnError: error => !isAssignmentAccessDenied(error),
    },
  )
  const employees = useAssignableEmployees(companyId)
  if (isPending || employees.status === 'loading') return <BaseLayout isLoading />

  return (
    <AssignmentTypeStepPresentation
      hasEmployees={employees.employees.length > 0}
      employeeAccessDenied={employees.accessDenied}
      hasDepartments={getCompanyDepartments(data?.departmentList).length > 0}
      departmentAccessDenied={isAssignmentAccessDenied(error)}
      defaultType={assignmentType}
      onBack={() => {
        onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_CANCEL)
      }}
      onContinue={type => {
        onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_TYPE_SELECTED, { type })
      }}
    />
  )
}

/** @internal */
export function AssignmentScheduleStep() {
  const {
    companyId,
    assignmentType,
    defaultPayScheduleUuid,
    hourlyPayScheduleUuid,
    salariedPayScheduleUuid,
    updateDraft,
    onEvent,
  } = useFlow<PayScheduleAssignmentContextInterface>()
  const { data: paySchedules } = usePaySchedulesGetAllSuspense({
    companyId: ensureRequired(companyId),
  })
  const schedules = paySchedules.payScheduleShowResponse ?? []
  const activeSchedule = schedules.find(s => s.active)
  /**
   * A uuid carried in from the company's existing assignment has no option to select if the
   * schedule is no longer in the company's list, which would leave the dropdown blank.
   */
  const preselect = (uuid: string | undefined) =>
    schedules.some(s => s.uuid === uuid) ? uuid : activeSchedule?.uuid

  if (assignmentType === PayScheduleAssignmentBodyType.ByEmployee) {
    return <AssignmentEmployeeStep schedules={schedules} />
  }

  if (assignmentType === PayScheduleAssignmentBodyType.ByDepartment) {
    return <AssignmentDepartmentStep schedules={schedules} />
  }

  if (assignmentType === PayScheduleAssignmentBodyType.HourlySalaried) {
    return (
      <AssignmentCompensationStepPresentation
        schedules={schedules}
        hourlyPayScheduleUuid={preselect(hourlyPayScheduleUuid)}
        salariedPayScheduleUuid={preselect(salariedPayScheduleUuid)}
        onBack={selection => {
          onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_BACK, selection)
        }}
        onAddPaySchedule={selection => {
          updateDraft(selection)
          onEvent(componentEvents.PAY_SCHEDULE_CREATE)
        }}
        onContinue={selection => {
          onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_SCHEDULE_SELECTED, selection)
        }}
      />
    )
  }

  return (
    <AssignmentScheduleStepPresentation
      schedules={schedules}
      defaultPayScheduleUuid={preselect(defaultPayScheduleUuid)}
      onBack={() => {
        onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_BACK)
      }}
      onAddPaySchedule={() => {
        onEvent(componentEvents.PAY_SCHEDULE_CREATE)
      }}
      onContinue={uuid => {
        onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_SCHEDULE_SELECTED, {
          defaultPayScheduleUuid: uuid,
        })
      }}
    />
  )
}

function AssignmentEmployeeStep({ schedules }: { schedules: PayScheduleShow[] }) {
  const {
    companyId,
    employees: selectedEmployees,
    updateDraft,
    onEvent,
  } = useFlow<PayScheduleAssignmentContextInterface>()
  const roster = useAssignableEmployees(companyId)
  const { data } = usePaySchedulesGetAssignmentsSuspense({ companyId })
  const assignment = data.payScheduleAssignment
  const isEmpty = roster.status === 'ready' && !roster.accessDenied && roster.employees.length === 0
  const { t } = useTranslation('Company.Management.PayScheduleAssignment')
  useEffect(() => {
    if (isEmpty) {
      updateDraft({
        assignmentType: PayScheduleAssignmentBodyType.Single,
        employees: undefined,
        defaultPayScheduleUuid: undefined,
      })
      onEvent(componentEvents.PAY_SCHEDULE_CREATE)
    }
  }, [isEmpty, updateDraft, onEvent])
  if (roster.status === 'loading') return <BaseLayout isLoading />
  if (roster.accessDenied)
    return (
      <BaseLayout>
        <EmployeeAccessWarning
          onBack={() => {
            onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_BACK)
          }}
          label={t('employeeAccessDenied')}
          backLabel={t('backCta')}
        />
      </BaseLayout>
    )
  if (isEmpty) return null
  const fallback = schedules.find(schedule => schedule.active)?.uuid ?? schedules[0]?.uuid ?? ''
  const validSchedule = (uuid: string | null | undefined) =>
    schedules.find(schedule => schedule.uuid === uuid)?.uuid ?? fallback
  const selection: EmployeeSelection = {
    employees: roster.employees.map(employee => {
      const selected = selectedEmployees?.find(
        entry => entry.employeeUuid === employee.uuid,
      )?.payScheduleUuid
      let stored = assignment?.defaultPayScheduleUuid
      if (assignment?.type === PayScheduleAssignmentBodyType.ByEmployee) {
        stored =
          assignment.employees?.find(entry => entry.employeeUuid === employee.uuid)
            ?.payScheduleUuid ?? stored
      } else if (assignment?.type === PayScheduleAssignmentBodyType.ByDepartment) {
        stored =
          assignment.departments?.find(entry => entry.departmentUuid === employee.departmentUuid)
            ?.payScheduleUuid ?? stored
      } else if (assignment?.type === PayScheduleAssignmentBodyType.HourlySalaried) {
        const status = employee.flsaStatus ?? employee.jobs?.[0]?.compensations?.[0]?.flsaStatus
        stored =
          status === FlsaStatus.NONEXEMPT ||
          status === FlsaStatus.SALARIED_NONEXEMPT ||
          status === FlsaStatus.COMMISSION_ONLY_NONEXEMPT
            ? assignment.hourlyPayScheduleUuid
            : assignment.salariedPayScheduleUuid
      }
      return { employeeUuid: employee.uuid, payScheduleUuid: validSchedule(selected ?? stored) }
    }),
  }
  return (
    <AssignmentEmployeeStepPresentation
      employees={roster.employees}
      schedules={schedules}
      selection={selection}
      onBack={draft => {
        onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_BACK, draft)
      }}
      onAddPaySchedule={draft => {
        updateDraft(draft)
        onEvent(componentEvents.PAY_SCHEDULE_CREATE)
      }}
      onContinue={draft => {
        onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_SCHEDULE_SELECTED, draft)
      }}
    />
  )
}

function EmployeeAccessWarning({
  onBack,
  label,
  backLabel,
}: {
  onBack: () => void
  label: string
  backLabel: string
}) {
  const Components = useComponentContext()
  return (
    <>
      <Components.Alert status="warning" label={label} />
      <Components.Button variant="secondary" onClick={onBack}>
        {backLabel}
      </Components.Button>
    </>
  )
}

function AssignmentDepartmentStep({ schedules }: { schedules: PayScheduleShow[] }) {
  const {
    companyId,
    departments: selectedDepartments,
    defaultPayScheduleUuid,
    updateDraft,
    onEvent,
  } = useFlow<PayScheduleAssignmentContextInterface>()
  const { data } = useDepartmentsGetAllSuspense({ companyUuid: companyId })
  const departments = getCompanyDepartments(data.departmentList)
  const hasDepartments = departments.length > 0

  useEffect(() => {
    if (!hasDepartments) {
      updateDraft({
        assignmentType: PayScheduleAssignmentBodyType.Single,
        departments: undefined,
        defaultPayScheduleUuid: undefined,
      })
      onEvent(componentEvents.PAY_SCHEDULE_CREATE)
    }
  }, [hasDepartments, onEvent, updateDraft])

  if (!hasDepartments) return null

  const fallbackUuid = schedules.find(schedule => schedule.active)?.uuid ?? schedules[0]?.uuid ?? ''
  const preselect = (uuid: string | undefined) =>
    schedules.find(schedule => schedule.uuid === uuid)?.uuid ?? fallbackUuid

  return (
    <AssignmentDepartmentStepPresentation
      departments={departments}
      schedules={schedules}
      selection={{
        defaultPayScheduleUuid: preselect(defaultPayScheduleUuid),
        departments: departments.map(department => ({
          departmentUuid: ensureRequired(department.uuid),
          payScheduleUuid: preselect(
            selectedDepartments?.find(selection => selection.departmentUuid === department.uuid)
              ?.payScheduleUuid,
          ),
        })),
      }}
      onBack={selection => {
        onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_BACK, selection)
      }}
      onAddPaySchedule={selection => {
        updateDraft(selection)
        onEvent(componentEvents.PAY_SCHEDULE_CREATE)
      }}
      onContinue={selection => {
        onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_SCHEDULE_SELECTED, selection)
      }}
    />
  )
}

/** @internal */
export function AssignmentCreateScheduleStep() {
  const { t } = useTranslation('Company.Management.PayScheduleAssignment')
  const { companyId, onEvent } = useFlow<PayScheduleAssignmentContextInterface>()

  return (
    <PayScheduleForm
      variant="management"
      companyId={ensureRequired(companyId)}
      onEvent={onEvent}
      copy={{
        anchorEndOfPayPeriodDescription: t('scheduleForm.anchorEndOfPayPeriodDescription'),
        payrollDeadline: t('scheduleForm.payrollDeadline'),
      }}
    />
  )
}

/** @internal */
export function AssignmentReviewStep() {
  const {
    companyId,
    assignmentType,
    defaultPayScheduleUuid,
    hourlyPayScheduleUuid,
    salariedPayScheduleUuid,
    departments,
    employees,
    onEvent,
  } = useFlow<PayScheduleAssignmentContextInterface>()
  const { baseSubmitHandler, error } = useBase()
  const [employeeChanges, setEmployeeChanges] = useState<
    PayScheduleAssignmentEmployeeChange[] | null
  >(null)
  const { mutateAsync: previewAssignment, isPending: isPreviewLoading } =
    usePaySchedulesPreviewAssignmentMutation()
  const { mutateAsync: assignSchedules, isPending: isAssigning } = usePaySchedulesAssignMutation()

  const assignment: AssignmentSelection = useMemo(() => {
    if (assignmentType === PayScheduleAssignmentBodyType.ByEmployee) {
      const selections = ensureRequired(employees)
      const firstSchedule = selections[0]?.payScheduleUuid
      if (
        firstSchedule &&
        selections.every(selection => selection.payScheduleUuid === firstSchedule)
      ) {
        return { type: PayScheduleAssignmentBodyType.Single, defaultPayScheduleUuid: firstSchedule }
      }
      return { type: PayScheduleAssignmentBodyType.ByEmployee, employees: selections }
    }
    if (assignmentType === PayScheduleAssignmentBodyType.ByDepartment) {
      const defaultUuid = ensureRequired(defaultPayScheduleUuid)
      const selections = ensureRequired(departments)
      if (
        selections.length === 0 ||
        selections.every(selection => selection.payScheduleUuid === defaultUuid)
      ) {
        return { type: PayScheduleAssignmentBodyType.Single, defaultPayScheduleUuid: defaultUuid }
      }
      return {
        type: PayScheduleAssignmentBodyType.ByDepartment,
        defaultPayScheduleUuid: defaultUuid,
        departments: selections,
      }
    }
    if (assignmentType === PayScheduleAssignmentBodyType.HourlySalaried) {
      const hourly = ensureRequired(hourlyPayScheduleUuid)
      const salaried = ensureRequired(salariedPayScheduleUuid)

      // One schedule for both compensation types is a single-schedule assignment. Collapsing
      // here rather than at submit keeps the previewed changes identical to what gets sent.
      if (hourly === salaried) {
        return {
          type: PayScheduleAssignmentBodyType.Single,
          defaultPayScheduleUuid: hourly,
        }
      }

      return {
        type: PayScheduleAssignmentBodyType.HourlySalaried,
        hourlyPayScheduleUuid: hourly,
        salariedPayScheduleUuid: salaried,
      }
    }

    return {
      type: PayScheduleAssignmentBodyType.Single,
      defaultPayScheduleUuid: ensureRequired(defaultPayScheduleUuid),
    }
  }, [
    assignmentType,
    defaultPayScheduleUuid,
    hourlyPayScheduleUuid,
    salariedPayScheduleUuid,
    departments,
    employees,
  ])

  useEffect(() => {
    void baseSubmitHandler(undefined, async () => {
      const response = await previewAssignment({
        request: { companyId: ensureRequired(companyId), payScheduleAssignmentBody: assignment },
      })
      setEmployeeChanges(response.payScheduleAssignmentPreview?.employeeChanges ?? [])
    })
  }, [companyId, assignment, previewAssignment, baseSubmitHandler])

  // The enclosing BaseComponent's own BaseLayout already renders `error` for this whole
  // component tree, so surface only the loading state here to avoid rendering it twice.
  if (error) {
    return null
  }
  if (isPreviewLoading || !employeeChanges) {
    return <BaseLayout isLoading />
  }

  return (
    <AssignmentReviewStepPresentation
      employeeChanges={employeeChanges}
      isSubmitting={isAssigning}
      onBack={() => {
        onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_BACK)
      }}
      onSubmit={() => {
        void baseSubmitHandler(undefined, async () => {
          await assignSchedules({
            request: {
              companyId: ensureRequired(companyId),
              payScheduleAssignmentBody: assignment,
            },
          })
          onEvent(componentEvents.PAY_SCHEDULE_ASSIGNED, { ...assignment, employeeChanges })
        })
      }}
    />
  )
}
