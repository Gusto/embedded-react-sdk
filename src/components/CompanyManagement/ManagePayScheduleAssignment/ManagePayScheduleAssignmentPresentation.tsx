import { useTranslation } from 'react-i18next'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { Department } from '@gusto/embedded-api/models/components/department'
import type { PayScheduleType } from './ManagePayScheduleAssignment'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { Flex, ActionsLayout, DataView } from '@/components/Common'
import { FlsaStatus } from '@/shared/constants'

interface PayScheduleOption {
  value: string
  label: string
}

interface ManagePayScheduleAssignmentPresentationProps {
  assignmentType: PayScheduleType
  payScheduleOptions: PayScheduleOption[]
  paySchedules: PayScheduleObject[]
  employees: Employee[]
  departments: Department[]
  defaultPayScheduleUuid: string
  hourlyPayScheduleUuid: string
  salariedPayScheduleUuid: string
  employeeAssignments: Map<string, string>
  departmentAssignments: Map<string, string>
  onDefaultChange: (value: string) => void
  onHourlyChange: (value: string) => void
  onSalariedChange: (value: string) => void
  onEmployeeAssignmentChange: (employeeUuid: string, value: string) => void
  onDepartmentAssignmentChange: (departmentUuid: string, value: string) => void
  onCreateNew: () => void
  onContinue: () => void
  onBack: () => void
  hasChanges: boolean
}

export function ManagePayScheduleAssignmentPresentation({
  assignmentType,
  payScheduleOptions,
  employees,
  departments,
  defaultPayScheduleUuid,
  hourlyPayScheduleUuid,
  salariedPayScheduleUuid,
  employeeAssignments,
  departmentAssignments,
  onDefaultChange,
  onHourlyChange,
  onSalariedChange,
  onEmployeeAssignmentChange,
  onDepartmentAssignmentChange,
  onCreateNew,
  onContinue,
  onBack,
  hasChanges,
}: ManagePayScheduleAssignmentPresentationProps) {
  useI18n('CompanyManagement.ManagePayScheduleAssignment')
  const { t } = useTranslation('CompanyManagement.ManagePayScheduleAssignment')
  const { Heading, Text, Select, Button } = useComponentContext()

  const renderSingleAssignment = () => (
    <Flex flexDirection="column" gap={16}>
      <Select
        label={t('single.label')}
        description={t('single.description')}
        options={payScheduleOptions}
        value={defaultPayScheduleUuid}
        onChange={onDefaultChange}
        isRequired
      />
    </Flex>
  )

  const renderHourlySalariedAssignment = () => (
    <Flex flexDirection="column" gap={24}>
      <Select
        label={t('hourlySalaried.hourlyLabel')}
        description={t('hourlySalaried.hourlyDescription')}
        options={payScheduleOptions}
        value={hourlyPayScheduleUuid}
        onChange={onHourlyChange}
        isRequired
      />
      <Select
        label={t('hourlySalaried.salariedLabel')}
        description={t('hourlySalaried.salariedDescription')}
        options={payScheduleOptions}
        value={salariedPayScheduleUuid}
        onChange={onSalariedChange}
        isRequired
      />
    </Flex>
  )

  const getCompensationType = (employee: Employee): string => {
    const flsaStatus = employee.jobs?.[0]?.compensations?.[0]?.flsaStatus
    if (!flsaStatus) return ''

    switch (flsaStatus) {
      case FlsaStatus.EXEMPT:
      case FlsaStatus.COMMISSION_ONLY_EXEMPT:
        return t('employeeTypes.salariedExempt')
      case FlsaStatus.NONEXEMPT:
        return t('employeeTypes.hourlyNonexempt')
      case FlsaStatus.SALARIED_NONEXEMPT:
      case FlsaStatus.COMMISSION_ONLY_NONEXEMPT:
        return t('employeeTypes.salariedNonexempt')
      case FlsaStatus.OWNER:
        return t('employeeTypes.owner')
      default:
        return ''
    }
  }

  const renderByEmployeeAssignment = () => (
    <Flex flexDirection="column" gap={16}>
      <DataView
        label={t('byEmployee.tableLabel')}
        columns={[
          {
            title: t('byEmployee.columns.name'),
            render: (employee: Employee) => `${employee.firstName} ${employee.lastName}`,
          },
          {
            title: t('byEmployee.columns.type'),
            render: (employee: Employee) => getCompensationType(employee),
          },
          {
            title: t('byEmployee.columns.paySchedule'),
            render: (employee: Employee) => (
              <Select
                label={t('byEmployee.columns.paySchedule')}
                shouldVisuallyHideLabel
                options={payScheduleOptions}
                value={employeeAssignments.get(employee.uuid) ?? ''}
                onChange={value => {
                  onEmployeeAssignmentChange(employee.uuid, value)
                }}
                isRequired
              />
            ),
          },
        ]}
        data={employees}
      />
    </Flex>
  )

  const renderByDepartmentAssignment = () => (
    <Flex flexDirection="column" gap={24}>
      {departments.map(dept => (
        <Select
          key={dept.uuid}
          label={dept.title ?? ''}
          options={payScheduleOptions}
          value={departmentAssignments.get(dept.uuid ?? '') ?? ''}
          onChange={value => {
            onDepartmentAssignmentChange(dept.uuid ?? '', value)
          }}
          isRequired
        />
      ))}

      <Select
        label={t('byDepartment.uncategorizedLabel')}
        description={t('byDepartment.uncategorizedDescription')}
        options={payScheduleOptions}
        value={defaultPayScheduleUuid}
        onChange={onDefaultChange}
        isRequired
      />
    </Flex>
  )

  const renderAssignmentForm = () => {
    switch (assignmentType) {
      case PayScheduleAssignmentBodyType.Single:
        return renderSingleAssignment()
      case PayScheduleAssignmentBodyType.HourlySalaried:
        return renderHourlySalariedAssignment()
      case PayScheduleAssignmentBodyType.ByEmployee:
        return renderByEmployeeAssignment()
      case PayScheduleAssignmentBodyType.ByDepartment:
        return renderByDepartmentAssignment()
      default:
        return null
    }
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <Flex flexDirection="column" gap={2}>
          <Heading as="h2">{t('title')}</Heading>
          <Text variant="supporting">This is temporary</Text>
        </Flex>
        <Button variant="secondary" onClick={onCreateNew}>
          {t('addNewPaySchedule')}
        </Button>
      </Flex>

      {renderAssignmentForm()}

      <ActionsLayout>
        <Button variant="secondary" onClick={onBack}>
          {t('backButton')}
        </Button>
        <Button onClick={onContinue} isDisabled={!hasChanges}>
          {t('continueButton')}
        </Button>
      </ActionsLayout>
    </Flex>
  )
}
