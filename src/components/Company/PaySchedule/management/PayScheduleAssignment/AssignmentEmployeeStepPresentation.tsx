import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ShowEmployees } from '@gusto/embedded-api/models/components/showemployees'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payschedulelistitem'
import { scheduleLabel } from './scheduleLabel'
import { getPrimaryCompensation } from './employeeJob'
import { FlsaStatus } from '@/shared/constants'
import { ActionsLayout, DataView, Flex, useDataView } from '@/components/Common'
import { useClientPagination } from '@/hooks/useClientPagination/useClientPagination'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Employee UUIDs and their selected schedules.
 *
 * @internal
 */
export type EmployeeSelection = {
  employees: { employeeUuid: string; payScheduleUuid: string }[]
}

/**
 * Props for the paginated employee assignment picker.
 *
 * @internal
 */
export interface AssignmentEmployeeStepPresentationProps {
  employees: ShowEmployees[]
  schedules: PayScheduleShow[]
  selection: EmployeeSelection
  onBack: (selection: EmployeeSelection) => void
  onAddPaySchedule: (selection: EmployeeSelection) => void
  onContinue: (selection: EmployeeSelection) => void
}

/**
 * Renders a schedule picker for every employee, retaining choices across pages.
 *
 * @param props - Employee roster, schedule choices, draft, and navigation callbacks.
 * @returns The paginated employee assignment step.
 * @internal
 */
export function AssignmentEmployeeStepPresentation({
  employees,
  schedules,
  selection,
  onBack,
  onAddPaySchedule,
  onContinue,
}: AssignmentEmployeeStepPresentationProps) {
  const { t } = useTranslation('Company.Management.PayScheduleAssignment')
  const Components = useComponentContext()
  const [choices, setChoices] = useState<Record<string, string>>({})
  const currentSelection: EmployeeSelection = {
    employees: employees.map(employee => {
      const uuid =
        choices[employee.uuid] ??
        selection.employees.find(entry => entry.employeeUuid === employee.uuid)?.payScheduleUuid ??
        ''
      return {
        employeeUuid: employee.uuid,
        payScheduleUuid: schedules.some(schedule => schedule.uuid === uuid) ? uuid : '',
      }
    }),
  }
  const { data, pagination } = useClientPagination(employees, { searchDebounceMs: 0 })
  const table = useDataView<ShowEmployees>({
    data,
    pagination,
    columns: [
      {
        title: t('employeeStep.employeeLabel'),
        render: employee => (
          <>
            {[employee.firstName, employee.lastName].filter(Boolean).join(' ')}
            {employee.department && (
              <Components.Text variant="supporting" size="sm">
                {employee.department}
              </Components.Text>
            )}
          </>
        ),
      },
      {
        title: t('employeeStep.typeLabel'),
        render: employee => {
          const status = employee.flsaStatus ?? getPrimaryCompensation(employee)?.flsaStatus
          switch (status) {
            case FlsaStatus.EXEMPT:
            case FlsaStatus.COMMISSION_ONLY_EXEMPT:
              return t('employeeStep.types.salariedExempt')
            case FlsaStatus.NONEXEMPT:
              return t('employeeStep.types.hourly')
            case FlsaStatus.SALARIED_NONEXEMPT:
            case FlsaStatus.COMMISSION_ONLY_NONEXEMPT:
              return t('employeeStep.types.salariedNonexempt')
            case FlsaStatus.OWNER:
              return t('employeeStep.types.owner')
            default:
              return '—'
          }
        },
      },
      {
        title: t('employeeStep.payScheduleLabel'),
        render: employee => (
          <Components.Select
            label={t('employeeStep.scheduleForEmployee', {
              name: [employee.firstName, employee.lastName].filter(Boolean).join(' '),
            })}
            shouldVisuallyHideLabel
            isRequired
            placeholder=""
            options={schedules.map(schedule => ({
              value: schedule.uuid,
              label: scheduleLabel(schedule),
            }))}
            value={
              currentSelection.employees.find(entry => entry.employeeUuid === employee.uuid)
                ?.payScheduleUuid ?? ''
            }
            onChange={value => {
              setChoices(previous => ({ ...previous, [employee.uuid]: value }))
            }}
          />
        ),
      },
    ],
  })
  return (
    <Flex flexDirection="column" gap={32}>
      <Components.Heading as="h2">{t('employeeStep.heading')}</Components.Heading>
      <Components.Box
        withPadding={false}
        header={
          <Components.BoxHeader
            title={t('employeeStep.employeesLabel')}
            action={
              <Components.Button
                variant="secondary"
                onClick={() => {
                  onAddPaySchedule(currentSelection)
                }}
              >
                {t('employeeStep.addPayScheduleCta')}
              </Components.Button>
            }
          />
        }
      >
        <DataView label={t('employeeStep.tableLabel')} isWithinBox {...table} />
      </Components.Box>
      <ActionsLayout>
        <Components.Button
          variant="secondary"
          onClick={() => {
            onBack(currentSelection)
          }}
        >
          {t('backCta')}
        </Components.Button>
        <Components.Button
          isDisabled={
            employees.length === 0 ||
            currentSelection.employees.some(entry => !entry.payScheduleUuid)
          }
          onClick={() => {
            onContinue(currentSelection)
          }}
        >
          {t('continueCta')}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
