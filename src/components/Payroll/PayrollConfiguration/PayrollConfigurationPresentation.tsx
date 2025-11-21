import type { ReactNode } from 'react'
import { useMemo, useRef } from 'react'
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
import { DataView, Flex, FlexItem, Grid, PayrollLoading } from '@/components/Common'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import XCircle from '@/assets/icons/x-circle.svg?react'
import PlusCircle from '@/assets/icons/plus-circle.svg?react'
import { firstLastName, formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import useContainerBreakpoints from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'

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
  withReimbursements?: boolean
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
  withReimbursements = true,
}: PayrollConfigurationPresentationProps) => {
  const { Button, Heading, Text, Badge, Alert } = useComponentContext()
  useI18n('Payroll.PayrollConfiguration')
  const { t } = useTranslation('Payroll.PayrollConfiguration')
  const dateFormatter = useDateFormatter()
  const formatEmployeePayRate = useFormatEmployeePayRate()
  const containerRef = useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({ ref: containerRef })
  const isDesktop = breakpoints.includes('small')

  const employeeMap = useMemo(() => {
    return new Map(employeeDetails.map(employee => [employee.uuid, employee]))
  }, [employeeDetails])

  const getEmployeeName = (employeeUuid?: string | null) => {
    if (!employeeUuid) return ''
    const employee = employeeMap.get(employeeUuid)
    if (!employee) {
      return ''
    }
    return firstLastName({ first_name: employee.firstName, last_name: employee.lastName })
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <Flex flexDirection="column" gap={16}>
        <Flex
          flexDirection={isDesktop ? 'row' : 'column'}
          justifyContent={isDesktop ? 'space-between' : 'normal'}
          alignItems={isDesktop ? 'center' : 'stretch'}
          gap={isDesktop ? 0 : 16}
        >
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
          <FlexItem flexGrow={isDesktop ? 0 : 0}>
            {isDesktop ? (
              <Button
                title={t('calculatePayrollTitle')}
                onClick={onCalculatePayroll}
                isDisabled={isPending}
              >
                {t('calculatePayroll')}
              </Button>
            ) : (
              <Flex flexDirection="column" justifyContent="normal" alignItems="stretch" gap={12}>
                <Button
                  title={t('calculatePayrollTitle')}
                  onClick={onCalculatePayroll}
                  isDisabled={isPending}
                >
                  {t('calculatePayroll')}
                </Button>
              </Flex>
            )}
          </FlexItem>
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
          <PayrollLoading title={t('loadingTitle')} description={t('loadingDescription')} />
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
                  title: t('tableColumns.employees'),
                  render: (item: EmployeeCompensations) => {
                    return getEmployeeName(item.employeeUuid)
                  },
                  secondaryRender: (item: EmployeeCompensations) => {
                    const employee = item.employeeUuid
                      ? employeeMap.get(item.employeeUuid)
                      : undefined
                    const payRateDisplay = formatEmployeePayRate(employee)
                    if (!payRateDisplay && !item.excluded) {
                      return undefined
                    }
                    return (
                      <>
                        {payRateDisplay}
                        {item.excluded && (
                          <div className={styles.excludedBadge}>
                            <Badge status="warning">{t('skippedBadge')}</Badge>
                          </div>
                        )}
                      </>
                    )
                  },
                },
                {
                  title: t('tableColumns.hours'),
                  render: (item: EmployeeCompensations) => {
                    const hours = getRegularHours(item)
                    const overtimeHours = getOvertimeHours(item)
                    return formatHoursDisplay(hours + overtimeHours)
                  },
                },
                {
                  title: t('tableColumns.timeOff'),
                  render: (item: EmployeeCompensations) => {
                    const ptoHours = getTotalPtoHours(item)
                    return formatHoursDisplay(ptoHours)
                  },
                },
                {
                  title: t('tableColumns.additionalEarnings'),
                  render: (item: EmployeeCompensations) => {
                    const earnings = getAdditionalEarnings(item)
                    return formatNumberAsCurrency(earnings)
                  },
                },
                ...(withReimbursements
                  ? [
                      {
                        title: t('tableColumns.reimbursements'),
                        render: (item: EmployeeCompensations) => {
                          const reimbursements = getReimbursements(item)
                          return formatNumberAsCurrency(reimbursements)
                        },
                      },
                    ]
                  : []),
                {
                  title: t('tableColumns.totalPay'),
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
                    return formatNumberAsCurrency(calculatedGrossPay)
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
    </div>
  )
}
