import type { ReactNode } from 'react'
import type { EmployeeCompensations } from '@gusto/embedded-api/models/components/payrollshow'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import { Trans, useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import {
  useFormatEmployeePayRate,
  getRegularHours,
  getOvertimeHours,
  getTotalPtoHours,
  getAdditionalEarnings,
  getReimbursements,
  formatHoursDisplay,
  calculateGrossPay,
} from '../helpers'
import { useI18n } from '@/i18n'
import { DataView, Flex, FlexItem, Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import { firstLastName, formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { parseDateStringToLocal } from '@/helpers/dateFormatting'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'
import { useLoadingIndicator } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'

interface PayrollConfigurationPresentationProps {
  employeeCompensations: EmployeeCompensations[]
  employeeDetails: Employee[]
  payPeriod?: PayrollPayPeriodType
  paySchedule?: PayScheduleObject
  onCalculatePayroll: () => void
  onEdit: (employee: Employee) => void
  isOffCycle?: boolean
  alerts?: ReactNode
  isPending?: boolean
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
      return { startDate: startFormatted, endDate: endFormatted }
    }
  }
  return { startDate: '', endDate: '' }
}

export const PayrollConfigurationPresentation = ({
  employeeCompensations,
  employeeDetails,
  payPeriod,
  paySchedule,
  onEdit,
  onCalculatePayroll,
  isOffCycle = false,
  alerts,
  isPending,
}: PayrollConfigurationPresentationProps) => {
  const { Button, Heading, Text, Badge } = useComponentContext()
  useI18n('Payroll.PayrollConfiguration')
  const { t } = useTranslation('Payroll.PayrollConfiguration')
  const { locale } = useLocale()
  const { LoadingIndicator } = useLoadingIndicator()
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
        <FlexItem>
          <Heading as="h1">{t('pageTitle')}</Heading>
          <Text>
            {t('description')}{' '}
            <Text as="span" weight="bold">
              <Trans
                i18nKey="description"
                t={t}
                components={{ dateWrapper: <Text weight="bold" as="span" /> }}
                values={getPayrollConfigurationTitle({ payPeriod, locale, t })}
              />
            </Text>
          </Text>
        </FlexItem>
        <Button
          title={t('calculatePayrollTitle')}
          onClick={onCalculatePayroll}
          isDisabled={isPending}
        >
          {t('calculatePayroll')}
        </Button>
      </Flex>

      {alerts && (
        <Grid gap={16} gridTemplateColumns="1fr">
          {alerts}
        </Grid>
      )}

      {isPending ? (
        <LoadingIndicator>
          <Flex flexDirection="column" alignItems="center" gap={4}>
            {/* Spinner */}
            <Heading as="h4">{t('loadingTitle')}</Heading>
            <Text>{t('loadingDescription')}</Text>
          </Flex>
        </LoadingIndicator>
      ) : (
        <>
          <FlexItem>
            <Heading as="h3">{t('hoursAndEarningsTitle')}</Heading>
            <Text>{t('hoursAndEarningsDescription')}</Text>
          </FlexItem>

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
                  const overtimeHours = getOvertimeHours(item)
                  return <Text>{formatHoursDisplay(hours + overtimeHours)}</Text>
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
                    ? calculateGrossPay(
                        item,
                        employee,
                        payPeriod?.startDate,
                        paySchedule,
                        isOffCycle,
                      )
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
        </>
      )}
    </Flex>
  )
}
