import { Trans, useTranslation } from 'react-i18next'
import type {
  EmployeeCompensations,
  PayrollShow,
} from '@gusto/embedded-api/models/components/payroll'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { useState, useRef } from 'react'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type {
  PayrollSubmissionBlockerType,
  UnblockOptions,
} from '@gusto/embedded-api/models/components/payrollsubmissionblockertype'
import type { PayrollFlowAlert } from '../PayrollFlow/PayrollFlowComponents'
import { calculateTotalPayroll } from '../helpers'
import { PayrollOverviewStatus } from './PayrollOverviewTypes'
import { FastAchSubmissionBlockerBanner, GenericBlocker } from './SubmissionBlockers'
import styles from './PayrollOverviewPresentation.module.scss'
import { DataView, Flex, Grid, PayrollLoading } from '@/components/Common'
import { useContainerBreakpoints } from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { firstLastName } from '@/helpers/formattedStrings'
import {
  compensationTypeLabels,
  FlsaStatus,
  PAYROLL_RESOLVABLE_SUBMISSION_BLOCKER_TYPES,
  PAYMENT_METHODS,
} from '@/shared/constants'
import DownloadIcon from '@/assets/icons/download-cloud.svg?react'

interface PayrollOverviewProps {
  payrollData: PayrollShow
  bankAccount?: CompanyBankAccount
  employeeDetails: Employee[]
  taxes: Record<string, { employee: number; employer: number }>
  status?: PayrollOverviewStatus
  isProcessed: boolean
  canCancel?: boolean
  alerts?: PayrollFlowAlert[]
  submissionBlockers?: PayrollSubmissionBlockerType[]
  selectedUnblockOptions?: Record<string, string>
  wireInConfirmationRequest?: React.ReactNode
  onEdit: () => void
  onSubmit: () => void
  onCancel: () => void
  onPayrollReceipt: () => void
  onPaystubDownload: (employeeId: string) => void
  onUnblockOptionChange?: (blockerType: string, value: string) => void
  withReimbursements?: boolean
}

const getPayrollOverviewTitle = (
  payPeriod: PayrollPayPeriodType | undefined,
  dateFormatter: ReturnType<typeof useDateFormatter>,
) => {
  if (payPeriod?.startDate && payPeriod.endDate) {
    return dateFormatter.formatPayPeriod(payPeriod.startDate, payPeriod.endDate)
  }
  return { startDate: '', endDate: '' }
}

export const PayrollOverviewPresentation = ({
  onEdit,
  onSubmit,
  onCancel,
  onPayrollReceipt,
  onPaystubDownload,
  employeeDetails,
  payrollData,
  bankAccount,
  taxes,
  status = PayrollOverviewStatus.Viewing,
  isProcessed,
  canCancel = false,
  alerts = [],
  submissionBlockers = [],
  selectedUnblockOptions = {},
  onUnblockOptionChange,
  wireInConfirmationRequest,
  withReimbursements = true,
}: PayrollOverviewProps) => {
  const { Alert, Button, ButtonIcon, Dialog, Heading, Text, Tabs } = useComponentContext()
  useI18n('Payroll.PayrollOverview')
  const dateFormatter = useDateFormatter()
  const { t } = useTranslation('Payroll.PayrollOverview')
  const formatCurrency = useNumberFormatter('currency')
  const [selectedTab, setSelectedTab] = useState('companyPays')
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({ ref: containerRef })
  const isDesktop = breakpoints.includes('small')

  const isLoading =
    status === PayrollOverviewStatus.Submitting || status === PayrollOverviewStatus.Cancelling

  const pageHeading = (
    <Heading as="h1">{isProcessed ? t('summaryTitle') : t('overviewTitle')}</Heading>
  )
  const pageSubtitle = (
    <Text>
      <Trans
        i18nKey="pageSubtitle"
        t={t}
        components={{ dateWrapper: <Text weight="bold" as="span" /> }}
        values={getPayrollOverviewTitle(payrollData.payPeriod, dateFormatter)}
      />
    </Text>
  )

  if (status === PayrollOverviewStatus.Cancelled) {
    return (
      <div ref={containerRef} className={styles.container}>
        <Flex flexDirection="column" alignItems="stretch">
          <Flex justifyContent="space-between" alignItems="flex-start" gap={16}>
            <Flex flexDirection="column" gap={4}>
              {pageHeading}
              {pageSubtitle}
            </Flex>
          </Flex>
          <Alert status="info" label={t('cancelledEmptyState')} />
        </Flex>
      </div>
    )
  }

  const totalPayroll = calculateTotalPayroll(payrollData)

  const expectedDebitDate =
    payrollData.payrollStatusMeta?.expectedDebitTime ?? payrollData.payrollDeadline

  const getCompanyTaxes = (employeeCompensation: EmployeeCompensations) => {
    return (
      employeeCompensation.taxes?.reduce(
        (acc, tax) => (tax.employer ? acc + tax.amount : acc),
        0,
      ) ?? 0
    )
  }
  const getCompanyBenefits = (employeeCompensation: EmployeeCompensations) => {
    return (
      employeeCompensation.benefits?.reduce(
        (acc, benefit) => (benefit.companyContribution ? acc + benefit.companyContribution : acc),
        0,
      ) ?? 0
    )
  }
  const getReimbursements = (employeeCompensation: EmployeeCompensations) => {
    return employeeCompensation.fixedCompensations?.length
      ? Number(
          employeeCompensation.fixedCompensations.find(
            c => c.name?.toLowerCase() === compensationTypeLabels.REIMBURSEMENT_NAME.toLowerCase(),
          )?.amount || 0,
        )
      : 0
  }

  const getCompanyCost = (employeeCompensation: EmployeeCompensations) => {
    return (
      employeeCompensation.grossPay! +
      getReimbursements(employeeCompensation) +
      getCompanyTaxes(employeeCompensation) +
      getCompanyBenefits(employeeCompensation)
    )
  }

  const employeeMap = new Map(employeeDetails.map(employee => [employee.uuid, employee]))

  const fastAchBlocker = submissionBlockers.find(
    blocker =>
      blocker.blockerType === 'fast_ach_threshold_exceeded' ||
      blocker.blockerType === 'needs_earned_access_for_fast_ach',
  )
  const selectedUnblockType = fastAchBlocker
    ? selectedUnblockOptions[fastAchBlocker.blockerType || '']
    : undefined
  const selectedUnblockOption = fastAchBlocker?.unblockOptions?.find(
    (option: UnblockOptions) => option.unblockType === selectedUnblockType,
  )

  const isWireFunds = selectedUnblockType === 'wire_in'
  const isFourDayDirectDeposit = selectedUnblockType === 'move_to_four_day'

  const getEmployeeHours = (
    employeeCompensations: EmployeeCompensations,
  ): Record<string, number> => {
    return (
      employeeCompensations.hourlyCompensations?.reduce(
        (acc, hourlyCompensation) => {
          if (typeof hourlyCompensation.name === 'undefined') {
            return acc
          }
          const name = hourlyCompensation.name.toLowerCase()
          const currentHours = acc[name] ?? 0
          acc[name] = currentHours + Number(hourlyCompensation.hours || 0)
          return acc
        },
        {} as Record<string, number>,
      ) || {}
    )
  }
  const getEmployeePtoHours = (employeeCompensations: EmployeeCompensations) => {
    return (
      employeeCompensations.paidTimeOff?.reduce((acc, paidTimeOff) => {
        return acc + Number(paidTimeOff.hours || 0)
      }, 0) ?? 0
    )
  }

  const checkPaymentsCount =
    payrollData.employeeCompensations?.reduce(
      (acc, comp) =>
        !comp.excluded && comp.paymentMethod === PAYMENT_METHODS.check ? acc + 1 : acc,
      0,
    ) ?? 0
  const companyPaysColumns: Array<{
    key: string
    title: string
    render: (item: EmployeeCompensations) => React.ReactNode
  }> = [
    {
      key: 'employeeName',
      title: t('tableHeaders.employees'),
      render: (employeeCompensations: EmployeeCompensations) =>
        firstLastName({
          first_name: employeeMap.get(employeeCompensations.employeeUuid!)?.firstName,
          last_name: employeeMap.get(employeeCompensations.employeeUuid!)?.lastName,
        }),
    },
    {
      key: 'grossPay',
      title: t('tableHeaders.grossPay'),
      render: (employeeCompensations: EmployeeCompensations) =>
        formatCurrency(employeeCompensations.grossPay!),
    },
    ...(withReimbursements
      ? [
          {
            key: 'reimbursements',
            title: t('tableHeaders.reimbursements'),
            render: (employeeCompensation: EmployeeCompensations) =>
              formatCurrency(getReimbursements(employeeCompensation)),
          },
        ]
      : []),
    {
      key: 'companyTaxes',
      title: t('tableHeaders.companyTaxes'),
      render: (employeeCompensation: EmployeeCompensations) =>
        formatCurrency(getCompanyTaxes(employeeCompensation)),
    },
    {
      key: 'companyBenefits',
      title: t('tableHeaders.companyBenefits'),
      render: (employeeCompensation: EmployeeCompensations) =>
        formatCurrency(getCompanyBenefits(employeeCompensation)),
    },
    {
      key: 'companyPays',
      title: t('tableHeaders.companyPays'),
      render: (employeeCompensation: EmployeeCompensations) =>
        formatCurrency(getCompanyCost(employeeCompensation)),
    },
  ]
  if (isProcessed && isDesktop) {
    companyPaysColumns.push({
      key: 'paystubs',
      title: t('tableHeaders.paystub'),
      render: (employeeCompensations: EmployeeCompensations) => (
        <Flex justifyContent="flex-end">
          <ButtonIcon
            aria-label={t('downloadPaystubLabel')}
            variant="tertiary"
            onClick={() => {
              if (employeeCompensations.employeeUuid) {
                onPaystubDownload(employeeCompensations.employeeUuid)
              }
            }}
          >
            <DownloadIcon />
          </ButtonIcon>
        </Flex>
      ),
    })
  }
  const tabs = [
    {
      id: 'companyPays',
      label: t('dataViews.companyPaysTab'),
      content: (
        <DataView
          label={t('dataViews.companyPaysTable')}
          columns={companyPaysColumns}
          data={payrollData.employeeCompensations!}
          itemMenu={
            isProcessed && !isDesktop
              ? (employeeCompensations: EmployeeCompensations) => (
                  <ButtonIcon
                    aria-label={t('downloadPaystubLabel')}
                    variant="tertiary"
                    onClick={() => {
                      if (employeeCompensations.employeeUuid) {
                        onPaystubDownload(employeeCompensations.employeeUuid)
                      }
                    }}
                  >
                    <DownloadIcon />
                  </ButtonIcon>
                )
              : undefined
          }
          footer={() => ({
            employeeName: (
              <>
                <Text>{t('tableHeaders.footerTotalsLabel')}</Text>
                <Text>{t('tableHeaders.footerTotalsDescription')}</Text>
              </>
            ),
            grossPay: <Text>{formatCurrency(Number(payrollData.totals?.grossPay ?? 0))}</Text>,
            ...(withReimbursements
              ? {
                  reimbursements: (
                    <Text>{formatCurrency(Number(payrollData.totals?.reimbursements ?? 0))}</Text>
                  ),
                }
              : {}),
            companyTaxes: (
              <Text>{formatCurrency(Number(payrollData.totals?.employerTaxes ?? 0))}</Text>
            ),
            companyBenefits: (
              <Text>{formatCurrency(Number(payrollData.totals?.benefits ?? 0))}</Text>
            ),
            companyPays: <Text>{formatCurrency(totalPayroll)}</Text>,
          })}
        />
      ),
    },
    {
      id: 'hoursWorked',
      label: t('dataViews.hoursWorkedTab'),
      content: (
        <DataView
          label={t('dataViews.hoursWorkedTable')}
          columns={[
            {
              title: t('tableHeaders.employees'),
              render: (employeeCompensations: EmployeeCompensations) =>
                firstLastName({
                  first_name: employeeMap.get(employeeCompensations.employeeUuid!)?.firstName,
                  last_name: employeeMap.get(employeeCompensations.employeeUuid!)?.lastName,
                }),
            },
            {
              title: t('tableHeaders.compensationType'),
              render: (employeeCompensations: EmployeeCompensations) =>
                employeeMap.get(employeeCompensations.employeeUuid!)?.jobs?.reduce((acc, job) => {
                  if (job.primary) {
                    const flsaStatus = job.compensations?.find(
                      comp => comp.uuid === job.currentCompensationUuid,
                    )?.flsaStatus

                    switch (flsaStatus) {
                      case FlsaStatus.EXEMPT:
                        return t('compensationTypeLabels.exempt')
                      case FlsaStatus.NONEXEMPT:
                        return t('compensationTypeLabels.nonexempt')
                      default:
                        return flsaStatus ?? ''
                    }
                  }
                  return acc
                }, ''),
            },
            {
              title: t('tableHeaders.regular'),
              render: (employeeCompensations: EmployeeCompensations) =>
                getEmployeeHours(employeeCompensations)[
                  compensationTypeLabels.REGULAR_HOURS_NAME
                ] || 0,
            },
            {
              title: t('tableHeaders.overtime'),
              render: (employeeCompensations: EmployeeCompensations) =>
                getEmployeeHours(employeeCompensations)[compensationTypeLabels.OVERTIME_NAME] || 0,
            },
            {
              title: t('tableHeaders.doubleOT'),
              render: (employeeCompensations: EmployeeCompensations) =>
                getEmployeeHours(employeeCompensations)[
                  compensationTypeLabels.DOUBLE_OVERTIME_NAME
                ] || 0,
            },
            {
              title: t('tableHeaders.timeOff'),
              render: (employeeCompensations: EmployeeCompensations) =>
                getEmployeePtoHours(employeeCompensations),
            },
            {
              title: t('tableHeaders.totalHours'),
              render: (employeeCompensations: EmployeeCompensations) =>
                Object.values(getEmployeeHours(employeeCompensations)).reduce(
                  (acc, hours) => acc + hours,
                  0,
                ) + getEmployeePtoHours(employeeCompensations),
            },
          ]}
          data={payrollData.employeeCompensations!}
        />
      ),
    },
    {
      id: 'employeeTakeHome',
      label: t('dataViews.employeeTakeHomeTab'),
      content: (
        <DataView
          label={t('dataViews.employeeTakeHomeTable')}
          columns={[
            {
              title: t('tableHeaders.employees'),
              render: (employeeCompensations: EmployeeCompensations) =>
                firstLastName({
                  first_name: employeeMap.get(employeeCompensations.employeeUuid!)?.firstName,
                  last_name: employeeMap.get(employeeCompensations.employeeUuid!)?.lastName,
                }),
            },
            {
              title: t('tableHeaders.paymentType'),
              render: (employeeCompensations: EmployeeCompensations) =>
                employeeCompensations.paymentMethod ?? '',
            },
            {
              title: t('tableHeaders.grossPay'),
              render: (employeeCompensations: EmployeeCompensations) =>
                formatCurrency(employeeCompensations.grossPay ?? 0),
            },
            {
              title: t('tableHeaders.deductions'),
              render: (employeeCompensations: EmployeeCompensations) =>
                formatCurrency(
                  employeeCompensations.deductions?.reduce(
                    (acc, deduction) => acc + deduction.amount!,
                    0,
                  ) ?? 0,
                ),
            },
            ...(withReimbursements
              ? [
                  {
                    title: t('tableHeaders.reimbursements'),
                    render: (employeeCompensations: EmployeeCompensations) =>
                      formatCurrency(getReimbursements(employeeCompensations)),
                  },
                ]
              : []),
            {
              title: t('tableHeaders.employeeTaxes'),
              render: (employeeCompensations: EmployeeCompensations) =>
                formatCurrency(
                  employeeCompensations.taxes?.reduce(
                    (acc, tax) => (tax.employer ? acc : acc + tax.amount),
                    0,
                  ) ?? 0,
                ),
            },
            {
              title: t('tableHeaders.employeeBenefits'),
              render: (employeeCompensations: EmployeeCompensations) =>
                formatCurrency(
                  employeeCompensations.benefits?.reduce(
                    (acc, benefit) => acc + (benefit.employeeDeduction ?? 0),
                    0,
                  ) ?? 0,
                ),
            },
            {
              title: t('tableHeaders.payment'),
              render: (employeeCompensations: EmployeeCompensations) =>
                formatCurrency(employeeCompensations.netPay ?? 0),
            },
          ]}
          data={payrollData.employeeCompensations!}
        />
      ),
    },
    {
      id: 'taxes',
      label: t('dataViews.taxesTab'),
      content: (
        <Flex flexDirection="column" gap={32}>
          <DataView
            label={t('dataViews.taxesTable')}
            columns={[
              {
                key: 'taxDescription',
                title: t('tableHeaders.taxDescription'),
                render: taxKey => taxKey,
              },
              {
                key: 'byYourEmployees',
                title: t('tableHeaders.byYourEmployees'),
                render: taxKey => formatCurrency(taxes[taxKey]?.employee ?? 0),
              },
              {
                key: 'byYourCompany',
                title: t('tableHeaders.byYourCompany'),
                render: taxKey => formatCurrency(taxes[taxKey]?.employer ?? 0),
              },
            ]}
            footer={() => ({
              taxDescription: <Text>{t('totalsLabel')}</Text>,
              byYourEmployees: (
                <Text>{formatCurrency(Number(payrollData.totals?.employeeTaxes ?? 0))}</Text>
              ),
              byYourCompany: (
                <Text>{formatCurrency(Number(payrollData.totals?.employerTaxes ?? 0))}</Text>
              ),
            })}
            data={Object.keys(taxes)}
          />

          <DataView
            label={t('dataViews.debitedTable')}
            columns={[
              {
                title: t('tableHeaders.debitedByGusto'),
                render: ({ label }) => label,
              },
              {
                title: t('tableHeaders.taxesTotal'),
                render: ({ value }) => formatCurrency(Number(value)),
              },
            ]}
            data={[
              { label: t('directDepositLabel'), value: payrollData.totals?.netPayDebit || '0' },
              ...(withReimbursements
                ? [
                    {
                      label: t('reimbursementLabel'),
                      value: payrollData.totals?.reimbursementDebit || '0',
                    },
                  ]
                : []),
              {
                label: t('garnishmentsLabel'),
                value: payrollData.totals?.childSupportDebit || '0',
              },
              { label: t('taxesLabel'), value: payrollData.totals?.taxDebit || '0' },
            ]}
          />
        </Flex>
      ),
    },
  ]

  const actions = isProcessed ? (
    <>
      <Button onClick={onPayrollReceipt} variant="secondary" isDisabled={isLoading}>
        {t('payrollReceiptCta')}
      </Button>
      {canCancel && (
        <Button
          onClick={() => {
            setIsCancelDialogOpen(true)
          }}
          variant="error"
          isDisabled={isLoading}
        >
          {t('cancelCta')}
        </Button>
      )}
    </>
  ) : (
    <>
      <Button onClick={onEdit} variant="secondary" isDisabled={isLoading}>
        {t('editCta')}
      </Button>
      <Button
        onClick={onSubmit}
        isDisabled={
          isLoading ||
          (submissionBlockers.length > 0 &&
            (submissionBlockers.some(
              blocker =>
                !PAYROLL_RESOLVABLE_SUBMISSION_BLOCKER_TYPES.includes(blocker.blockerType || ''),
            ) ||
              submissionBlockers.some(
                blocker => !selectedUnblockOptions[blocker.blockerType || ''],
              )))
        }
      >
        {t('submitCta')}
      </Button>
    </>
  )

  return (
    <div ref={containerRef} className={styles.container}>
      <Flex flexDirection="column" alignItems="stretch">
        <Flex justifyContent="space-between" alignItems="flex-start" gap={16}>
          <Flex flexDirection="column" gap={4}>
            {pageHeading}
            {pageSubtitle}
          </Flex>
          {isDesktop && (
            <Flex gap={8} justifyContent="flex-end">
              {actions}
            </Flex>
          )}
        </Flex>
        {!isDesktop && (
          <Grid gridTemplateColumns="1fr" gap={8}>
            {actions}
          </Grid>
        )}
        {status === PayrollOverviewStatus.Cancelling ? (
          <PayrollLoading title={t('cancellingTitle')} />
        ) : status === PayrollOverviewStatus.Submitting ? (
          <PayrollLoading title={t('loadingTitle')} description={t('loadingDescription')} />
        ) : (
          <>
            {wireInConfirmationRequest}
            {alerts.length > 0 && (
              <Flex flexDirection={'column'} gap={16}>
                {alerts.map((alert, index) => (
                  <Alert
                    key={`${alert.type}-${alert.title}`}
                    label={alert.title}
                    status={alert.type}
                    onDismiss={alert.onDismiss}
                  >
                    {alert.content ?? null}
                  </Alert>
                ))}
              </Flex>
            )}
            {submissionBlockers.length > 0 &&
              onUnblockOptionChange &&
              submissionBlockers.map(blocker => {
                const blockerType = blocker.blockerType || ''

                if (PAYROLL_RESOLVABLE_SUBMISSION_BLOCKER_TYPES.includes(blockerType)) {
                  return (
                    <FastAchSubmissionBlockerBanner
                      key={blockerType}
                      blocker={blocker}
                      selectedValue={selectedUnblockOptions[blockerType]}
                      onUnblockOptionChange={onUnblockOptionChange}
                    />
                  )
                }

                return <GenericBlocker key={blockerType} blocker={blocker} />
              })}
            <Heading as="h3">
              {isWireFunds
                ? t('payrollSummaryTitleWire')
                : isFourDayDirectDeposit
                  ? t('payrollSummaryTitleFourDay')
                  : t('payrollSummaryTitle')}
            </Heading>

            {isWireFunds ? (
              <DataView
                label={t('payrollSummaryLabel')}
                columns={[
                  {
                    title: t('tableHeaders.totalPayroll'),
                    render: () => <Text>{formatCurrency(totalPayroll)}</Text>,
                  },
                  {
                    title: t('tableHeaders.wireAmount'),
                    render: () => {
                      const metadata = selectedUnblockOption?.metadata as
                        | { wire_in_amount?: string }
                        | undefined
                      const wireAmount = metadata?.wire_in_amount
                      return <Text>{wireAmount ? formatCurrency(Number(wireAmount)) : '-'}</Text>
                    },
                  },
                  {
                    title: t('tableHeaders.wireTransferDeadline'),
                    render: () => {
                      const metadata = selectedUnblockOption?.metadata as
                        | { wire_in_deadline?: string }
                        | undefined
                      const wireDeadline = metadata?.wire_in_deadline
                      const formattedTime = dateFormatter.formatWithTime(wireDeadline)
                      const formattedDate = dateFormatter.formatShortWithYear(wireDeadline)
                      return (
                        <Text>
                          {wireDeadline ? `${formattedTime.time} on ${formattedDate}` : '-'}
                        </Text>
                      )
                    },
                  },
                  {
                    title: t('tableHeaders.employeePayDate'),
                    render: () => (
                      <Text>
                        {selectedUnblockOption?.checkDate
                          ? dateFormatter.formatShortWithYear(selectedUnblockOption.checkDate)
                          : '-'}
                      </Text>
                    ),
                  },
                ]}
                data={[{}]}
              />
            ) : isFourDayDirectDeposit ? (
              <DataView
                label={t('payrollSummaryLabel')}
                columns={[
                  {
                    title: t('tableHeaders.totalPayroll'),
                    render: () => <Text>{formatCurrency(totalPayroll)}</Text>,
                  },
                  {
                    title: t('tableHeaders.debitAmount'),
                    render: () => {
                      const debitAmount = payrollData.totals?.companyDebit
                      return <Text>{formatCurrency(Number(debitAmount ?? 0))}</Text>
                    },
                  },
                  {
                    title: t('tableHeaders.debitAccount'),
                    render: () => <Text>{bankAccount?.hiddenAccountNumber ?? ''}</Text>,
                  },
                  {
                    title: t('tableHeaders.debitDate'),
                    render: () => {
                      const metadata = selectedUnblockOption?.metadata as
                        | { debit_date?: string }
                        | undefined
                      const debitDate = metadata?.debit_date
                      return <Text>{dateFormatter.formatShortWithYear(debitDate)}</Text>
                    },
                  },
                  {
                    title: t('tableHeaders.employeePayDate'),
                    render: () => (
                      <Text>
                        {selectedUnblockOption?.checkDate
                          ? dateFormatter.formatShortWithYear(selectedUnblockOption.checkDate)
                          : '-'}
                      </Text>
                    ),
                  },
                ]}
                data={[{}]}
              />
            ) : (
              <DataView
                label={t('payrollSummaryLabel')}
                columns={[
                  {
                    title: t('tableHeaders.totalPayroll'),
                    render: () => <Text>{formatCurrency(totalPayroll)}</Text>,
                  },
                  {
                    title: t('tableHeaders.debitAmount'),
                    render: () => (
                      <Text>{formatCurrency(Number(payrollData.totals?.companyDebit ?? 0))}</Text>
                    ),
                  },
                  {
                    title: t('tableHeaders.debitAccount'),
                    render: () => <Text>{bankAccount?.hiddenAccountNumber ?? ''}</Text>,
                  },
                  {
                    title: t('tableHeaders.debitDate'),
                    render: () => (
                      <Text>{dateFormatter.formatShortWithYear(expectedDebitDate)}</Text>
                    ),
                  },
                  {
                    title: t('tableHeaders.employeePayDate'),
                    render: () => (
                      <Text>{dateFormatter.formatShortWithYear(payrollData.checkDate)}</Text>
                    ),
                  },
                ]}
                data={[{}]}
              />
            )}
            {checkPaymentsCount > 0 && (
              <Alert
                status="warning"
                label={t('alerts.checkPaymentWarning', { count: checkPaymentsCount })}
              >
                <Text>{t('alerts.checkPaymentWarningDescription')}</Text>
              </Alert>
            )}
            <Tabs
              onSelectionChange={setSelectedTab}
              selectedId={selectedTab}
              aria-label={t('dataViews.label')}
              tabs={tabs}
            />
            {isCancelDialogOpen && (
              <Dialog
                isOpen={isCancelDialogOpen}
                onClose={() => {
                  setIsCancelDialogOpen(false)
                }}
                onPrimaryActionClick={onCancel}
                shouldCloseOnBackdropClick={true}
                primaryActionLabel={t('confirmCancelCta')}
                isDestructive={true}
                closeActionLabel={t('declineCancelCta')}
                title={t('cancelDialogTitle', {
                  startDate: dateFormatter.formatLong(payrollData.payPeriod?.startDate),
                  endDate: dateFormatter.formatLongWithYear(payrollData.payPeriod?.endDate),
                })}
              >
                <Flex gap={14} flexDirection="column">
                  <Text>{t('cancelDialogDescription')}</Text>
                  <Text>
                    {t('cancelDialogDescriptionDeadline', {
                      deadline: dateFormatter.formatWithTime(payrollData.payrollDeadline).time,
                    })}
                  </Text>
                </Flex>
              </Dialog>
            )}
          </>
        )}
      </Flex>
    </div>
  )
}
