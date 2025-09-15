import type { EmployeeCompensations } from '@gusto/embedded-api/models/components/payrollshow'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import {
  useFormatEmployeePayRate,
  getRegularHours,
  getTotalPtoHours,
  getAdditionalEarnings,
  getReimbursements,
  formatHoursDisplay,
  calculateGrossPay,
} from '../helpers'
import { useI18n } from '@/i18n'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import { firstLastName, formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { parseDateStringToLocal } from '@/helpers/dateFormatting'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'

interface PayrollConfigurationPresentationProps {
  employeeCompensations: EmployeeCompensations[]
  employeeDetails: Employee[]
  payPeriod?: PayrollPayPeriodType
  paySchedule?: PayScheduleObject
  onBack: () => void
  onCalculatePayroll: () => void
  onEdit: (employee: Employee) => void
  isOffCycle?: boolean
}

const getPayrollConfigurationTitle = ({
  payPeriod,
  locale,
  t,
}: {
  payPeriod?: PayrollPayPeriodType
  locale: string
  t: TFunction<'Payroll.PayrollConfiguration'>
}) => {
  if (payPeriod?.startDate && payPeriod.endDate) {
    const startDate = parseDateStringToLocal(payPeriod.startDate)
    const endDate = parseDateStringToLocal(payPeriod.endDate)

    if (startDate && endDate) {
      const startFormatted = startDate.toLocaleDateString(locale, {
        month: 'long',
        day: 'numeric',
      })
      const endFormatted = endDate.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      return t('pageTitle', { startDate: startFormatted, endDate: endFormatted })
    }
  }
  return t('pageTitle', { startDate: '', endDate: '' })
}

export const PayrollConfigurationPresentation = ({
  employeeCompensations,
  employeeDetails,
  payPeriod,
  paySchedule,
  onBack,
  onEdit,
  onCalculatePayroll,
  isOffCycle = false,
}: PayrollConfigurationPresentationProps) => {
  const { Alert, Button, Heading, Text, Badge } = useComponentContext()
  useI18n('Payroll.PayrollConfiguration')
  const { t } = useTranslation('Payroll.PayrollConfiguration')
  const { locale } = useLocale()
  const formatEmployeePayRate = useFormatEmployeePayRate()

  const employeeMap = new Map(employeeDetails.map(employee => [employee.uuid, employee]))

  const getEmployeeName = (employeeUuid: string) => {
    const employee = employeeMap.get(employeeUuid)
    return employee
      ? firstLastName({ first_name: employee.firstName, last_name: employee.lastName })
      : null
  }

  return (
    <Flex flexDirection="column" gap={16}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading as="h1">{getPayrollConfigurationTitle({ payPeriod, locale, t })}</Heading>
        <Button title={t('calculatePayrollTitle')} onClick={onCalculatePayroll}>
          {t('calculatePayroll')}
        </Button>
      </Flex>

      <Text>{t('regularPayroll')}</Text>

      <Flex flexDirection="column" gap={16}>
        {/* TODO: Replace with actual deadline information from payroll data */}
        <Alert label={t('alerts.payrollDeadline.label')} status="info">
          {t('alerts.payrollDeadline.message')}
        </Alert>

        {/* TODO: Replace with actual skipped employees list from payroll data */}
        <Alert label={t('alerts.skippedEmployees.label')} status="warning">
          <ul>
            <li>{t('alerts.skippedEmployees.employeeAddressNotVerified')}</li>
            <li>{t('alerts.skippedEmployees.employeeAddressNotVerified')}</li>
          </ul>
        </Alert>
      </Flex>

      <Heading as="h3">{t('hoursAndEarningsTitle')}</Heading>
      <Text>{t('hoursAndEarningsDescription')}</Text>

      <DataView
        label={t('employeeCompensationsTitle')}
        columns={[
          {
            title: <Text weight="semibold">{t('tableColumns.employees')}</Text>,
            render: (item: EmployeeCompensations) => {
              const employee = employeeMap.get(item.employeeUuid || '')
              const payRateDisplay = formatEmployeePayRate(employee)
              return (
                <Flex flexDirection="column" gap={8 as const}>
                  <Text weight="semibold">{getEmployeeName(item.employeeUuid || '')}</Text>
                  {payRateDisplay && <Text variant="supporting">{payRateDisplay}</Text>}
                  {item.excluded && <Badge status="warning">{t('skippedBadge')}</Badge>}
                </Flex>
              )
            },
          },
          {
            title: <Text weight="semibold">{t('tableColumns.hours')}</Text>,
            render: (item: EmployeeCompensations) => {
              const hours = getRegularHours(item)
              return <Text>{formatHoursDisplay(hours)}</Text>
            },
          },
          {
            title: <Text weight="semibold">{t('tableColumns.timeOff')}</Text>,
            render: (item: EmployeeCompensations) => {
              const ptoHours = getTotalPtoHours(item)
              return <Text>{formatHoursDisplay(ptoHours)}</Text>
            },
          },
          {
            title: <Text weight="semibold">{t('tableColumns.additionalEarnings')}</Text>,
            render: (item: EmployeeCompensations) => {
              const earnings = getAdditionalEarnings(item)
              return <Text>{formatNumberAsCurrency(earnings)}</Text>
            },
          },
          {
            title: <Text weight="semibold">{t('tableColumns.reimbursements')}</Text>,
            render: (item: EmployeeCompensations) => {
              const reimbursements = getReimbursements(item)
              return <Text>{formatNumberAsCurrency(reimbursements)}</Text>
            },
          },
          {
            title: <Text weight="semibold">{t('tableColumns.totalPay')}</Text>,
            render: (item: PayrollEmployeeCompensationsType) => {
              const employee = employeeMap.get(item.employeeUuid || '')
              const calculatedGrossPay = employee
                ? calculateGrossPay(item, employee, payPeriod?.startDate, paySchedule, isOffCycle)
                : 0
              return <Text>{formatNumberAsCurrency(calculatedGrossPay)}</Text>
            },
          },
        ]}
        data={employeeCompensations
          .filter(compensation => {
            const employeeUuid = compensation.employeeUuid
            if (!employeeUuid) return false
            return employeeMap.has(employeeUuid)
          })
          .sort((a, b) => {
            const employeeA = employeeMap.get(a.employeeUuid || '')
            const employeeB = employeeMap.get(b.employeeUuid || '')
            const lastNameA = employeeA?.lastName || ''
            const lastNameB = employeeB?.lastName || ''
            return lastNameA.localeCompare(lastNameB)
          })}
        itemMenu={(item: EmployeeCompensations) => (
          <HamburgerMenu
            items={[
              {
                label: t('editMenu.edit'),
                icon: <PencilSvg aria-hidden />,
                onClick: () => {
                  const employee = employeeMap.get(item.employeeUuid || '')
                  if (employee) {
                    onEdit(employee)
                  }
                },
              },
            ]}
            triggerLabel={t('editMenu.edit')}
          />
        )}
      />

      <Button title={t('backButtonTitle')} onClick={onBack} variant="secondary">
        {t('backButton')}
      </Button>
    </Flex>
  )
}
