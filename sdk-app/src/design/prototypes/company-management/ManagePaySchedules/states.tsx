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
  type PaySchedulesListRow,
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

export function toRows(
  schedules: PayScheduleShow[],
  assignment?: PayScheduleAssignment,
): PaySchedulesListRow[] {
  const employeeCounts = new Map<string, number>()
  for (const entry of assignment?.employees ?? []) {
    if (!entry.payScheduleUuid) continue
    employeeCounts.set(entry.payScheduleUuid, (employeeCounts.get(entry.payScheduleUuid) ?? 0) + 1)
  }

  return schedules.map(schedule => ({
    id: schedule.uuid,
    name: schedule.customName ?? '',
    frequency: schedule.frequency
      ? (FREQUENCY_LABELS[schedule.frequency] ?? schedule.frequency)
      : '—',
    autoPilot: schedule.autoPayroll ?? false,
    employeeCount: employeeCounts.get(schedule.uuid) ?? 0,
  }))
}

function buildRow(overrides: Partial<PaySchedulesListRow>): PaySchedulesListRow {
  return {
    id: 'row-default',
    name: 'Bi-weekly',
    frequency: 'Every other week',
    autoPilot: false,
    employeeCount: 0,
    ...overrides,
  }
}

const multipleRows: PaySchedulesListRow[] = [
  buildRow({
    id: 'schedule-hourly',
    name: 'Hourly team',
    frequency: 'Every week',
    autoPilot: true,
    employeeCount: 14,
  }),
  buildRow({
    id: 'schedule-salaried',
    name: 'Salaried team',
    frequency: 'Twice per month',
    autoPilot: false,
    employeeCount: 6,
  }),
  buildRow({
    id: 'schedule-execs',
    name: 'Executive',
    frequency: 'Monthly',
    autoPilot: true,
    employeeCount: 3,
  }),
]

const singleRow: PaySchedulesListRow[] = [
  buildRow({
    id: 'schedule-only',
    name: 'Everyone',
    frequency: 'Every other week',
    autoPilot: false,
    employeeCount: 12,
  }),
]

function ListInteractiveStory({
  initial,
  assignmentType,
}: {
  initial: PaySchedulesListRow[]
  assignmentType?: PayScheduleType | null
}) {
  const [rows, setRows] = useState(initial)
  const [autoPilotTarget, setAutoPilotTarget] = useState<PaySchedulesListRow | null>(null)

  return (
    <>
      <PaySchedulesList
        rows={rows}
        assignmentType={assignmentType}
        onAdd={() => {}}
        onManage={() => {}}
        onEdit={() => {}}
        onEditAutoPilot={row => {
          setAutoPilotTarget(row)
        }}
        onManageEmployees={() => {}}
      />
      <AutoPilotDialog
        isOpen={autoPilotTarget !== null}
        scheduleName={autoPilotTarget?.name ?? ''}
        autoPilotEnabled={autoPilotTarget?.autoPilot ?? false}
        onClose={() => {
          setAutoPilotTarget(null)
        }}
        onSave={enabled => {
          setRows(prev =>
            prev.map(r => (r.id === autoPilotTarget?.id ? { ...r, autoPilot: enabled } : r)),
          )
          setAutoPilotTarget(null)
        }}
      />
    </>
  )
}

function AutoPilotDialogStory({ startEnabled }: { startEnabled: boolean }) {
  const [isOpen, setIsOpen] = useState(true)
  const [enabled, setEnabled] = useState(startEnabled)

  return (
    <>
      <AutoPilotDialog
        isOpen={isOpen}
        scheduleName="Hourly team"
        autoPilotEnabled={enabled}
        onClose={() => {
          setIsOpen(false)
        }}
        onSave={next => {
          setEnabled(next)
          setIsOpen(false)
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
      'Landing block: DataView (multiple) / DescriptionList (single) / empty state, with "Manage" and "Add" header actions and an assignment-mode prose line.',
    configurations: [
      {
        slug: 'multiple-hourly-salaried',
        name: 'Multiple (hourly + salaried)',
        description: 'Three schedules; company is on the hourly/salaried assignment mode.',
        render: () => (
          <ListInteractiveStory
            initial={multipleRows}
            assignmentType={PayScheduleAssignmentBodyType.HourlySalaried}
          />
        ),
      },
      {
        slug: 'multiple-by-employee',
        name: 'Multiple (by employee)',
        description: 'Three schedules; company is on the per-employee assignment mode.',
        render: () => (
          <ListInteractiveStory
            initial={multipleRows}
            assignmentType={PayScheduleAssignmentBodyType.ByEmployee}
          />
        ),
      },
      {
        slug: 'single',
        name: 'Single',
        description: 'One schedule — DescriptionList variant. Company is on single assignment.',
        render: () => (
          <ListInteractiveStory
            initial={singleRow}
            assignmentType={PayScheduleAssignmentBodyType.Single}
          />
        ),
      },
      {
        slug: 'empty',
        name: 'Empty',
        description: 'No schedules configured yet — empty state with visible Manage + Add.',
        render: () => <ListInteractiveStory initial={[]} assignmentType={null} />,
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
      'Per-type UI for assigning employees or departments to schedules. Includes an "Add new pay schedule" affordance.',
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
        description: 'Table with per-employee schedule select, showing Department + Type columns.',
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
