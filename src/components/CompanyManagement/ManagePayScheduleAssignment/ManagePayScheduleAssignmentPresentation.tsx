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
  onContinue: () => void
  onBack: () => void
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
  onContinue,
  onBack,
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
      />
      <Select
        label={t('hourlySalaried.salariedLabel')}
        description={t('hourlySalaried.salariedDescription')}
        options={payScheduleOptions}
        value={salariedPayScheduleUuid}
        onChange={onSalariedChange}
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
      <Button
        variant="tertiary"
        onClick={() => {
          onEmployeeAssignmentChange('', '__CREATE_NEW__')
        }}
      >
        {t('addNewPaySchedule')}
      </Button>

      <DataView
        label={t('byEmployee.tableLabel')}
        columns={[
          {
            title: <Text weight="semibold">{t('byEmployee.columns.name')}</Text>,
            render: (employee: Employee) => (
              <Text weight="semibold">{`${employee.firstName} ${employee.lastName}`}</Text>
            ),
          },
          {
            title: <Text weight="semibold">{t('byEmployee.columns.department')}</Text>,
            render: (employee: Employee) => {
              const deptUuid = employee.jobs?.[0]?.currentCompensationUuid
              const dept = departments.find(d => d.uuid === deptUuid)
              return <Text>{dept?.title ?? ''}</Text>
            },
          },
          {
            title: <Text weight="semibold">{t('byEmployee.columns.type')}</Text>,
            render: (employee: Employee) => <Text>{getCompensationType(employee)}</Text>,
          },
          {
            title: <Text weight="semibold">{t('byEmployee.columns.paySchedule')}</Text>,
            render: (employee: Employee) => (
              <Select
                label={t('byEmployee.columns.paySchedule')}
                shouldVisuallyHideLabel
                options={payScheduleOptions}
                value={employeeAssignments.get(employee.uuid) ?? ''}
                onChange={value => {
                  onEmployeeAssignmentChange(employee.uuid, value)
                }}
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
        />
      ))}

      <Select
        label={t('byDepartment.uncategorizedLabel')}
        description={t('byDepartment.uncategorizedDescription')}
        options={payScheduleOptions}
        value={defaultPayScheduleUuid}
        onChange={onDefaultChange}
      />

      <Button
        variant="tertiary"
        onClick={() => {
          onDefaultChange('__CREATE_NEW__')
        }}
      >
        {t('addNewPaySchedule')}
      </Button>
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
      <Heading as="h2">{t('title')}</Heading>

      {renderAssignmentForm()}

      <ActionsLayout>
        <Button variant="secondary" onClick={onBack}>
          {t('backButton')}
        </Button>
        <Button onClick={onContinue}>{t('continueButton')}</Button>
      </ActionsLayout>
    </Flex>
  )
}
