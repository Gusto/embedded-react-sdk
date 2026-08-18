import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { Department } from '@gusto/embedded-api/models/components/department'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { PayScheduleType } from './PayScheduleTypeSelection'
import { ActionsLayout, DataView, Flex, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { FlsaStatus } from '@/shared/constants'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'

export interface AssignmentDraft {
  type: PayScheduleType
  defaultPayScheduleUuid?: string
  hourlyPayScheduleUuid?: string
  salariedPayScheduleUuid?: string
  employees: Map<string, string>
  departments: Map<string, string>
}

export interface PayScheduleAssignmentFormProps {
  assignmentType: PayScheduleType
  payScheduleOptions: Array<{ value: string; label: string }>
  employees: Employee[]
  departments: Department[]
  draft: AssignmentDraft
  hasChanges: boolean
  onDraftChange: (patch: Partial<AssignmentDraft>) => void
  onEmployeeAssignmentChange: (employeeUuid: string, payScheduleUuid: string) => void
  onDepartmentAssignmentChange: (departmentUuid: string, payScheduleUuid: string) => void
  onCreateNew: () => void
  onContinue: () => void
  onBack: () => void
}

function compensationTypeLabel(employee: Employee): string {
  const flsaStatus = employee.jobs?.[0]?.compensations?.[0]?.flsaStatus
  switch (flsaStatus) {
    case FlsaStatus.EXEMPT:
    case FlsaStatus.COMMISSION_ONLY_EXEMPT:
      return 'Salaried / Exempt'
    case FlsaStatus.NONEXEMPT:
      return 'Hourly / Nonexempt'
    case FlsaStatus.SALARIED_NONEXEMPT:
    case FlsaStatus.COMMISSION_ONLY_NONEXEMPT:
      return 'Salaried / Nonexempt'
    case FlsaStatus.OWNER:
      return 'Owner'
    default:
      return '—'
  }
}

function departmentLabel(employee: Employee, departmentsByUuid: Map<string, Department>): string {
  if (employee.department) return employee.department
  if (employee.departmentUuid) {
    return departmentsByUuid.get(employee.departmentUuid)?.title ?? '—'
  }
  return '—'
}

export function PayScheduleAssignmentForm({
  assignmentType,
  payScheduleOptions,
  employees,
  departments,
  draft,
  hasChanges,
  onDraftChange,
  onEmployeeAssignmentChange,
  onDepartmentAssignmentChange,
  onCreateNew,
  onContinue,
  onBack,
}: PayScheduleAssignmentFormProps) {
  const Components = useComponentContext()

  const departmentsByUuid = new Map(departments.filter(d => d.uuid).map(d => [d.uuid as string, d]))

  const employeeTableProps = useDataView<Employee>({
    data: employees,
    columns: [
      {
        title: 'Employee',
        render: (employee: Employee) => (
          <>
            {`${employee.firstName} ${employee.lastName}`}
            <Components.Text variant="supporting" size="sm">
              {departmentLabel(employee, departmentsByUuid)}
            </Components.Text>
          </>
        ),
      },
      {
        title: 'Type',
        render: (employee: Employee) => compensationTypeLabel(employee),
      },
      {
        title: 'Pay schedule',
        render: (employee: Employee) => (
          <Components.Select
            label="Pay schedule"
            shouldVisuallyHideLabel
            isRequired
            placeholder="Select..."
            options={payScheduleOptions}
            value={draft.employees.get(employee.uuid) ?? ''}
            onChange={value => {
              onEmployeeAssignmentChange(employee.uuid, value)
            }}
          />
        ),
      },
    ],
  })

  const addScheduleButton = (
    <Components.Button variant="secondary" onClick={onCreateNew} icon={<PlusCircleIcon />}>
      Add pay schedule
    </Components.Button>
  )

  const renderBody = () => {
    switch (assignmentType) {
      case PayScheduleAssignmentBodyType.Single:
        return (
          <Flex flexDirection="column" gap={16} alignItems="flex-start">
            <Components.Select
              label="Pay schedule"
              description="The pay schedule to use for all employees."
              isRequired
              placeholder="Select..."
              options={payScheduleOptions}
              value={draft.defaultPayScheduleUuid ?? ''}
              onChange={value => {
                onDraftChange({ defaultPayScheduleUuid: value })
              }}
            />
            {addScheduleButton}
          </Flex>
        )
      case PayScheduleAssignmentBodyType.HourlySalaried:
        return (
          <Flex flexDirection="column" gap={20} alignItems="stretch">
            <Components.Select
              label="Hourly/Non-exempt"
              description="Select a pay schedule for hourly, salaried non-exempt, and commission-only non-exempt employees."
              isRequired
              placeholder="Select..."
              options={payScheduleOptions}
              value={draft.hourlyPayScheduleUuid ?? ''}
              onChange={value => {
                onDraftChange({ hourlyPayScheduleUuid: value })
              }}
            />
            <Components.Select
              label="Salaried/Exempt"
              description="Select a pay schedule for salaried and commission-only exempt employees."
              isRequired
              placeholder="Select..."
              options={payScheduleOptions}
              value={draft.salariedPayScheduleUuid ?? ''}
              onChange={value => {
                onDraftChange({ salariedPayScheduleUuid: value })
              }}
            />
            <Flex justifyContent="flex-start">{addScheduleButton}</Flex>
          </Flex>
        )
      case PayScheduleAssignmentBodyType.ByEmployee:
        return (
          <Components.Box
            withPadding={false}
            header={
              <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
                <Components.Heading as="h3">Employees</Components.Heading>
                {addScheduleButton}
              </Flex>
            }
          >
            <DataView
              label="Employee pay schedule assignments"
              isWithinBox
              {...employeeTableProps}
            />
          </Components.Box>
        )
      case PayScheduleAssignmentBodyType.ByDepartment:
        return (
          <Flex flexDirection="column" gap={20} alignItems="stretch">
            {departments.map(dept => (
              <Components.Select
                key={dept.uuid ?? dept.title ?? ''}
                label={dept.title ?? '—'}
                isRequired
                placeholder="Select..."
                options={payScheduleOptions}
                value={draft.departments.get(dept.uuid ?? '') ?? ''}
                onChange={value => {
                  if (dept.uuid) onDepartmentAssignmentChange(dept.uuid, value)
                }}
              />
            ))}
            <Components.Select
              label="Uncategorized employees"
              description="Select a pay schedule for employees who aren't assigned to any department."
              isRequired
              placeholder="Select..."
              options={payScheduleOptions}
              value={draft.defaultPayScheduleUuid ?? ''}
              onChange={value => {
                onDraftChange({ defaultPayScheduleUuid: value })
              }}
            />
            <Flex justifyContent="flex-start">{addScheduleButton}</Flex>
          </Flex>
        )
      default:
        return null
    }
  }

  return (
    <Flex flexDirection="column" gap={24} alignItems="stretch">
      <Components.Heading as="h2">Assign employees</Components.Heading>
      {renderBody()}
      <ActionsLayout>
        <Components.Button variant="secondary" onClick={onBack}>
          Back
        </Components.Button>
        <Components.Button onClick={onContinue} isDisabled={!hasChanges}>
          Continue
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
