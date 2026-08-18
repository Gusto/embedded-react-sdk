/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import type { PayScheduleAssignment } from '@gusto/embedded-api/models/components/payscheduleassignment'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { Department } from '@gusto/embedded-api/models/components/department'
import type { PayScheduleAssignmentPreview } from '@gusto/embedded-api/models/components/payscheduleassignmentpreview'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { PrototypeComponent } from '../../prototypeTypes'
import {
  PaySchedulesList,
  type PaySchedulesListData,
  type CompensationRow,
  type DepartmentRow,
  type ByEmployeeRow,
  type SingleSummary,
} from '../../../components/company/management/PaySchedulesList/PaySchedulesList'
import { AutoPilotDialog } from '../../../components/company/management/PaySchedulesList/AutoPilotDialog'
import {
  PayScheduleTypeSelection,
  type PayScheduleType,
} from '../../../components/company/management/PaySchedulesList/PayScheduleTypeSelection'
import {
  PayScheduleAssignmentForm,
  type AssignmentDraft,
} from '../../../components/company/management/PaySchedulesList/PayScheduleAssignmentForm'
import { PayScheduleAssignmentReview } from '../../../components/company/management/PaySchedulesList/PayScheduleAssignmentReview'
import { FlsaStatus } from '@/shared/constants'

const FREQUENCY_LABELS: Record<string, string> = {
  'Every week': 'Every week',
  'Every other week': 'Every other week',
  'Twice per month': 'Twice per month',
  Monthly: 'Monthly',
  Quarterly: 'Quarterly',
  Annually: 'Annually',
}

function frequencyLabel(schedule?: PayScheduleShow): string {
  if (!schedule?.frequency) return '—'
  return FREQUENCY_LABELS[schedule.frequency] ?? schedule.frequency
}

function scheduleFields(schedule?: PayScheduleShow) {
  return {
    scheduleId: schedule?.uuid ?? '',
    scheduleName: schedule?.customName ?? '',
    frequency: frequencyLabel(schedule),
    autoPilot: schedule?.autoPayroll ?? false,
  }
}

function isHourlyEmployee(employee: Employee): boolean {
  const flsa = employee.jobs?.[0]?.compensations?.[0]?.flsaStatus
  return flsa === FlsaStatus.NONEXEMPT
}

// In hourly_salaried mode AutoPilot is governed via the Salaried schedule, so
// the action is suppressed on the Hourly row (mirrors GWS manage_pay_schedules).
function canEditAutoPilotFor(classification: CompensationRow['classification']): boolean {
  return classification === 'Salaried'
}

export function toListData({
  schedules,
  assignment,
  departments,
  employees,
}: {
  schedules: PayScheduleShow[]
  assignment: PayScheduleAssignment | undefined
  departments: Department[]
  employees: Employee[]
}): PaySchedulesListData {
  if (schedules.length === 0) return { type: 'empty' }

  const byId = new Map(schedules.map(s => [s.uuid, s]))
  const type = assignment?.type

  if (type === PayScheduleAssignmentBodyType.HourlySalaried) {
    const salariedSched = byId.get(assignment?.salariedPayScheduleUuid ?? '')
    const hourlySched = byId.get(assignment?.hourlyPayScheduleUuid ?? '')
    let salariedCount = 0
    let hourlyCount = 0
    for (const e of employees) {
      if (isHourlyEmployee(e)) hourlyCount += 1
      else salariedCount += 1
    }
    const rows: CompensationRow[] = [
      {
        id: 'salaried',
        classification: 'Salaried',
        ...scheduleFields(salariedSched),
        employeeCount: salariedCount,
        canEditAutoPilot: canEditAutoPilotFor('Salaried'),
      },
      {
        id: 'hourly',
        classification: 'Hourly',
        ...scheduleFields(hourlySched),
        employeeCount: hourlyCount,
        canEditAutoPilot: canEditAutoPilotFor('Hourly'),
      },
    ]
    return { type: 'compensation', rows }
  }

  if (type === PayScheduleAssignmentBodyType.ByDepartment) {
    const deptToSchedule = new Map<string, string>()
    for (const d of assignment?.departments ?? []) {
      if (d.departmentUuid && d.payScheduleUuid)
        deptToSchedule.set(d.departmentUuid, d.payScheduleUuid)
    }
    const defaultUuid = assignment?.defaultPayScheduleUuid ?? ''
    const employeeCountByDept = new Map<string, number>()
    let uncategorizedCount = 0
    for (const e of employees) {
      if (e.departmentUuid) {
        employeeCountByDept.set(
          e.departmentUuid,
          (employeeCountByDept.get(e.departmentUuid) ?? 0) + 1,
        )
      } else {
        uncategorizedCount += 1
      }
    }
    const rows: DepartmentRow[] = departments
      .filter(d => d.uuid)
      .map(dept => {
        const schedUuid = deptToSchedule.get(dept.uuid!) ?? defaultUuid
        const sched = byId.get(schedUuid)
        return {
          id: dept.uuid!,
          departmentName: dept.title ?? '—',
          ...scheduleFields(sched),
          employeeCount: employeeCountByDept.get(dept.uuid!) ?? 0,
        }
      })
    const defaultSched = byId.get(defaultUuid)
    rows.push({
      id: 'uncategorized',
      departmentName: 'Uncategorized',
      ...scheduleFields(defaultSched),
      employeeCount: uncategorizedCount,
    })
    return { type: 'department', rows }
  }

  if (type === PayScheduleAssignmentBodyType.ByEmployee) {
    const employeeToSchedule = new Map<string, string>()
    for (const e of assignment?.employees ?? []) {
      if (e.employeeUuid && e.payScheduleUuid)
        employeeToSchedule.set(e.employeeUuid, e.payScheduleUuid)
    }
    const countBySchedule = new Map<string, number>()
    for (const emp of employees) {
      const uuid = employeeToSchedule.get(emp.uuid)
      if (!uuid) continue
      countBySchedule.set(uuid, (countBySchedule.get(uuid) ?? 0) + 1)
    }
    const rows: ByEmployeeRow[] = schedules.map(sched => ({
      id: sched.uuid,
      ...scheduleFields(sched),
      employeeCount: countBySchedule.get(sched.uuid) ?? 0,
    }))
    return { type: 'byEmployee', rows }
  }

  const singleSched = byId.get(assignment?.defaultPayScheduleUuid ?? '') ?? schedules[0]
  const summary: SingleSummary = scheduleFields(singleSched)
  return { type: 'single', summary }
}

const mockSingleSummary: SingleSummary = {
  scheduleId: 'schedule-only',
  scheduleName: 'Everyone',
  frequency: 'Every other week',
  autoPilot: false,
}

const mockCompensationRows: CompensationRow[] = [
  {
    id: 'salaried',
    classification: 'Salaried',
    scheduleId: 'schedule-salaried',
    scheduleName: 'Salaried team',
    frequency: 'Twice per month',
    autoPilot: false,
    employeeCount: 6,
    canEditAutoPilot: true,
  },
  {
    id: 'hourly',
    classification: 'Hourly',
    scheduleId: 'schedule-hourly',
    scheduleName: 'Hourly team',
    frequency: 'Every week',
    autoPilot: true,
    employeeCount: 14,
    canEditAutoPilot: false,
  },
]

const mockDepartmentRows: DepartmentRow[] = [
  {
    id: 'dept-eng',
    departmentName: 'Engineering',
    scheduleId: 'schedule-biweekly',
    scheduleName: 'Bi-weekly',
    frequency: 'Every other week',
    autoPilot: false,
    employeeCount: 8,
  },
  {
    id: 'dept-sales',
    departmentName: 'Sales',
    scheduleId: 'schedule-monthly',
    scheduleName: 'Sales monthly',
    frequency: 'Monthly',
    autoPilot: true,
    employeeCount: 5,
  },
  {
    id: 'dept-ops',
    departmentName: 'Operations',
    scheduleId: 'schedule-biweekly',
    scheduleName: 'Bi-weekly',
    frequency: 'Every other week',
    autoPilot: false,
    employeeCount: 3,
  },
  {
    id: 'uncategorized',
    departmentName: 'Uncategorized',
    scheduleId: 'schedule-biweekly',
    scheduleName: 'Bi-weekly',
    frequency: 'Every other week',
    autoPilot: false,
    employeeCount: 1,
  },
]

const mockByEmployeeRows: ByEmployeeRow[] = [
  {
    id: 'schedule-hourly',
    scheduleId: 'schedule-hourly',
    scheduleName: 'Hourly team',
    frequency: 'Every week',
    autoPilot: true,
    employeeCount: 14,
  },
  {
    id: 'schedule-salaried',
    scheduleId: 'schedule-salaried',
    scheduleName: 'Salaried team',
    frequency: 'Twice per month',
    autoPilot: false,
    employeeCount: 6,
  },
  {
    id: 'schedule-execs',
    scheduleId: 'schedule-execs',
    scheduleName: 'Executive',
    frequency: 'Monthly',
    autoPilot: true,
    employeeCount: 3,
  },
]

function ListInteractiveStory({
  data,
  assignmentType,
}: {
  data: PaySchedulesListData
  assignmentType?: PayScheduleType | null
}) {
  return (
    <PaySchedulesList
      data={data}
      assignmentType={assignmentType}
      onManage={() => {}}
      onEditSchedule={() => {}}
      onEditAutoPilot={() => {}}
    />
  )
}

function AutoPilotDialogStory({ startEnabled }: { startEnabled: boolean }) {
  const [isOpen, setIsOpen] = useState(true)
  const [enabled, setEnabled] = useState(startEnabled)
  const [isSaving, setIsSaving] = useState(false)

  return (
    <>
      <AutoPilotDialog
        isOpen={isOpen}
        scheduleName="Hourly team"
        autoPilotEnabled={enabled}
        isSaving={isSaving}
        onClose={() => {
          if (!isSaving) setIsOpen(false)
        }}
        onSave={next => {
          setIsSaving(true)
          setTimeout(() => {
            setEnabled(next)
            setIsSaving(false)
            setIsOpen(false)
          }, 1500)
        }}
      />
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true)
          }}
        >
          Reopen dialog
        </button>
      )}
    </>
  )
}

// ─── Type Selection ────────────────────────────────────────────────

function TypeSelectionStory({
  currentType,
  hasEmployees,
  hasDepartments,
}: {
  currentType: PayScheduleType | null
  hasEmployees: boolean
  hasDepartments: boolean
}) {
  return (
    <PayScheduleTypeSelection
      currentType={currentType}
      hasEmployees={hasEmployees}
      hasDepartments={hasDepartments}
      onContinue={() => {}}
      onBack={() => {}}
    />
  )
}

// ─── Assignment ────────────────────────────────────────────────────

const mockPayScheduleOptions = [
  { value: 'ps-weekly', label: 'Every week — Weekly' },
  { value: 'ps-biweekly', label: 'Every other week — Bi-weekly' },
  { value: 'ps-monthly', label: 'Monthly — Monthly' },
]

const mockDepartments: Department[] = [
  { uuid: 'dept-eng', title: 'Engineering' },
  { uuid: 'dept-sales', title: 'Sales' },
  { uuid: 'dept-ops', title: 'Operations' },
]

const mockEmployees: Employee[] = [
  {
    uuid: 'emp-1',
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'a@example.com',
    version: 'v',
    department: 'Engineering',
    departmentUuid: 'dept-eng',
    onboarded: true,
    jobs: [
      {
        uuid: 'job-1',
        version: 'v',
        primary: true,
        compensations: [{ uuid: 'c-1', version: 'v', flsaStatus: FlsaStatus.EXEMPT }],
      },
    ],
  } as unknown as Employee,
  {
    uuid: 'emp-2',
    firstName: 'Blake',
    lastName: 'Chen',
    email: 'b@example.com',
    version: 'v',
    department: 'Sales',
    departmentUuid: 'dept-sales',
    onboarded: true,
    jobs: [
      {
        uuid: 'job-2',
        version: 'v',
        primary: true,
        compensations: [{ uuid: 'c-2', version: 'v', flsaStatus: FlsaStatus.NONEXEMPT }],
      },
    ],
  } as unknown as Employee,
  {
    uuid: 'emp-3',
    firstName: 'Casey',
    lastName: 'Nguyen',
    email: 'c@example.com',
    version: 'v',
    department: 'Operations',
    departmentUuid: 'dept-ops',
    onboarded: true,
    jobs: [
      {
        uuid: 'job-3',
        version: 'v',
        primary: true,
        compensations: [{ uuid: 'c-3', version: 'v', flsaStatus: FlsaStatus.NONEXEMPT }],
      },
    ],
  } as unknown as Employee,
  {
    uuid: 'emp-4',
    firstName: 'Dana',
    lastName: 'Patel',
    email: 'd@example.com',
    version: 'v',
    department: 'Engineering',
    departmentUuid: 'dept-eng',
    onboarded: true,
    jobs: [
      {
        uuid: 'job-4',
        version: 'v',
        primary: true,
        compensations: [{ uuid: 'c-4', version: 'v', flsaStatus: FlsaStatus.EXEMPT }],
      },
    ],
  } as unknown as Employee,
]

function emptyDraft(type: PayScheduleType, defaultUuid = 'ps-biweekly'): AssignmentDraft {
  return {
    type,
    defaultPayScheduleUuid: defaultUuid,
    hourlyPayScheduleUuid: defaultUuid,
    salariedPayScheduleUuid: defaultUuid,
    employees: new Map(mockEmployees.map(e => [e.uuid, defaultUuid])),
    departments: new Map(mockDepartments.map(d => [d.uuid!, defaultUuid])),
  }
}

function AssignmentStory({ assignmentType }: { assignmentType: PayScheduleType }) {
  const [draft, setDraft] = useState<AssignmentDraft>(() => emptyDraft(assignmentType))
  const [continueClicked, setContinueClicked] = useState(false)

  return (
    <>
      <PayScheduleAssignmentForm
        assignmentType={assignmentType}
        payScheduleOptions={mockPayScheduleOptions}
        employees={mockEmployees}
        departments={mockDepartments}
        draft={draft}
        hasChanges
        onDraftChange={patch => {
          setDraft(prev => ({ ...prev, ...patch }))
        }}
        onEmployeeAssignmentChange={(uuid, value) => {
          setDraft(prev => {
            const next = new Map(prev.employees)
            next.set(uuid, value)
            return { ...prev, employees: next }
          })
        }}
        onDepartmentAssignmentChange={(uuid, value) => {
          setDraft(prev => {
            const next = new Map(prev.departments)
            next.set(uuid, value)
            return { ...prev, departments: next }
          })
        }}
        onCreateNew={() => {}}
        onContinue={() => {
          setContinueClicked(true)
        }}
        onBack={() => {}}
      />
      {continueClicked ? <p>Continue clicked — prototype stub.</p> : null}
    </>
  )
}

// ─── Review ────────────────────────────────────────────────────────

const emptyPreview: PayScheduleAssignmentPreview = {
  type: PayScheduleAssignmentBodyType.Single,
  employeeChanges: [],
}

const populatedPreview: PayScheduleAssignmentPreview = {
  type: PayScheduleAssignmentBodyType.HourlySalaried,
  employeeChanges: [
    {
      employeeUuid: 'emp-1',
      firstName: 'Alex',
      lastName: 'Rivera',
      payFrequency: 'Every week — Weekly',
      firstPayPeriod: {
        checkDate: '2026-08-14',
        startDate: '2026-08-01',
        endDate: '2026-08-07',
      },
      transitionPayPeriod: {
        startDate: '2026-07-25',
        endDate: '2026-07-31',
      },
    },
    {
      employeeUuid: 'emp-2',
      firstName: 'Blake',
      lastName: 'Chen',
      payFrequency: 'Every week — Weekly',
      firstPayPeriod: {
        checkDate: '2026-08-14',
        startDate: '2026-08-01',
        endDate: '2026-08-07',
      },
    },
    {
      employeeUuid: 'emp-3',
      firstName: 'Casey',
      lastName: 'Nguyen',
      payFrequency: 'Every other week — Bi-weekly',
      firstPayPeriod: {
        checkDate: '2026-08-21',
        startDate: '2026-08-08',
        endDate: '2026-08-14',
      },
      transitionPayPeriod: {
        startDate: '2026-07-25',
        endDate: '2026-08-07',
      },
    },
  ],
}

function ReviewStory({
  preview,
  isLoading = false,
  assignmentType = PayScheduleAssignmentBodyType.HourlySalaried,
}: {
  preview: PayScheduleAssignmentPreview | null
  isLoading?: boolean
  assignmentType?: PayScheduleType
}) {
  return (
    <PayScheduleAssignmentReview
      preview={preview}
      assignmentType={assignmentType}
      employeesList={mockEmployees}
      isLoading={isLoading}
      isSubmitting={false}
      onConfirm={() => {}}
      onBack={() => {}}
    />
  )
}

// ─── Registry ──────────────────────────────────────────────────────

export const components: PrototypeComponent[] = [
  {
    slug: 'pay-schedules-list',
    name: 'Pay schedules list',
    description:
      'Landing block on the manage hub. Box title is always "Pay schedule"; the assignment mode drives the sub-heading copy and the shape of the content (DescriptionList for single, per-type DataView otherwise).',
    configurations: [
      {
        slug: 'single',
        name: 'Single',
        description:
          'DescriptionList of Name / Frequency / AutoPilot for the one schedule everyone is on.',
        render: () => (
          <ListInteractiveStory
            data={{ type: 'single', summary: mockSingleSummary }}
            assignmentType={PayScheduleAssignmentBodyType.Single}
          />
        ),
      },
      {
        slug: 'compensation',
        name: 'By compensation type',
        description:
          'Two rows: Salaried and Hourly. AutoPilot action is intentionally suppressed on Hourly to match GWS.',
        render: () => (
          <ListInteractiveStory
            data={{ type: 'compensation', rows: mockCompensationRows }}
            assignmentType={PayScheduleAssignmentBodyType.HourlySalaried}
          />
        ),
      },
      {
        slug: 'by-department',
        name: 'By department',
        description:
          'One row per department plus an Uncategorized row for employees with no department.',
        render: () => (
          <ListInteractiveStory
            data={{ type: 'department', rows: mockDepartmentRows }}
            assignmentType={PayScheduleAssignmentBodyType.ByDepartment}
          />
        ),
      },
      {
        slug: 'by-employee',
        name: 'By employee',
        description:
          'One row per schedule with employee count — each schedule is a bucket for individually assigned employees.',
        render: () => (
          <ListInteractiveStory
            data={{ type: 'byEmployee', rows: mockByEmployeeRows }}
            assignmentType={PayScheduleAssignmentBodyType.ByEmployee}
          />
        ),
      },
      {
        slug: 'empty',
        name: 'Empty',
        description:
          'No schedules configured yet — empty state with the Manage action still available.',
        render: () => <ListInteractiveStory data={{ type: 'empty' }} assignmentType={null} />,
      },
    ],
  },
  {
    slug: 'autopilot-dialog',
    name: 'AutoPilot dialog',
    description: 'Dialog that toggles AutoPilot for a schedule with a copy blurb and switch.',
    configurations: [
      {
        slug: 'disabled-initial',
        name: 'Initially disabled',
        description: 'Dialog opens with AutoPilot off — save enables it.',
        render: () => <AutoPilotDialogStory startEnabled={false} />,
      },
      {
        slug: 'enabled-initial',
        name: 'Initially enabled',
        description: 'Dialog opens with AutoPilot on — save disables it.',
        render: () => <AutoPilotDialogStory startEnabled={true} />,
      },
    ],
  },
  {
    slug: 'type-selection',
    name: 'Type selection',
    description:
      'RadioGroup for choosing pay schedule assignment mode. Options are conditionally shown based on whether the company has employees / departments.',
    configurations: [
      {
        slug: 'all-options-current-single',
        name: 'All options — currently single',
        description: 'Full menu of four choices; current type is single.',
        render: () => (
          <TypeSelectionStory
            currentType={PayScheduleAssignmentBodyType.Single}
            hasEmployees
            hasDepartments
          />
        ),
      },
      {
        slug: 'all-options-current-hourly-salaried',
        name: 'All options — currently hourly/salaried',
        description: 'Current type is hourly/salaried.',
        render: () => (
          <TypeSelectionStory
            currentType={PayScheduleAssignmentBodyType.HourlySalaried}
            hasEmployees
            hasDepartments
          />
        ),
      },
      {
        slug: 'no-departments',
        name: 'No departments',
        description: 'By-department option is hidden when the company has no departments.',
        render: () => <TypeSelectionStory currentType={null} hasEmployees hasDepartments={false} />,
      },
      {
        slug: 'no-employees-no-departments',
        name: 'No employees or departments',
        description: 'Only Single + Hourly/Salaried remain.',
        render: () => (
          <TypeSelectionStory currentType={null} hasEmployees={false} hasDepartments={false} />
        ),
      },
    ],
  },
  {
    slug: 'assignment',
    name: 'Assignment',
    description:
      'Per-type UI for assigning employees or departments to schedules. Each type places its own "Add pay schedule" affordance appropriately (below the field, in the box header, or at the bottom of the list).',
    configurations: [
      {
        slug: 'single',
        name: 'Single',
        description: 'One dropdown for the whole company.',
        render: () => <AssignmentStory assignmentType={PayScheduleAssignmentBodyType.Single} />,
      },
      {
        slug: 'hourly-salaried',
        name: 'Hourly/Salaried',
        description: 'Two dropdowns for compensation-type assignment.',
        render: () => (
          <AssignmentStory assignmentType={PayScheduleAssignmentBodyType.HourlySalaried} />
        ),
      },
      {
        slug: 'by-employee',
        name: 'By employee',
        description:
          'Table with per-employee schedule select — Employee column shows name + department; Type column shows compensation type.',
        render: () => <AssignmentStory assignmentType={PayScheduleAssignmentBodyType.ByEmployee} />,
      },
      {
        slug: 'by-department',
        name: 'By department',
        description: 'One dropdown per department + an Uncategorized fallback.',
        render: () => (
          <AssignmentStory assignmentType={PayScheduleAssignmentBodyType.ByDepartment} />
        ),
      },
    ],
  },
  {
    slug: 'review',
    name: 'Review',
    description:
      'Preview of employee changes before confirming an assignment update. Rows are pre-sorted by last name.',
    configurations: [
      {
        slug: 'loading',
        name: 'Loading preview',
        description: 'Waiting for the preview API to return.',
        render: () => <ReviewStory preview={null} isLoading />,
      },
      {
        slug: 'no-changes',
        name: 'No changes',
        description: 'Preview returned but no employees are affected.',
        render: () => (
          <ReviewStory
            preview={emptyPreview}
            assignmentType={PayScheduleAssignmentBodyType.Single}
          />
        ),
      },
      {
        slug: 'populated-hourly-salaried',
        name: 'Populated (hourly/salaried)',
        description: 'A mix of changes with and without a transition period.',
        render: () => (
          <ReviewStory
            preview={populatedPreview}
            assignmentType={PayScheduleAssignmentBodyType.HourlySalaried}
          />
        ),
      },
      {
        slug: 'populated-single',
        name: 'Populated (single)',
        description: 'Same changes but assignment is single — "New schedule" column is hidden.',
        render: () => (
          <ReviewStory
            preview={populatedPreview}
            assignmentType={PayScheduleAssignmentBodyType.Single}
          />
        ),
      },
    ],
  },
]
