import type { EmployeeCompensations } from '@gusto/embedded-api/models/components/payrollshow'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  useFormatEmployeePayRate,
  getRegularHours,
  getTotalPtoHours,
  getAdditionalEarnings,
  getReimbursements,
  formatHoursDisplay,
} from '../helpers'
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
  onBack: () => void
  onCalculatePayroll: () => void
  onEdit: (employee: Employee) => void
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
  onBack,
  onEdit,
  onCalculatePayroll,
}: PayrollConfigurationPresentationProps) => {
  const { Alert, Button, Heading, Text, Badge } = useComponentContext()
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
        <Alert label="Payroll Deadline" status="info">
          To pay your employees with direct deposit on the check date, you&apos;ll need to run
          payroll by the deadline.
        </Alert>

        {/* TODO: Replace with actual skipped employees list from payroll data */}
        <Alert label="Skipped Employees" status="warning">
          <ul>
            <li>Employee address not verified</li>
            <li>Employee address not verified</li>
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
            render: (item: EmployeeCompensations) => {
              const grossPay =
                typeof item.grossPay === 'string' ? parseFloat(item.grossPay) : item.grossPay
              return <Text>{formatNumberAsCurrency(grossPay || 0)}</Text>
            },
          },
        ]}
        data={employeeCompensations.filter(compensation => {
          const employeeUuid = compensation.employeeUuid
          if (!employeeUuid) return false
          return employeeMap.has(employeeUuid)
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
            isLoading={false}
          />
        )}
      />

      <Button title={t('backButtonTitle')} onClick={onBack} variant="secondary">
        {t('backButton')}
      </Button>
    </Flex>
  )
}
