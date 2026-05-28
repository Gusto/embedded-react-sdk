import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { payrollsGetPayStub } from '@gusto/embedded-api/funcs/payrollsGetPayStub'
import { useErrorBoundary } from 'react-error-boundary'
import { useJobsAndCompensationsDeleteMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsDelete'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { EmployeeBankAccount } from '@gusto/embedded-api/models/components/employeebankaccount'
import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import type { GetV1EmployeesEmployeeUuidPayStubsResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeuuidpaystubs'
import { useEmployeeCompensation } from './hooks'
import type { PendingCompensationChange } from './getPendingCompensationChanges'
import { usePendingChangeDetailRenderer } from './usePendingChangeDetailRenderer'
import { PendingChangesReviewModal } from './PendingChangesReviewModal'
import styles from './JobAndPayView.module.scss'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, useDataView, EmptyData, Loading, VisuallyHidden } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { BaseLayout } from '@/components/Base/Base'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { readableStreamToBlob } from '@/helpers/readableStreamToBlob'
import { formatDateLongWithYear, formatDateToStringDate } from '@/helpers/dateFormatting'
import { useFormatCompensationRate } from '@/helpers/formattedStrings'
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
  onEvent: OnEventType<EventType, unknown>
  onEditCompensation?: (job: Job) => void
  onAddJob?: () => void
  onAddAnotherJob?: () => void
  onAddDeduction?: () => void
  onEditDeduction?: (deduction: Garnishment) => void
}

export function JobAndPayView({
  employeeId,
  onEvent,
  onEditCompensation,
  onAddJob,
  onAddAnotherJob,
  onAddDeduction,
  onEditDeduction,
}: JobAndPayViewProps) {
  useI18n('Employee.PaymentMethod')
  useI18n('Employee.Compensation')
  useI18n('Employee.Deductions')
  const { t } = useTranslation('Employee.Dashboard')
  const { t: tPayment } = useTranslation('Employee.PaymentMethod')
  const { t: tCompensation } = useTranslation('Employee.Compensation')
  const { t: tDeductions } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()
  const formatCompensationRate = useFormatCompensationRate()
  const formatCurrency = useNumberFormatter('currency')
  const formatPercent = useNumberFormatter('percent')
  const gustoEmbedded = useGustoEmbeddedContext()
  const { showBoundary } = useErrorBoundary()

  const compensation = useEmployeeCompensation({ employeeId })
  const {
    jobs,
    primaryFlsaStatus,
    pendingChanges,
    hasMultipleJobs: hasMultipleJobsFromHook,
    payStubs,
    employeeFirstName,
  } = compensation.data
  const payStubsPagination = compensation.pagination.payStubs
  const cancellingCompensationUuid = compensation.status.cancellingCompensationUuid
  const { cancelPendingChange } = compensation.actions
  const isCompensationCardLoading = compensation.status.isCompensationLoading
  const isPayStubsLoading = compensation.status.isPayStubsLoading

  const handleCancelChange = useCallback(
    async (pendingChange: PendingCompensationChange) => {
      const result = await cancelPendingChange(pendingChange)
      if (result) {
        onEvent(componentEvents.EMPLOYEE_COMPENSATION_CHANGE_CANCELLED, {
          employeeId,
          compensationId: pendingChange.compensationUuid,
        })
      }
    },
    [cancelPendingChange, onEvent, employeeId],
  )

  const [downloadingPayrollUuids, setDownloadingPayrollUuids] = useState<ReadonlySet<string>>(
    () => new Set(),
  )

  const handlePaystubDownload = useCallback(
    async (payrollUuid: string) => {
      // Omit `noopener` — it makes window.open return null in modern browsers,
      // which would leave us unable to navigate the new tab to the blob URL.
      const newWindow = window.open('', '_blank')
      const loadingMessage = t('jobAndPay.paystubs.downloadLoadingMessage')
      if (newWindow) {
        // Avoid the user staring at about:blank while we fetch the PDF. The
        // navigation to the Blob URL below replaces this document.
        const doc = newWindow.document
        doc.title = loadingMessage
        const style = doc.createElement('style')
        style.textContent =
          'body{font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;' +
          'justify-content:center;height:100vh;margin:0;color:#444;gap:12px}' +
          '.spinner{width:20px;height:20px;border:2px solid #ccc;border-top-color:#444;' +
          'border-radius:50%;animation:spin .8s linear infinite}' +
          '@keyframes spin{to{transform:rotate(360deg)}}'
        doc.head.appendChild(style)
        const spinner = doc.createElement('div')
        spinner.className = 'spinner'
        spinner.setAttribute('aria-hidden', 'true')
        const label = doc.createElement('span')
        label.textContent = loadingMessage
        doc.body.replaceChildren(spinner, label)
      }
      setDownloadingPayrollUuids(prev => {
        const next = new Set(prev)
        next.add(payrollUuid)
        return next
      })
      try {
        const response = await payrollsGetPayStub(gustoEmbedded, {
          payrollId: payrollUuid,
          employeeId,
        })
        if (!response.value?.responseStream) {
          throw new Error(t('jobAndPay.paystubs.downloadError'))
        }
        const pdfBlob = await readableStreamToBlob(response.value.responseStream, 'application/pdf')
        const url = URL.createObjectURL(pdfBlob)
        if (newWindow) {
          // Revoke after the new tab has loaded the blob; revoking synchronously
          // would race the navigation and leave the tab blank.
          newWindow.addEventListener('load', () => {
            URL.revokeObjectURL(url)
          })
          newWindow.location.href = url
        } else {
          URL.revokeObjectURL(url)
        }
      } catch (err) {
        if (newWindow) {
          newWindow.close()
        }
        showBoundary(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setDownloadingPayrollUuids(prev => {
          const next = new Set(prev)
          next.delete(payrollUuid)
          return next
        })
      }
    },
    [gustoEmbedded, employeeId, t, showBoundary],
  )

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
  const hasMultipleJobs = hasMultipleJobsFromHook
  // Block adding a secondary if the primary already has a future-dated
  // compensation that isn't Nonexempt — that comp will delete secondary jobs
  // at its effective date, matching the gws-flows guard on the new-job action.
  // Use local date (not UTC) so the comparison matches how effectiveDate strings
  // are handled throughout the dashboard (same as getPendingCompensationChanges).
  const localTodayISO = formatDateToStringDate(new Date()) ?? ''
  const primaryJob = jobs.find(j => j.primary)
  const hasFutureNonNonexemptComp =
    primaryJob?.compensations?.some(
      c =>
        c.effectiveDate !== undefined &&
        c.effectiveDate > localTodayISO &&
        c.flsaStatus !== FlsaStatus.NONEXEMPT,
    ) ?? false
  const canAddAnotherJob =
    jobs.length >= 1 && primaryFlsaStatus === FlsaStatus.NONEXEMPT && !hasFutureNonNonexemptComp
  const singleJobNumericRate = singleJob ? parseJobRate(singleJob.rate) : null
  const singleJobCurrentComp = singleJob?.compensations?.find(
    c => c.uuid === singleJob.currentCompensationUuid,
  )
  const singleJobEffectiveDateRow = singleJobCurrentComp?.effectiveDate ? (
    <Flex flexDirection="column" gap={0}>
      <Components.Text variant="supporting">
        {t('jobAndPay.compensation.effectiveDate')}
      </Components.Text>
      <Components.Text>
        {formatDateLongWithYear(singleJobCurrentComp.effectiveDate)}
      </Components.Text>
    </Flex>
  ) : null

  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const renderDetail = usePendingChangeDetailRenderer(employeeFirstName)

  // Split pending changes: "new job" (job hasn't started yet, no current comp)
  // vs "update" (existing comp with a scheduled future change).
  // New-job changes get a Pending badge on the card/table row.
  // Update changes get the existing warning alert treatment.
  const newJobPendingChanges = pendingChanges.filter(c => c.isNewJob)
  const updatePendingChanges = pendingChanges.filter(c => !c.isNewJob)

  useEffect(() => {
    if (updatePendingChanges.length === 0) {
      setIsReviewOpen(false)
    }
  }, [updatePendingChanges.length])

  const pendingNewJobUuids = new Set(newJobPendingChanges.map(c => c.jobUuid))
  const singleJobIsPendingNew = singleJob ? pendingNewJobUuids.has(singleJob.uuid) : false
  const hasAnyPendingNewJobs = pendingNewJobUuids.size > 0

  // Jobs with a future-dated comp stacked on a current comp ("pending update"
  // as opposed to "pending new job"). Editing while one is queued would just
  // stack another future comp on top — confusing UX. Hide Edit until the
  // existing pending change is cancelled or it goes into effect.
  const pendingUpdateJobUuids = new Set(updatePendingChanges.map(c => c.jobUuid))
  const singleJobHasPendingUpdate = singleJob ? pendingUpdateJobUuids.has(singleJob.uuid) : false

  const hasPendingUpdates = updatePendingChanges.length > 0
  const showSummaryAlert = hasMultipleJobs && updatePendingChanges.length > 1
  const showInlineAlert = hasPendingUpdates && !showSummaryAlert
  const nextChange = updatePendingChanges[0]

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

  // All three hooks own their own error state; merge into one error
  // surface so the BaseLayout below shows whatever failed (read errors
  // from the queries, submit errors from delete/cancel actions).
  const errorHandling = composeErrorHandler([compensation, paymentMethodList, deductionsList])

  const jobsColumns = [
    {
      key: 'jobTitle',
      title: t('jobAndPay.compensation.columns.jobTitle'),
      render: (job: Job) => {
        const numericRate = parseJobRate(job.rate)
        return (
          <>
            {job.title || '-'}
            {numericRate !== null && job.paymentUnit ? (
              <Components.Text variant="supporting" size="sm">
                {formatCompensationRate(numericRate, job.paymentUnit)}
              </Components.Text>
            ) : null}
          </>
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
      key: 'effectiveDate',
      title: t('jobAndPay.compensation.columns.effectiveDate'),
      render: (job: Job) => {
        const currentComp = job.compensations?.find(c => c.uuid === job.currentCompensationUuid)
        return currentComp?.effectiveDate ? formatDateLongWithYear(currentComp.effectiveDate) : '-'
      },
    },
    ...(hasAnyPendingNewJobs
      ? [
          {
            key: 'status',
            title: <VisuallyHidden>{t('jobAndPay.compensation.columns.status')}</VisuallyHidden>,
            render: (job: Job) =>
              pendingNewJobUuids.has(job.uuid) ? (
                <Components.Badge status="warning">
                  {t('jobAndPay.compensation.pendingStatus')}
                </Components.Badge>
              ) : null,
          },
        ]
      : []),
  ]

  const jobsDataView = useDataView({
    data: jobs,
    columns: jobsColumns,
    itemMenu: (job: Job) => {
      const jobHasPendingUpdate = pendingUpdateJobUuids.has(job.uuid)
      const items = [
        ...(jobHasPendingUpdate
          ? []
          : [
              {
                label: t('jobAndPay.compensation.editJobCta'),
                icon: <PencilSvg aria-hidden />,
                onClick: () => {
                  onEditCompensation?.(job)
                },
              },
            ]),
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
      ]
      if (items.length === 0) return null
      return (
        <HamburgerMenu
          triggerLabel={t('jobAndPay.compensation.hamburgerTitle')}
          isLoading={isDeletingJob}
          items={items}
        />
      )
    },
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
        !!payStub.payrollUuid && downloadingPayrollUuids.has(payStub.payrollUuid)
      return (
        <Components.ButtonIcon
          variant="tertiary"
          aria-label={t('jobAndPay.paystubs.downloadCta')}
          isDisabled={!payStub.payrollUuid}
          isLoading={isDownloading}
          onClick={() => {
            if (payStub.payrollUuid) {
              void handlePaystubDownload(payStub.payrollUuid)
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

  // `usePaymentMethodList` and `useDeductionsList` still use the older
  // `HookLoadingResult | Ready` shape, which returns `isLoading: true`
  // when the query has errored AND data is missing. Treat those rows
  // as "not loading" so the section doesn't show a perpetual skeleton
  // while BaseLayout already renders the error alert above.
  const isPaymentMethodLoading =
    paymentMethodList.isLoading && paymentMethodList.errorHandling.errors.length === 0
  const isDeductionsLoading =
    deductionsList.isLoading && deductionsList.errorHandling.errors.length === 0
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
                // While the compensation card is loading we don't yet
                // know if the employee has jobs — suppress the action
                // so we don't surface an "Add job" CTA against an
                // employee who already has one.
                isCompensationCardLoading ? null : hasMultipleJobs ? null : singleJob ? (
                  singleJobHasPendingUpdate ? null : (
                    <Components.Button
                      variant="secondary"
                      onClick={() => {
                        onEditCompensation?.(singleJob)
                      }}
                    >
                      {t('jobAndPay.compensation.editCta')}
                    </Components.Button>
                  )
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
            !isCompensationCardLoading && canAddAnotherJob ? (
              <Components.Button
                variant="secondary"
                onClick={onAddAnotherJob}
                icon={<PlusCircleIcon />}
              >
                {t('jobAndPay.compensation.addAnotherJobCta')}
              </Components.Button>
            ) : undefined
          }
        >
          {isCompensationCardLoading ? (
            <Loading />
          ) : (
            <Flex flexDirection="column" gap={16}>
              {hasPendingUpdates && (
                <div
                  className={[styles.alertWrapper, hasMultipleJobs && styles.alertWrapperPadded]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <Flex flexDirection="column" gap={16}>
                    {showInlineAlert && nextChange && (
                      <Components.Alert
                        status="warning"
                        disableScrollIntoView
                        label={
                          hasMultipleJobs
                            ? t('jobAndPay.compensation.pendingChange.alertLabelWithJob', {
                                jobTitle: nextChange.jobTitle,
                                date: formatDateLongWithYear(nextChange.effectiveDate),
                              })
                            : t('jobAndPay.compensation.pendingChange.alertLabel', {
                                date: formatDateLongWithYear(nextChange.effectiveDate),
                              })
                        }
                      >
                        <Flex flexDirection="column" gap={12}>
                          <Components.UnorderedList
                            items={nextChange.details.map(detail => renderDetail(detail))}
                          />
                          <div>
                            <Components.Button
                              variant="secondary"
                              isLoading={cancellingCompensationUuid === nextChange.compensationUuid}
                              onClick={() => {
                                void handleCancelChange(nextChange)
                              }}
                            >
                              {t('jobAndPay.compensation.pendingChange.cancelCta')}
                            </Components.Button>
                          </div>
                        </Flex>
                      </Components.Alert>
                    )}
                    {showSummaryAlert && (
                      <Components.Alert
                        status="warning"
                        disableScrollIntoView
                        label={t('jobAndPay.compensation.pendingChange.summaryLabel', {
                          name: employeeFirstName ?? '',
                        })}
                        action={
                          <Components.Button
                            variant="secondary"
                            onClick={() => {
                              setIsReviewOpen(true)
                            }}
                          >
                            {t('jobAndPay.compensation.pendingChange.reviewCta')}
                          </Components.Button>
                        }
                      />
                    )}
                  </Flex>
                </div>
              )}
              {hasMultipleJobs ? (
                <DataView
                  label={t('jobAndPay.compensation.tableLabel')}
                  isWithinBox
                  {...jobsDataView}
                />
              ) : singleJob ? (
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
                        {formatCompensationRate(singleJobNumericRate, singleJob.paymentUnit)}
                      </Components.Text>
                    </Flex>
                  )}

                  {singleJobEffectiveDateRow}

                  {singleJobIsPendingNew && (
                    <Flex flexDirection="column" gap={0}>
                      <Components.Text variant="supporting">
                        {t('jobAndPay.compensation.columns.status')}
                      </Components.Text>
                      <div>
                        <Components.Badge status="warning">
                          {t('jobAndPay.compensation.pendingStatus')}
                        </Components.Badge>
                      </div>
                    </Flex>
                  )}
                </Flex>
              ) : (
                <EmptyData
                  title={t('jobAndPay.compensation.emptyState.title')}
                  description={t('jobAndPay.compensation.emptyState.description')}
                />
              )}
            </Flex>
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
          {isPaymentMethodLoading ? (
            <Loading />
          ) : bankAccounts.length === 0 ? (
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
          {isDeductionsLoading ? (
            <Loading />
          ) : (
            <DataView
              label={t('jobAndPay.deductions.listLabel')}
              isWithinBox
              {...garnishmentsDataView}
            />
          )}
        </Components.Box>

        <Components.Box
          withPadding={false}
          header={<Components.BoxHeader title={t('jobAndPay.paystubs.title')} />}
        >
          {isPayStubsLoading ? (
            <Loading />
          ) : (
            <DataView label={t('jobAndPay.paystubs.listLabel')} isWithinBox {...payStubsDataView} />
          )}
        </Components.Box>

        <PendingChangesReviewModal
          isOpen={isReviewOpen}
          pendingChanges={updatePendingChanges}
          employeeFirstName={employeeFirstName}
          cancellingCompensationUuid={cancellingCompensationUuid}
          onClose={() => {
            setIsReviewOpen(false)
          }}
          onCancelChange={change => {
            void handleCancelChange(change)
          }}
        />

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
