import type { ReactNode } from 'react'
import type { EmployeeCompensations } from '@gusto/embedded-api/models/components/payrollshow'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import { Trans, useTranslation } from 'react-i18next'
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
import type { ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { PayrollBlockerAlerts } from '../PayrollBlocker/components/PayrollBlockerAlerts'
import styles from './PayrollConfigurationPresentation.module.scss'
import { useI18n } from '@/i18n'
import { DataView, Flex, FlexItem, Grid } from '@/components/Common'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import XCircle from '@/assets/icons/x-circle.svg?react'
import PlusCircle from '@/assets/icons/plus-circle.svg?react'
import { firstLastName, formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { useLoadingIndicator } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'

interface PayrollConfigurationPresentationProps {
  employeeCompensations: EmployeeCompensations[]
  employeeDetails: Employee[]
  payPeriod?: PayrollPayPeriodType
  paySchedule?: PayScheduleObject
  onCalculatePayroll: () => void
  onEdit: (employee: Employee) => void
  onToggleExclude: (employeeCompensation: PayrollEmployeeCompensationsType) => void
  onViewBlockers: () => void
  isOffCycle?: boolean
  alerts?: ReactNode
  payrollDeadlineNotice?: {
    label: string
    content?: ReactNode
  }
  isPending?: boolean
  payrollBlockers?: ApiPayrollBlocker[]
  pagination?: PaginationControlProps
}

const getPayrollConfigurationTitle = (
  payPeriod: PayrollPayPeriodType | undefined,
  dateFormatter: ReturnType<typeof useDateFormatter>,
) => {
  if (payPeriod?.startDate && payPeriod.endDate) {
    return dateFormatter.formatPayPeriod(payPeriod.startDate, payPeriod.endDate)
  }
  return { startDate: '', endDate: '' }
}

export const PayrollConfigurationPresentation = ({
  employeeCompensations,
  employeeDetails,
  payPeriod,
  paySchedule,
  onEdit,
  onToggleExclude,
  onCalculatePayroll,
  onViewBlockers,
  isOffCycle = false,
  alerts,
  payrollDeadlineNotice,
  isPending,
  payrollBlockers = [],
  pagination,
}: PayrollConfigurationPresentationProps) => {
  const { Button, Heading, Text, Badge, LoadingSpinner, Alert } = useComponentContext()
  useI18n('Payroll.PayrollConfiguration')
  const { t } = useTranslation('Payroll.PayrollConfiguration')
  const dateFormatter = useDateFormatter()
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
            <Trans
              i18nKey="description"
              t={t}
              components={{ dateWrapper: <Text weight="bold" as="span" /> }}
              values={getPayrollConfigurationTitle(payPeriod, dateFormatter)}
            />
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

      {(alerts || payrollDeadlineNotice) && (
        <Grid gap={16} gridTemplateColumns="1fr">
          {payrollDeadlineNotice && (
            <Alert status="info" label={payrollDeadlineNotice.label}>
              {payrollDeadlineNotice.content}
            </Alert>
          )}
          {alerts}
        </Grid>
      )}

      {isPending ? (
        <LoadingIndicator>
          <Flex flexDirection="column" alignItems="center" gap={4}>
            <LoadingSpinner size="lg" />
            <Heading as="h4">{t('loadingTitle')}</Heading>
            <Text>{t('loadingDescription')}</Text>
          </Flex>
        </LoadingIndicator>
      ) : (
        <>
          <div className={styles.payrollBlockerContainer}>
            {payrollBlockers.length > 0 && (
              <PayrollBlockerAlerts
                blockers={payrollBlockers}
                onMultipleViewClick={onViewBlockers}
              />
            )}
          </div>
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
            data={employeeCompensations}
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
                  {
                    label: t(item.excluded ? 'editMenu.unskip' : 'editMenu.skip'),
                    icon: item.excluded ? <PlusCircle aria-hidden /> : <XCircle aria-hidden />,
                    onClick: () => {
                      const employee = employeeMap.get(item.employeeUuid || '')
                      if (employee) {
                        onToggleExclude(item)
                      }
                    },
                  },
                ]}
                triggerLabel={t('editMenu.edit')}
              />
            )}
            pagination={pagination}
          />
        </>
      )}
    </Flex>
  )
}
