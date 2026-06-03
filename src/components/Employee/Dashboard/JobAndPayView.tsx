import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useJobsAndCompensationsDeleteMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/jobsAndCompensationsDelete'
import type { Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'
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
import { formatDateLongWithYear, formatDateToStringDate } from '@/helpers/dateFormatting'
import { useFormatCompensationRate } from '@/helpers/formattedStrings'
import { useI18n } from '@/i18n'
import { PaymentMethodCard } from '@/components/Employee/PaymentMethod/management'
import { DeductionsCard } from '@/components/Employee/Deductions/management/DeductionsCard'
import { PaystubsCard } from '@/components/Employee/Paystubs/management/PaystubsCard'
import { componentEvents, FlsaStatus, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import PencilSvg from '@/assets/icons/pencil.svg?react'

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
}

export function JobAndPayView({
  employeeId,
  onEvent,
  onEditCompensation,
  onAddJob,
  onAddAnotherJob,
}: JobAndPayViewProps) {
  useI18n('Employee.Compensation')
  const { t } = useTranslation('Employee.Dashboard')
  const { t: tCompensation } = useTranslation('Employee.Compensation')
  const Components = useComponentContext()
  const formatCompensationRate = useFormatCompensationRate()

  const compensation = useEmployeeCompensation({ employeeId })
  const {
    jobs,
    primaryFlsaStatus,
    pendingChanges,
    hasMultipleJobs: hasMultipleJobsFromHook,
    employeeFirstName,
  } = compensation.data
  const cancellingCompensationUuid = compensation.status.cancellingCompensationUuid
  const { cancelPendingChange } = compensation.actions
  const isCompensationCardLoading = compensation.status.isCompensationLoading

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
  const emptyPlaceholder = <span aria-label={t('listEmptyPlaceholder')}>–</span>
  const singleJobPaymentTypeLabel = singleJob?.paymentUnit
    ? singleJob.paymentUnit === 'Hour'
      ? t('jobAndPay.compensation.types.hourly')
      : singleJob.paymentUnit === 'Salary' || singleJob.paymentUnit === 'Year'
        ? t('jobAndPay.compensation.types.salary')
        : singleJob.paymentUnit
    : null

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

  // Compensation owns the only inline-rendered error state remaining.
  // The Payment, Deductions, and Paystubs cards each render their own
  // errors via their internal BaseLayouts, so they are not merged in here.
  const errorHandling = composeErrorHandler([compensation])

  const jobsColumns = [
    {
      key: 'jobTitle',
      title: t('jobAndPay.compensation.columns.jobTitle'),
      render: (job: Job) => {
        // Title lives on compensation in the API — `job.title` is a
        // denormalized snapshot that can lag behind comp-level title edits on
        // pending (not-yet-started) jobs, so read from the comp pointed to by
        // `currentCompensationUuid` like the pay-type / effective-date /
        // status columns do.
        const currentComp = job.compensations?.find(c => c.uuid === job.currentCompensationUuid)
        const numericRate = parseJobRate(job.rate)
        return (
          <>
            {currentComp?.title || '-'}
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
                  // Match the title shown on the row (comp-derived), since
                  // `job.title` can lag behind comp-level edits on
                  // secondaries.
                  const currentComp = job.compensations?.find(
                    c => c.uuid === job.currentCompensationUuid,
                  )
                  setPendingDeleteJob({ uuid: job.uuid, title: currentComp?.title ?? '' })
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
                <Components.DescriptionList
                  items={[
                    {
                      term: t('jobAndPay.compensation.jobTitle'),
                      description: singleJob.title || emptyPlaceholder,
                    },
                    {
                      term: t('jobAndPay.compensation.type'),
                      description: singleJobPaymentTypeLabel || emptyPlaceholder,
                    },
                    {
                      term: t('jobAndPay.compensation.wage'),
                      description:
                        singleJobNumericRate !== null && singleJob.paymentUnit
                          ? formatCompensationRate(singleJobNumericRate, singleJob.paymentUnit)
                          : emptyPlaceholder,
                    },
                    {
                      term: t('jobAndPay.compensation.effectiveDate'),
                      description: singleJobCurrentComp?.effectiveDate
                        ? formatDateLongWithYear(singleJobCurrentComp.effectiveDate)
                        : emptyPlaceholder,
                    },
                    ...(singleJobIsPendingNew
                      ? [
                          {
                            term: t('jobAndPay.compensation.columns.status'),
                            description: (
                              <Components.Badge status="warning">
                                {t('jobAndPay.compensation.pendingStatus')}
                              </Components.Badge>
                            ),
                          },
                        ]
                      : []),
                  ]}
                />
              ) : (
                <EmptyData
                  title={t('jobAndPay.compensation.emptyState.title')}
                  description={t('jobAndPay.compensation.emptyState.description')}
                />
              )}
            </Flex>
          )}
        </Components.Box>

        <PaymentMethodCard employeeId={employeeId} onEvent={onEvent} />

        <DeductionsCard employeeId={employeeId} onEvent={onEvent} />

        <PaystubsCard employeeId={employeeId} onEvent={onEvent} />

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
