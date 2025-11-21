import { Trans, useTranslation } from 'react-i18next'
import type {
  EmployeeCompensations,
  PayrollShow,
} from '@gusto/embedded-api/models/components/payrollshow'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { useMemo, useState, useRef } from 'react'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollSubmissionBlockersType } from '@gusto/embedded-api/models/components/payrollsubmissionblockerstype'
import type { PayrollFlowAlert } from '../PayrollFlow/PayrollFlowComponents'
import { calculateTotalPayroll } from '../helpers'
import { FastAchThresholdExceeded, GenericBlocker } from './SubmissionBlockers'
import styles from './PayrollOverviewPresentation.module.scss'
import { DataView, Flex, FlexItem } from '@/components/Common'
import type { DataViewColumn } from '@/components/Common/DataView/useDataView'
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
import { useLoadingIndicator } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'

interface PayrollOverviewProps {
  payrollData: PayrollShow
  bankAccount?: CompanyBankAccount
  employeeDetails: Employee[]
  taxes: Record<string, { employee: number; employer: number }>
  isSubmitting?: boolean
  isProcessed: boolean
  alerts?: PayrollFlowAlert[]
  submissionBlockers?: PayrollSubmissionBlockersType[]
  selectedUnblockOptions?: Record<string, string>
  wireInConfirmationRequest?: React.ReactNode
  onEdit: () => void
  onSubmit: () => void
  onCancel: () => void
  onPayrollReceipt: () => void
  onPaystubDownload: (employeeId: string) => void
  onUnblockOptionChange?: (blockerType: string, value: string) => void
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
  isSubmitting = false,
  isProcessed,
  alerts = [],
  submissionBlockers = [],
  selectedUnblockOptions = {},
  onUnblockOptionChange,
  wireInConfirmationRequest,
}: PayrollOverviewProps) => {
  const { Alert, Button, ButtonIcon, Dialog, Heading, Text, Tabs, LoadingSpinner } =
    useComponentContext()
  useI18n('Payroll.PayrollOverview')
  const dateFormatter = useDateFormatter()
  const { t } = useTranslation('Payroll.PayrollOverview')
  const formatCurrency = useNumberFormatter('currency')
  const [selectedTab, setSelectedTab] = useState('companyPays')
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const { LoadingIndicator } = useLoadingIndicator()
  const containerRef = useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({ ref: containerRef })
  const isDesktop = breakpoints.includes('small')

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

  const employeeMap = useMemo(() => {
    return new Map(employeeDetails.map(employee => [employee.uuid, employee]))
  }, [employeeDetails])

  const getEmployeeName = (employeeUuid?: string | null) => {
    if (!employeeUuid) {
      return ''
    }
    const employee = employeeMap.get(employeeUuid)
    if (!employee) {
      return ''
    }
    return firstLastName({
      first_name: employee.firstName,
      last_name: employee.lastName,
    })
  }

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
  const companyPaysColumns: DataViewColumn<EmployeeCompensations>[] = [
    {
      key: 'employeeName',
      title: t('tableHeaders.employees'),
      render: (employeeCompensations: EmployeeCompensations) =>
        getEmployeeName(employeeCompensations.employeeUuid),
    },
    {
      key: 'grossPay',
      title: t('tableHeaders.grossPay'),
      align: 'right',
      render: (employeeCompensations: EmployeeCompensations) =>
        formatCurrency(employeeCompensations.grossPay ?? 0),
    },
    {
      key: 'reimbursements',
      title: t('tableHeaders.reimbursements'),
      align: 'right',
      render: (employeeCompensation: EmployeeCompensations) =>
        formatCurrency(getReimbursements(employeeCompensation)),
    },
    {
      key: 'companyTaxes',
      title: t('tableHeaders.companyTaxes'),
      align: 'right',
      render: (employeeCompensation: EmployeeCompensations) =>
        formatCurrency(getCompanyTaxes(employeeCompensation)),
    },
    {
      key: 'companyBenefits',
      title: t('tableHeaders.companyBenefits'),
      align: 'right',
      render: (employeeCompensation: EmployeeCompensations) =>
        formatCurrency(getCompanyBenefits(employeeCompensation)),
    },
    {
      key: 'companyPays',
      align: 'right',
      title: t('tableHeaders.companyPays'),
      render: (employeeCompensation: EmployeeCompensations) =>
        formatCurrency(getCompanyCost(employeeCompensation)),
    },
  ]
  if (isProcessed) {
    companyPaysColumns.push({
      key: 'paystubs',
      title: t('tableHeaders.paystub'),
      render: (employeeCompensations: EmployeeCompensations) => (
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
          footer={() => ({
            employeeName: {
              primary: t('tableHeaders.footerTotalsLabel'),
              secondary: t('tableHeaders.footerTotalsDescription'),
            },
            grossPay: formatCurrency(Number(payrollData.totals?.grossPay ?? 0)),
            reimbursements: formatCurrency(Number(payrollData.totals?.reimbursements ?? 0)),
            companyTaxes: formatCurrency(Number(payrollData.totals?.employerTaxes ?? 0)),
            companyBenefits: formatCurrency(Number(payrollData.totals?.benefits ?? 0)),
            companyPays: formatCurrency(totalPayroll),
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
                getEmployeeName(employeeCompensations.employeeUuid),
            },
            {
              title: t('tableHeaders.compensationType'),
              render: (employeeCompensations: EmployeeCompensations) => {
                const employee = employeeCompensations.employeeUuid
                  ? employeeMap.get(employeeCompensations.employeeUuid)
                  : undefined

                return (
                  employee?.jobs?.reduce((acc, job) => {
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
                  }, '') ?? ''
                )
              },
            },
            {
              title: t('tableHeaders.regular'),
              align: 'right',
              render: (employeeCompensations: EmployeeCompensations) =>
                getEmployeeHours(employeeCompensations)[
                  compensationTypeLabels.REGULAR_HOURS_NAME
                ] || 0,
            },
            {
              title: t('tableHeaders.overtime'),
              align: 'right',
              render: (employeeCompensations: EmployeeCompensations) =>
                getEmployeeHours(employeeCompensations)[compensationTypeLabels.OVERTIME_NAME] || 0,
            },
            {
              title: t('tableHeaders.doubleOT'),
              align: 'right',
              render: (employeeCompensations: EmployeeCompensations) =>
                getEmployeeHours(employeeCompensations)[
                  compensationTypeLabels.DOUBLE_OVERTIME_NAME
                ] || 0,
            },
            {
              title: t('tableHeaders.timeOff'),
              align: 'right',
              render: (employeeCompensations: EmployeeCompensations) =>
                getEmployeePtoHours(employeeCompensations),
            },
            {
              title: t('tableHeaders.totalHours'),
              align: 'right',
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
                getEmployeeName(employeeCompensations.employeeUuid),
            },
            {
              title: t('tableHeaders.paymentType'),
              render: (employeeCompensations: EmployeeCompensations) =>
                employeeCompensations.paymentMethod,
            },
            {
              title: t('tableHeaders.grossPay'),
              align: 'right',
              render: (employeeCompensations: EmployeeCompensations) =>
                formatCurrency(employeeCompensations.grossPay ?? 0),
            },
            {
              title: t('tableHeaders.deductions'),
              align: 'right',
              render: (employeeCompensations: EmployeeCompensations) =>
                formatCurrency(
                  employeeCompensations.deductions?.reduce(
                    (acc, deduction) => acc + (deduction.amount ?? 0),
                    0,
                  ) ?? 0,
                ),
            },
            {
              title: t('tableHeaders.reimbursements'),
              align: 'right',
              render: (employeeCompensations: EmployeeCompensations) =>
                formatCurrency(getReimbursements(employeeCompensations)),
            },
            {
              title: t('tableHeaders.employeeTaxes'),
              align: 'right',
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
              align: 'right',
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
              align: 'right',
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
                align: 'right',
                render: taxKey => formatCurrency(taxes[taxKey]?.employee ?? 0),
              },
              {
                key: 'byYourCompany',
                title: t('tableHeaders.byYourCompany'),
                align: 'right',
                render: taxKey => formatCurrency(taxes[taxKey]?.employer ?? 0),
              },
            ]}
            footer={() => ({
              taxDescription: t('totalsLabel'),
              byYourEmployees: formatCurrency(Number(payrollData.totals?.employeeTaxes ?? 0)),
              byYourCompany: formatCurrency(Number(payrollData.totals?.employerTaxes ?? 0)),
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
                align: 'right',
                render: ({ value }) => formatCurrency(Number(value)),
              },
            ]}
            data={[
              { label: t('directDepositLabel'), value: payrollData.totals?.netPayDebit || '0' },
              {
                label: t('reimbursementLabel'),
                value: payrollData.totals?.reimbursementDebit || '0',
              },
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

  return (
    <div ref={containerRef} className={styles.container}>
      <Flex flexDirection="column" alignItems="stretch">
        <Flex
          flexDirection={isDesktop ? 'row' : 'column'}
          justifyContent={isDesktop ? 'space-between' : 'normal'}
          alignItems={isDesktop ? 'flex-start' : 'stretch'}
          gap={isDesktop ? 0 : 16}
        >
          <FlexItem flexGrow={1}>
            <Heading as="h1">{isProcessed ? t('summaryTitle') : t('overviewTitle')}</Heading>
            <Text>
              <Trans
                i18nKey="pageSubtitle"
                t={t}
                components={{ dateWrapper: <Text weight="bold" as="span" /> }}
                values={getPayrollOverviewTitle(payrollData.payPeriod, dateFormatter)}
              />
            </Text>
          </FlexItem>
          <FlexItem flexGrow={isDesktop ? 1 : 0}>
            <Flex
              flexDirection={isDesktop ? 'row' : 'column'}
              justifyContent={isDesktop ? 'flex-end' : 'normal'}
              alignItems={isDesktop ? 'flex-start' : 'stretch'}
              gap={12}
            >
              {isProcessed ? (
                <>
                  <Button onClick={onPayrollReceipt} variant="secondary" isDisabled={isSubmitting}>
                    {t('payrollReceiptCta')}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCancelDialogOpen(true)
                    }}
                    variant="error"
                    isDisabled={isSubmitting}
                  >
                    {t('cancelCta')}
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={onEdit} variant="secondary" isDisabled={isSubmitting}>
                    {t('editCta')}
                  </Button>
                  <Button
                    onClick={onSubmit}
                    isDisabled={
                      isSubmitting ||
                      (submissionBlockers.length > 0 &&
                        (submissionBlockers.some(
                          blocker =>
                            !PAYROLL_RESOLVABLE_SUBMISSION_BLOCKER_TYPES.includes(
                              blocker.blockerType || '',
                            ),
                        ) ||
                          submissionBlockers.some(
                            blocker => !selectedUnblockOptions[blocker.blockerType || ''],
                          )))
                    }
                  >
                    {t('submitCta')}
                  </Button>
                </>
              )}
            </Flex>
          </FlexItem>
        </Flex>
        {isSubmitting ? (
          <LoadingIndicator>
            <Flex flexDirection="column" alignItems="center" gap={4}>
              <LoadingSpinner size="lg" />
              <Heading as="h4">{t('loadingTitle')}</Heading>
              <Text>{t('loadingDescription')}</Text>
            </Flex>
          </LoadingIndicator>
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
                    <FastAchThresholdExceeded
                      key={blockerType}
                      blocker={blocker}
                      selectedValue={selectedUnblockOptions[blockerType]}
                      onUnblockOptionChange={onUnblockOptionChange}
                    />
                  )
                }

                return <GenericBlocker key={blockerType} blocker={blocker} />
              })}
            <Heading as="h3">{t('payrollSummaryTitle')}</Heading>
            <DataView
              label={t('payrollSummaryLabel')}
              columns={[
                {
                  title: t('tableHeaders.totalPayroll'),
                  render: () => formatCurrency(totalPayroll),
                },
                {
                  title: t('tableHeaders.debitAmount'),
                  render: () => formatCurrency(Number(payrollData.totals?.companyDebit ?? 0)),
                },
                {
                  title: t('tableHeaders.debitAccount'),
                  render: () => bankAccount?.hiddenAccountNumber ?? '',
                },
                {
                  title: t('tableHeaders.debitDate'),
                  render: () => dateFormatter.formatShortWithYear(expectedDebitDate),
                },
                {
                  title: t('tableHeaders.employeesPayDate'),
                  render: () => dateFormatter.formatShortWithYear(payrollData.checkDate),
                },
              ]}
              data={[{}]}
            />
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
