import { useRef, useState, type ReactNode } from 'react'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { Trans, useTranslation } from 'react-i18next'
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
import { PayrollCategory } from '../payrollTypes'
import { PayrollBlockerAlerts } from '../PayrollBlocker/components/PayrollBlockerAlerts'
import { GrossUpModal } from '../GrossUpModal'
import { PayrollOverview } from '../PayrollOverview/PayrollOverview'
import type { PayrollFlowAlert } from '../PayrollFlow/PayrollFlowComponents'
import { isGrossUpEligible } from './grossUpHelpers'
import { usePayrollConfiguration } from './shared/usePayrollConfiguration'
import { usePayrollGrossUp } from './shared/usePayrollGrossUp'
import styles from './PayrollConfiguration.module.scss'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent, BaseLayout } from '@/components/Base/Base'
import { componentEvents, type EventType } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { DataView, Flex, FlexItem, Grid, PayrollLoading } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import XCircle from '@/assets/icons/x-circle.svg?react'
import PlusCircle from '@/assets/icons/plus-circle.svg?react'
import CoinsHandSvg from '@/assets/icons/coins-hand.svg?react'
import { firstLastName, formatNumberAsCurrency } from '@/helpers/formattedStrings'
import useContainerBreakpoints from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'

/**
 * Props for {@link PayrollConfiguration}.
 *
 * @public
 */
export interface PayrollConfigurationProps extends BaseComponentInterface<'Payroll.PayrollConfiguration'> {
  /** The associated company identifier. */
  companyId: string
  /** The associated payroll identifier. */
  payrollId: string
  /** Optional alert components to render above the configuration content. */
  alerts?: ReactNode
  /** Whether to show the reimbursements column in the compensation table. Defaults to `true`. */
  withReimbursements?: boolean
}

/**
 * Handles the configuration phase of payroll processing, allowing users to review and modify employee compensation before calculating the payroll.
 *
 * @remarks
 * Composes {@link usePayrollConfiguration} (data, status, pagination, and the calculate/skip actions)
 * and {@link usePayrollGrossUp} (the net-earnings sub-flow) and renders the review table.
 *
 * If the payroll turns out to already be processed (e.g. another actor submitted it while this
 * screen was open), this component emits `runPayroll/alreadyProcessed` and then renders
 * {@link PayrollOverview} in its place — the read-only breakdown with the gated "Cancel payroll"
 * action — instead of the configuration table. Events from that delegated view (e.g.
 * `runPayroll/cancelled`) are emitted through this component's own `onEvent`.
 *
 * Emits the following events:
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `runPayroll/employee/edit` | An employee row is selected for editing | `{ employeeId, firstName, lastName }` |
 * | `runPayroll/employee/skip` | An employee is skipped or unskipped for this payroll | `{ employeeId }` |
 * | `runPayroll/employee/saved` | Employee compensation changes are persisted | `{ payrollPrepared }` |
 * | `runPayroll/calculated` | Payroll calculation completes successfully | `{ payrollId, alert, payPeriod }` |
 * | `runPayroll/alreadyProcessed` | The payroll turns out to already be processed while configuring it | `{ payrollId, alert, payPeriod }` |
 * | `runPayroll/processingFailed` | Payroll calculation fails or times out | — |
 * | `runPayroll/blockers/viewAll` | The "view all blockers" affordance is selected | — |
 * | `runPayroll/grossUp/selected` | The set-net-earnings menu item is selected for an employee | `{ employeeUuid }` |
 * | `runPayroll/grossUp/calculated` | A gross-up amount is calculated from a target net pay | `{ grossUp, netPay, employeeUuid }` |
 *
 * @param props - See {@link PayrollConfigurationProps}.
 * @returns The payroll configuration screen.
 * @public
 */
export function PayrollConfiguration(props: PayrollConfigurationProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({
  onEvent,
  companyId,
  payrollId,
  dictionary,
  alerts,
  withReimbursements = true,
}: PayrollConfigurationProps) => {
  useComponentDictionary('Payroll.PayrollConfiguration', dictionary)
  useI18n('Payroll.PayrollConfiguration')
  const { t } = useTranslation('Payroll.PayrollConfiguration')
  const dateFormatter = useDateFormatter()
  const { Button, Heading, Text, Badge, Alert } = useComponentContext()
  const formatEmployeePayRate = useFormatEmployeePayRate()
  const isRegularRateOfPayEnabled = useUnstableFeature('payrollRegularRateOfPay')
  const containerRef = useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({ ref: containerRef })
  const isDesktop = breakpoints.includes('small')

  const config = usePayrollConfiguration({ companyId, payrollId, onEvent })

  const [grossUpEmployeeUuid, setGrossUpEmployeeUuid] = useState<string | null>(null)
  const [isGrossUpModalOpen, setIsGrossUpModalOpen] = useState(false)
  const grossUp = usePayrollGrossUp({
    companyId,
    payrollId,
    employeeId: grossUpEmployeeUuid ?? '',
  })

  const alreadyProcessedAlert: PayrollFlowAlert = {
    type: 'error',
    title: t('alerts.alreadyProcessed'),
    alertKey: 'alreadyProcessed',
  }

  if (config.isLoading) {
    return <BaseLayout isLoading error={config.errorHandling.errors} />
  }

  const { data, status, pagination, actions } = config

  if (status.isProcessed) {
    const onAlreadyProcessedOverviewEvent = (type: EventType, eventData?: unknown) => {
      if (type === componentEvents.RUN_PAYROLL_CANCELLED) {
        // Cancelling un-processes the payroll, making it editable again — re-run prepare so
        // this component drops back into the configuration table for the same payrollId.
        void actions.refetch()
      }
      onEvent(type, eventData)
    }

    return (
      <PayrollOverview
        companyId={companyId}
        payrollId={payrollId}
        onEvent={onAlreadyProcessedOverviewEvent}
        withReimbursements={withReimbursements}
        alerts={[alreadyProcessedAlert]}
      />
    )
  }

  const {
    employeeCompensations,
    employeeDetails,
    payPeriod,
    paySchedule,
    payrollCategory,
    notice,
  } = data
  const isPending = status.isPreparing || status.isUpdating || status.isCalculating
  const isCalculating = status.isCalculating
  const isCalculateDisabled = data.blockers.length > 0
  const grossUpEnabled = isGrossUpEligible(payrollCategory)

  const employeeMap = new Map(employeeDetails.map(employee => [employee.uuid, employee]))

  const getEmployeeName = (employeeUuid: string) => {
    const employee = employeeMap.get(employeeUuid)
    const name = employee
      ? firstLastName({ first_name: employee.firstName, last_name: employee.lastName })
      : ''
    return name || t('unknownEmployeeFallback')
  }

  const onEdit = (employee: Employee) => {
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT, {
      employeeId: employee.uuid,
      firstName: employee.firstName,
      lastName: employee.lastName,
    })
  }

  const onGrossUpSelect = (employeeUuid: string) => {
    setGrossUpEmployeeUuid(employeeUuid)
    setIsGrossUpModalOpen(true)
    onEvent(componentEvents.RUN_PAYROLL_GROSS_UP_SELECTED, { employeeUuid })
  }

  const onCalculateGrossUp = async (netPay: number): Promise<string | null> => {
    if (grossUp.isLoading) return null
    const grossAmount = await grossUp.actions.calculateGrossUp(netPay)
    if (grossAmount && grossUpEmployeeUuid) {
      onEvent(componentEvents.RUN_PAYROLL_GROSS_UP_CALCULATED, {
        grossUp: grossAmount,
        netPay,
        employeeUuid: grossUpEmployeeUuid,
      })
    }
    return grossAmount
  }

  const onGrossUpApply = async (grossAmount: string) => {
    if (grossUp.isLoading) return
    const result = await grossUp.actions.applyGrossUp(grossAmount)
    if (result) {
      onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED, { payrollPrepared: result.data })
      setGrossUpEmployeeUuid(null)
      setIsGrossUpModalOpen(false)
    }
  }

  const payrollAlert:
    { label: string; content?: ReactNode; variant: 'info' | 'warning' } | undefined = (() => {
    if (!notice) return undefined
    if (notice.type === 'latePayroll') {
      return {
        label: t('alerts.payrollLate', {
          initialCheckDate: dateFormatter.formatShortWithWeekday(notice.initialCheckDate),
        }),
        content: t('alerts.payrollLateText', {
          ...dateFormatter.formatWithTime(notice.expectedDebitTime),
          newCheckDate: dateFormatter.formatShortWithWeekday(notice.expectedCheckDate),
        }),
        variant: 'warning',
      }
    }
    return {
      label: t('alerts.directDepositDeadline', {
        payDate: dateFormatter.formatShortWithWeekday(notice.checkDate),
        ...dateFormatter.formatWithTime(notice.payrollDeadline),
      }),
      content: t('alerts.directDepositDeadlineText'),
      variant: 'info',
    }
  })()

  const payPeriodTitle =
    payPeriod?.startDate && payPeriod.endDate
      ? dateFormatter.formatPayPeriod(payPeriod.startDate, payPeriod.endDate)
      : { startDate: '', endDate: '' }

  return (
    <BaseLayout error={config.errorHandling.errors}>
      <div ref={containerRef} className={styles.container}>
        <Flex flexDirection="column" gap={32}>
          <Flex
            flexDirection={isDesktop ? 'row' : 'column'}
            justifyContent={isDesktop ? 'space-between' : 'normal'}
            alignItems={isDesktop ? 'center' : 'stretch'}
            gap={isDesktop ? 0 : 16}
          >
            <FlexItem>
              <Heading as="h1">{t('pageTitle')}</Heading>
              {payPeriod && (
                <Text variant="supporting">
                  <Trans
                    i18nKey={
                      payrollCategory === PayrollCategory.Dismissal
                        ? 'descriptionDismissal'
                        : 'description'
                    }
                    t={t}
                    components={{ dateWrapper: <Text weight="bold" as="span" /> }}
                    values={{ ...payPeriodTitle, payrollType: payrollCategory }}
                  />
                </Text>
              )}
            </FlexItem>
            <FlexItem>
              <Button
                title={t('calculatePayrollTitle')}
                onClick={() => void actions.calculatePayroll()}
                isDisabled={isCalculateDisabled || isPending || isCalculating}
              >
                {isCalculating ? t('calculatingPayroll') : t('calculatePayroll')}
              </Button>
            </FlexItem>
          </Flex>

          {(alerts || payrollAlert) && (
            <Grid gap={16} gridTemplateColumns="1fr">
              {payrollAlert && (
                <Alert label={payrollAlert.label} status={payrollAlert.variant}>
                  {payrollAlert.content}
                </Alert>
              )}
              {alerts}
            </Grid>
          )}

          {isPending ? (
            <PayrollLoading
              title={isCalculating ? t('calculatingTitle') : t('loadingTitle')}
              description={isCalculating ? t('calculatingDescription') : t('loadingDescription')}
            />
          ) : (
            <>
              {data.blockers.length > 0 && (
                <PayrollBlockerAlerts
                  blockers={data.blockers}
                  onViewBlockersClick={() => {
                    onEvent(componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL)
                  }}
                />
              )}
              <Flex flexDirection="column" gap={20}>
                <FlexItem>
                  <Heading as="h2" styledAs="h3">
                    {t('hoursAndEarningsTitle')}
                  </Heading>
                  <Text variant="supporting">{t('hoursAndEarningsDescription')}</Text>
                </FlexItem>

                <DataView
                  label={t('employeeCompensationsTitle')}
                  columns={[
                    {
                      title: t('tableColumns.employees'),
                      render: (item: PayrollEmployeeCompensationsType) => {
                        const employee = employeeMap.get(item.employeeUuid || '')
                        const payRateDisplay = formatEmployeePayRate(employee)
                        return (
                          <Flex flexDirection="column" gap={0}>
                            {getEmployeeName(item.employeeUuid || '')}
                            {payRateDisplay && (
                              <Text size="xs" variant="supporting">
                                {payRateDisplay}
                              </Text>
                            )}
                            {item.excluded && <Badge status="warning">{t('skippedBadge')}</Badge>}
                          </Flex>
                        )
                      },
                    },
                    {
                      title: t('tableColumns.hours'),
                      justify: 'end',
                      render: (item: PayrollEmployeeCompensationsType) => {
                        const hours = getRegularHours(item)
                        const overtimeHours = getOvertimeHours(item)
                        return formatHoursDisplay(hours + overtimeHours)
                      },
                    },
                    {
                      title: t('tableColumns.timeOff'),
                      justify: 'end',
                      render: (item: PayrollEmployeeCompensationsType) => {
                        const ptoHours = getTotalPtoHours(item)
                        return formatHoursDisplay(ptoHours)
                      },
                    },
                    {
                      title: t('tableColumns.additionalEarnings'),
                      justify: 'end',
                      render: (item: PayrollEmployeeCompensationsType) => {
                        const earnings = getAdditionalEarnings(item)
                        return formatNumberAsCurrency(earnings)
                      },
                    },
                    ...(withReimbursements
                      ? [
                          {
                            title: t('tableColumns.reimbursements'),
                            justify: 'end' as const,
                            render: (item: PayrollEmployeeCompensationsType) => {
                              const reimbursements = getReimbursements(item)
                              return formatNumberAsCurrency(reimbursements)
                            },
                          },
                        ]
                      : []),
                    {
                      title: t('tableColumns.totalPay'),
                      justify: 'end',
                      render: (item: PayrollEmployeeCompensationsType) => {
                        if (isRegularRateOfPayEnabled) {
                          return formatNumberAsCurrency(Number(item.grossPay ?? 0))
                        }
                        const employee = employeeMap.get(item.employeeUuid || '')
                        const calculatedGrossPay = employee
                          ? calculateGrossPay(
                              item,
                              employee,
                              payPeriod?.startDate,
                              paySchedule,
                              payrollCategory,
                            )
                          : 0
                        return formatNumberAsCurrency(calculatedGrossPay)
                      },
                    },
                  ]}
                  data={employeeCompensations}
                  itemMenu={(item: PayrollEmployeeCompensationsType) => (
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
                          icon: item.excluded ? (
                            <PlusCircle aria-hidden />
                          ) : (
                            <XCircle aria-hidden />
                          ),
                          onClick: () => {
                            const employee = employeeMap.get(item.employeeUuid || '')
                            if (employee) {
                              void actions.toggleExclude(item)
                            }
                          },
                        },
                        ...(grossUpEnabled
                          ? [
                              {
                                label: t('editMenu.setNetEarnings'),
                                icon: <CoinsHandSvg aria-hidden />,
                                onClick: () => {
                                  if (item.employeeUuid) {
                                    onGrossUpSelect(item.employeeUuid)
                                  }
                                },
                              },
                            ]
                          : []),
                      ]}
                      triggerLabel={t('editMenu.edit')}
                    />
                  )}
                  pagination={pagination}
                />
              </Flex>
            </>
          )}
        </Flex>
      </div>
      {grossUpEnabled && (
        <GrossUpModal
          isOpen={isGrossUpModalOpen}
          onCalculateGrossUp={onCalculateGrossUp}
          onApply={onGrossUpApply}
          onCancel={() => {
            setIsGrossUpModalOpen(false)
          }}
        />
      )}
    </BaseLayout>
  )
}
