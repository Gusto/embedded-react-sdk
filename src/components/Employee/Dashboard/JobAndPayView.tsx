import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useJobsAndCompensationsDeleteMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsDelete'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { EmployeeBankAccount } from '@gusto/embedded-api/models/components/employeebankaccount'
import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import type { GetV1EmployeesEmployeeUuidPayStubsResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeuuidpaystubs'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, useDataView, EmptyData } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { BaseLayout } from '@/components/Base/Base'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import { useFormatPayRate } from '@/helpers/formattedStrings'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useI18n } from '@/i18n'
import {
  usePaymentMethodList,
  useDeleteBankAccount,
  DeleteBankAccountDialog,
} from '@/components/Employee/PaymentMethod/shared'
import {
  useDeductionsList,
  useDeleteDeduction,
  DeleteDeductionDialog,
  formatDeductionAmount,
} from '@/components/Employee/Deductions/shared'
import { componentEvents, FlsaStatus, PAYMENT_METHODS, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import PercentCircleIcon from '@/assets/icons/percent-circle.svg?react'
import DownloadCloudIcon from '@/assets/icons/download-cloud.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import PencilSvg from '@/assets/icons/pencil.svg?react'

type EmployeePayStub = NonNullable<
  GetV1EmployeesEmployeeUuidPayStubsResponse['employeePayStubsList']
>[number]

function parseJobRate(rate: Job['rate']): number | null {
  if (rate === undefined) return null
  const numericRate = parseFloat(rate)
  return Number.isFinite(numericRate) ? numericRate : null
}

export interface JobAndPayViewProps {
  employeeId: string
  jobs?: Job[]
  primaryFlsaStatus?: string
  payStubs?: EmployeePayStub[]
  payStubsPagination?: PaginationControlProps
  isLoading?: boolean
  onEvent: OnEventType<EventType, unknown>
  onEditCompensation?: (job: Job) => void
  onAddJob?: () => void
  onAddDeduction?: () => void
  onEditDeduction?: (deduction: Garnishment) => void
  onPaystubDownload?: (payrollUuid: string) => void
  downloadingPayrollUuids?: ReadonlySet<string>
}

export function JobAndPayView({
  employeeId,
  jobs = [],
  primaryFlsaStatus,
  payStubs = [],
  payStubsPagination,
  isLoading = false,
  onEvent,
  onEditCompensation,
  onAddJob,
  onAddDeduction,
  onEditDeduction,
  onPaystubDownload,
  downloadingPayrollUuids,
}: JobAndPayViewProps) {
  useI18n('Employee.PaymentMethod')
  useI18n('Employee.Compensation')
  useI18n('Employee.Deductions')
  const { t } = useTranslation('Employee.Dashboard')
  const { t: tPayment } = useTranslation('Employee.PaymentMethod')
  const { t: tCompensation } = useTranslation('Employee.Compensation')
  const { t: tDeductions } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()
  const formatPayRate = useFormatPayRate()
  const formatCurrency = useNumberFormatter('currency')
  const formatPercent = useNumberFormatter('percent')

  const [pendingDeleteJob, setPendingDeleteJob] = useState<{
    uuid: string
    title: string
  } | null>(null)

  const { mutateAsync: deleteEmployeeJob, isPending: isDeletingJob } =
    useJobsAndCompensationsDeleteMutation()

  const handleConfirmDeleteJob = async () => {
    if (!pendingDeleteJob) return
    const jobId = pendingDeleteJob.uuid
    await deleteEmployeeJob({ request: { jobId } })
    onEvent(componentEvents.EMPLOYEE_JOB_DELETED, { employeeId, jobId })
    setPendingDeleteJob(null)
  }

  const singleJob = jobs.length === 1 ? jobs[0]! : undefined
  const hasMultipleJobs = jobs.length > 1
  const canAddAnotherJob = jobs.length >= 1 && primaryFlsaStatus === FlsaStatus.NONEXEMPT
  const singleJobNumericRate = singleJob ? parseJobRate(singleJob.rate) : null

  const paymentMethodList = usePaymentMethodList({ employeeId })
  const paymentMethod = paymentMethodList.isLoading
    ? undefined
    : paymentMethodList.data.paymentMethod
  const bankAccounts = paymentMethodList.isLoading ? [] : paymentMethodList.data.bankAccounts
  const deletePendingBankAccountUuid = paymentMethodList.isLoading
    ? undefined
    : paymentMethodList.status.deletePendingBankAccountUuid

  const { pendingDeleteAccount, setPendingDeleteAccount, handleConfirmDelete } =
    useDeleteBankAccount(async uuid => {
      if (paymentMethodList.isLoading) return
      const result = await paymentMethodList.actions.onDelete(uuid)
      if (result) {
        onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_DELETED, result.data)
      }
    })

  const deductionsList = useDeductionsList({ employeeId })
  const deductions = deductionsList.isLoading ? [] : deductionsList.data.deductions
  const deletingGarnishmentUuid = deductionsList.isLoading
    ? undefined
    : deductionsList.status.deletingGarnishmentUuid

  const {
    pendingDeleteDeduction,
    setPendingDeleteDeduction,
    handleConfirmDelete: handleConfirmDeleteDeduction,
  } = useDeleteDeduction(async garnishment => {
    if (deductionsList.isLoading) return
    const result = await deductionsList.actions.onDelete(garnishment)
    if (result) {
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_DELETED, result.data.garnishment)
    }
  })

  // Both hooks own a submit error state; merge into one error surface so
  // the BaseLayout below shows whatever failed.
  const errorHandling = composeErrorHandler([paymentMethodList, deductionsList])

  const jobsColumns = [
    {
      key: 'jobTitle',
      title: t('jobAndPay.compensation.columns.jobTitle'),
      render: (job: Job) => {
        const numericRate = parseJobRate(job.rate)
        return (
          <Flex flexDirection="column" gap={0}>
            <Components.Text>{job.title || '-'}</Components.Text>
            {numericRate !== null && job.paymentUnit ? (
              <Components.Text variant="supporting">
                {formatPayRate(numericRate, job.paymentUnit)}
              </Components.Text>
            ) : null}
          </Flex>
        )
      },
    },
    {
      key: 'payType',
      title: t('jobAndPay.compensation.columns.payType'),
      render: (job: Job) => {
        const flsaStatus = job.compensations?.find(
          comp => comp.uuid === job.currentCompensationUuid,
        )?.flsaStatus
        return flsaStatus !== undefined ? tCompensation(`flsaStatusLabels.${flsaStatus}`) : '-'
      },
    },
    {
      key: 'startDate',
      title: t('jobAndPay.compensation.columns.startDate'),
      render: (job: Job) => (job.hireDate ? formatDateLongWithYear(job.hireDate) : '-'),
    },
  ]

  const jobsDataView = useDataView({
    data: jobs,
    columns: jobsColumns,
    itemMenu: (job: Job) => (
      <HamburgerMenu
        triggerLabel={t('jobAndPay.compensation.hamburgerTitle')}
        isLoading={isDeletingJob}
        items={[
          {
            label: t('jobAndPay.compensation.editJobCta'),
            icon: <PencilSvg aria-hidden />,
            onClick: () => {
              onEditCompensation?.(job)
            },
          },
          ...(!job.primary
            ? [
                {
                  label: t('jobAndPay.compensation.deleteJobCta'),
                  icon: <TrashCanSvg aria-hidden />,
                  onClick: () => {
                    setPendingDeleteJob({ uuid: job.uuid, title: job.title ?? '' })
                  },
                },
              ]
            : []),
        ]}
      />
    ),
  })

  const bankAccountsColumns = [
    {
      key: 'nickname',
      title: t('jobAndPay.payment.nickname'),
      render: (bankAccount: EmployeeBankAccount) => bankAccount.name || '-',
    },
    {
      key: 'routingNumber',
      title: t('jobAndPay.payment.routingNumber'),
      render: (bankAccount: EmployeeBankAccount) => bankAccount.routingNumber || '-',
    },
    {
      key: 'accountType',
      title: t('jobAndPay.payment.accountType'),
      render: (bankAccount: EmployeeBankAccount) => bankAccount.accountType || '-',
    },
  ]

  const garnishmentsColumns = [
    {
      key: 'description',
      title: t('jobAndPay.deductions.deduction'),
      render: (garnishment: Garnishment) => garnishment.description || '-',
    },
    {
      key: 'frequency',
      title: t('jobAndPay.deductions.frequency'),
      render: (garnishment: Garnishment) =>
        garnishment.recurring
          ? t('jobAndPay.deductions.recurring')
          : t('jobAndPay.deductions.oneTime'),
    },
    {
      key: 'amount',
      title: t('jobAndPay.deductions.withhold'),
      render: (garnishment: Garnishment) =>
        formatDeductionAmount(garnishment, {
          formatCurrency,
          formatPercent,
          formatPerPaycheck: (value: string) =>
            t('jobAndPay.deductions.amountPerPaycheck', { value }),
        }),
    },
  ]

  const payStubsColumns = [
    {
      key: 'payday',
      title: t('jobAndPay.paystubs.payday'),
      render: (payStub: EmployeePayStub) => formatDateLongWithYear(payStub.checkDate) || '-',
    },
    {
      key: 'checkAmount',
      title: t('jobAndPay.paystubs.checkAmount'),
      render: (payStub: EmployeePayStub) => {
        if (!payStub.netPay) return '-'
        const amount = parseFloat(payStub.netPay)
        return isNaN(amount) ? '-' : formatCurrency(amount)
      },
    },
    {
      key: 'grossPay',
      title: t('jobAndPay.paystubs.grossPay'),
      render: (payStub: EmployeePayStub) => {
        if (!payStub.grossPay) return '-'
        const amount = parseFloat(payStub.grossPay)
        return isNaN(amount) ? '-' : formatCurrency(amount)
      },
    },
    {
      key: 'paymentMethod',
      title: t('jobAndPay.paystubs.paymentMethod'),
      render: () => paymentMethod?.type || t('jobAndPay.paystubs.noPaymentMethod'),
    },
  ]

  const bankAccountsDataView = useDataView({
    data: bankAccounts,
    columns: bankAccountsColumns,
    itemMenu: (bankAccount: EmployeeBankAccount) => (
      <HamburgerMenu
        items={[
          {
            label: tPayment('deleteBankAccountCta'),
            onClick: () => {
              setPendingDeleteAccount({
                uuid: bankAccount.uuid,
                hiddenAccountNumber: bankAccount.hiddenAccountNumber,
              })
            },
            icon: <TrashCanSvg aria-hidden />,
          },
        ]}
        triggerLabel={tPayment('hamburgerTitle')}
      />
    ),
  })

  const garnishmentsDataView = useDataView({
    data: deductions,
    columns: garnishmentsColumns,
    itemMenu: (garnishment: Garnishment) => (
      <HamburgerMenu
        isLoading={deletingGarnishmentUuid === garnishment.uuid}
        items={[
          {
            label: tDeductions('editCta'),
            onClick: () => onEditDeduction?.(garnishment),
            icon: <PencilSvg aria-hidden />,
          },
          {
            label: tDeductions('deleteCta'),
            onClick: () => {
              setPendingDeleteDeduction(garnishment)
            },
            icon: <TrashCanSvg aria-hidden />,
          },
        ]}
        triggerLabel={tDeductions('hamburgerTitle')}
      />
    ),
    emptyState: () => (
      <EmptyData
        title={t('jobAndPay.deductions.emptyState.title')}
        description={t('jobAndPay.deductions.emptyState.description')}
      />
    ),
  })

  const payStubsDataView = useDataView({
    data: payStubs,
    columns: payStubsColumns,
    pagination: payStubsPagination,
    itemMenu: payStub => {
      const isDownloading =
        !!payStub.payrollUuid && !!downloadingPayrollUuids?.has(payStub.payrollUuid)
      return (
        <Components.ButtonIcon
          variant="tertiary"
          aria-label={t('jobAndPay.paystubs.downloadCta')}
          isDisabled={!payStub.payrollUuid}
          isLoading={isDownloading}
          onClick={() => {
            if (payStub.payrollUuid) {
              onPaystubDownload?.(payStub.payrollUuid)
            }
          }}
        >
          <DownloadCloudIcon aria-hidden />
        </Components.ButtonIcon>
      )
    },
    emptyState: () => (
      <EmptyData
        title={t('jobAndPay.paystubs.emptyState.title')}
        description={t('jobAndPay.paystubs.emptyState.description')}
      />
    ),
  })

  if (isLoading || paymentMethodList.isLoading || deductionsList.isLoading) {
    return <BaseLayout isLoading error={errorHandling.errors} />
  }

  const isDirectDeposit = paymentMethod?.type === PAYMENT_METHODS.directDeposit

  return (
    <BaseLayout error={errorHandling.errors}>
      <Flex flexDirection="column" gap={24}>
        <Components.Box
          withPadding={!hasMultipleJobs}
          header={
            <Components.BoxHeader
              title={t('jobAndPay.compensation.title')}
              action={
                hasMultipleJobs ? null : singleJob ? (
                  <Components.Button
                    variant="secondary"
                    onClick={() => {
                      onEditCompensation?.(singleJob)
                    }}
                  >
                    {t('jobAndPay.compensation.editCta')}
                  </Components.Button>
                ) : (
                  <Components.Button
                    variant="secondary"
                    onClick={onAddJob}
                    icon={<PlusCircleIcon />}
                  >
                    {t('jobAndPay.compensation.addJobCta')}
                  </Components.Button>
                )
              }
            />
          }
          footer={
            canAddAnotherJob ? (
              <Components.Button variant="secondary" onClick={onAddJob} icon={<PlusCircleIcon />}>
                {t('jobAndPay.compensation.addAnotherJobCta')}
              </Components.Button>
            ) : undefined
          }
        >
          {hasMultipleJobs ? (
            <DataView
              label={t('jobAndPay.compensation.tableLabel')}
              isWithinBox
              {...jobsDataView}
            />
          ) : singleJob ? (
            <Flex flexDirection="column" gap={16}>
              <Flex flexDirection="column" gap={12}>
                {singleJob.title && (
                  <Flex flexDirection="column" gap={0}>
                    <Components.Text variant="supporting">
                      {t('jobAndPay.compensation.jobTitle')}
                    </Components.Text>
                    <Components.Text>{singleJob.title}</Components.Text>
                  </Flex>
                )}

                {singleJob.paymentUnit && (
                  <Flex flexDirection="column" gap={0}>
                    <Components.Text variant="supporting">
                      {t('jobAndPay.compensation.type')}
                    </Components.Text>
                    <Components.Text>
                      {singleJob.paymentUnit === 'Hour'
                        ? t('jobAndPay.compensation.types.hourly')
                        : singleJob.paymentUnit === 'Salary' || singleJob.paymentUnit === 'Year'
                          ? t('jobAndPay.compensation.types.salary')
                          : singleJob.paymentUnit}
                    </Components.Text>
                  </Flex>
                )}

                {singleJobNumericRate !== null && singleJob.paymentUnit && (
                  <Flex flexDirection="column" gap={0}>
                    <Components.Text variant="supporting">
                      {t('jobAndPay.compensation.wage')}
                    </Components.Text>
                    <Components.Text>
                      {formatPayRate(singleJobNumericRate, singleJob.paymentUnit)}
                    </Components.Text>
                  </Flex>
                )}

                {singleJob.hireDate && (
                  <Flex flexDirection="column" gap={0}>
                    <Components.Text variant="supporting">
                      {t('jobAndPay.compensation.startDate')}
                    </Components.Text>
                    <Components.Text>{formatDateLongWithYear(singleJob.hireDate)}</Components.Text>
                  </Flex>
                )}
              </Flex>
            </Flex>
          ) : (
            <EmptyData
              title={t('jobAndPay.compensation.emptyState.title')}
              description={t('jobAndPay.compensation.emptyState.description')}
            />
          )}
        </Components.Box>

        <Components.Box
          withPadding={bankAccounts.length === 0}
          header={
            <Components.BoxHeader
              title={t('jobAndPay.payment.title')}
              action={
                <Flex gap={8} alignItems="center" justifyContent="flex-end">
                  {isDirectDeposit && bankAccounts.length > 1 && (
                    <Components.Button
                      variant="secondary"
                      onClick={() => {
                        onEvent(componentEvents.EMPLOYEE_SPLIT_PAYCHECK, { employeeId })
                      }}
                      icon={<PercentCircleIcon />}
                    >
                      {t('jobAndPay.payment.splitPaycheckCta')}
                    </Components.Button>
                  )}
                  <Components.Button
                    variant="secondary"
                    onClick={() => {
                      onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATE, { employeeId })
                    }}
                    icon={<PlusCircleIcon />}
                  >
                    {t('jobAndPay.payment.addBankAccountCta')}
                  </Components.Button>
                </Flex>
              }
            />
          }
        >
          {bankAccounts.length === 0 ? (
            <Flex flexDirection="column" gap={0}>
              <Components.Text variant="supporting">
                {tPayment('paymentMethodLabel')}
              </Components.Text>
              <Components.Text>
                {isDirectDeposit ? tPayment('directDepositLabel') : tPayment('checkLabel')}
              </Components.Text>
            </Flex>
          ) : (
            <DataView
              label={t('jobAndPay.payment.listLabel')}
              isWithinBox
              {...bankAccountsDataView}
            />
          )}
        </Components.Box>

        <Components.Box
          withPadding={false}
          header={
            <Components.BoxHeader
              title={t('jobAndPay.deductions.title')}
              action={
                <Components.Button
                  variant="secondary"
                  onClick={onAddDeduction}
                  icon={<PlusCircleIcon />}
                >
                  {t('jobAndPay.deductions.addDeductionCta')}
                </Components.Button>
              }
            />
          }
        >
          <DataView
            label={t('jobAndPay.deductions.listLabel')}
            isWithinBox
            {...garnishmentsDataView}
          />
        </Components.Box>

        <Components.Box
          withPadding={false}
          header={<Components.BoxHeader title={t('jobAndPay.paystubs.title')} />}
        >
          <DataView label={t('jobAndPay.paystubs.listLabel')} isWithinBox {...payStubsDataView} />
        </Components.Box>

        <DeleteBankAccountDialog
          pendingDeleteAccount={pendingDeleteAccount}
          isPrimaryActionLoading={deletePendingBankAccountUuid === pendingDeleteAccount?.uuid}
          onClose={() => {
            setPendingDeleteAccount(null)
          }}
          onConfirm={() => {
            void handleConfirmDelete()
          }}
        />

        <DeleteDeductionDialog
          pendingDeleteDeduction={pendingDeleteDeduction}
          isPrimaryActionLoading={deletingGarnishmentUuid === pendingDeleteDeduction?.uuid}
          onClose={() => {
            setPendingDeleteDeduction(null)
          }}
          onConfirm={() => {
            void handleConfirmDeleteDeduction()
          }}
        />

        <Components.Dialog
          isOpen={pendingDeleteJob !== null}
          onClose={() => {
            setPendingDeleteJob(null)
          }}
          onPrimaryActionClick={() => {
            void handleConfirmDeleteJob()
          }}
          isPrimaryActionLoading={isDeletingJob}
          isDestructive
          title={t('jobAndPay.compensation.deleteJobDialog.title')}
          primaryActionLabel={t('jobAndPay.compensation.deleteJobDialog.confirmCta')}
          closeActionLabel={t('jobAndPay.compensation.deleteJobDialog.cancelCta')}
        >
          {pendingDeleteJob
            ? t('jobAndPay.compensation.deleteJobDialog.description', {
                jobTitle: pendingDeleteJob.title,
              })
            : null}
        </Components.Dialog>
      </Flex>
    </BaseLayout>
  )
}
