import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useJobsAndCompensationsDeleteMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/jobsAndCompensationsDelete'
import type { Job } from '@gusto/embedded-api-v-2026-02-01/models/components/job'
import {
  useCompensationManagement,
  type UseCompensationManagementReady,
} from '../../shared/useCompensationManagement'
import type { PendingCompensationChange } from '../../shared/getPendingCompensationChanges'
import { usePendingChangeDetailRenderer } from '../../shared/usePendingChangeDetailRenderer'
import { PendingChangesReviewModal } from '../../shared/PendingChangesReviewModal'
import styles from './CompensationCard.module.scss'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, useDataView, EmptyData, Loading, VisuallyHidden } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { formatDateLongWithYear, formatDateToStringDate } from '@/helpers/dateFormatting'
import { useFormatCompensationRate } from '@/helpers/formattedStrings'
import { useI18n } from '@/i18n'
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

/**
 * Props for {@link CompensationCard}.
 *
 * @public
 */
export interface CompensationCardProps {
  /** The associated employee identifier. */
  employeeId: string
  /** Callback invoked when the card emits an event. See the events table on {@link CompensationCard} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone "Compensation" management card that displays an employee's current jobs and compensation, surfaces pending future-dated changes, and exposes edit, add, and delete affordances.
 *
 * @remarks
 * The card owns its own data fetch, the pending-change alerts and review modal, and the delete-job confirm dialog. It does not render the compensation edit or add-job forms — instead, it emits a distinct request event for each action, and the consumer routes those to {@link CompensationEditForm}, {@link CompensationAddJobForm}, or {@link CompensationAddAnotherJobForm} and renders any post-save success alerts. {@link Compensation} bundles the card, the three form surfaces, and the swap and alert wiring as a single drop-in; reach for the card directly only when that orchestration is the wrong fit (for example, when a form needs to render in a modal or drawer, or when the swap is driven by a router).
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/compensation/card/editRequested` | Fired when an "Edit" CTA is clicked for a job | `{ employeeId: string, jobId: string }` |
 * | `employee/management/compensation/card/addRequested` | Fired when the "Add job" CTA is clicked from the empty state | `{ employeeId: string }` |
 * | `employee/management/compensation/card/addAnotherRequested` | Fired when the "Add another job" CTA is clicked | `{ employeeId: string }` |
 * | `employee/management/compensation/card/jobDeleted` | Fired after a non-primary job is deleted via the card's confirm dialog | `{ employeeId: string, jobId: string }` |
 * | `employee/management/compensation/card/changeCancelled` | Fired after a scheduled future-dated change is cancelled from the card | `{ employeeId: string, compensationId: string }` |
 *
 * @param props - See {@link CompensationCardProps}.
 * @returns The rendered compensation card.
 * @public
 * @group Block components
 */
export function CompensationCard(props: CompensationCardProps) {
  return (
    <BaseBoundaries componentName="Employee.Management.Compensation">
      <CompensationCardContent {...props} />
    </BaseBoundaries>
  )
}

function CompensationCardContent({ employeeId, onEvent }: CompensationCardProps) {
  useI18n('Employee.Management.Compensation')
  const { t } = useTranslation('Employee.Management.Compensation')
  const Components = useComponentContext()

  const compensation = useCompensationManagement({ employeeId })

  if (compensation.isLoading) {
    return (
      <BaseLayout error={compensation.errorHandling.errors}>
        <Components.Box header={<Components.BoxHeader title={t('card.title')} />}>
          <Loading />
        </Components.Box>
      </BaseLayout>
    )
  }

  return (
    <CompensationCardReady employeeId={employeeId} onEvent={onEvent} compensation={compensation} />
  )
}

interface CompensationCardReadyProps extends CompensationCardProps {
  compensation: UseCompensationManagementReady
}

function CompensationCardReady({ employeeId, onEvent, compensation }: CompensationCardReadyProps) {
  const { t } = useTranslation('Employee.Management.Compensation')
  const Components = useComponentContext()
  const formatCompensationRate = useFormatCompensationRate()

  const { jobs, primaryFlsaStatus, pendingChanges, hasMultipleJobs, employeeFirstName } =
    compensation.data
  const { cancellingCompensationUuid } = compensation.status

  const handleCancelChange = useCallback(
    async (pendingChange: PendingCompensationChange) => {
      const result = await compensation.actions.cancelPendingChange(pendingChange)
      if (result) {
        onEvent(componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_CHANGE_CANCELLED, {
          employeeId,
          compensationId: pendingChange.compensationUuid,
        })
      }
    },
    [compensation, onEvent, employeeId],
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
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_JOB_DELETED, {
      employeeId,
      jobId,
    })
    setPendingDeleteJob(null)
  }

  const singleJob = jobs.length === 1 ? jobs[0]! : undefined
  // Block adding a secondary if the primary already has a future-dated
  // compensation that isn't Nonexempt — that comp will delete secondary jobs
  // at its effective date, matching the gws-flows guard on the new-job action.
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
  const emptyPlaceholder = <span aria-label={t('card.listEmptyPlaceholder')}>–</span>
  const singleJobPaymentTypeLabel = singleJob?.paymentUnit
    ? singleJob.paymentUnit === 'Hour'
      ? t('card.types.hourly')
      : singleJob.paymentUnit === 'Salary' || singleJob.paymentUnit === 'Year'
        ? t('card.types.salary')
        : singleJob.paymentUnit
    : null

  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const renderDetail = usePendingChangeDetailRenderer(employeeFirstName)

  // Split pending changes: "new job" (job hasn't started yet, no current comp)
  // vs "update" (existing comp with a scheduled future change).
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

  // Jobs with a future-dated comp stacked on a current comp ("pending update").
  // Editing while one is queued would stack another future comp on top —
  // hide Edit until the existing pending change is cancelled or goes into effect.
  const pendingUpdateJobUuids = new Set(updatePendingChanges.map(c => c.jobUuid))
  const singleJobHasPendingUpdate = singleJob ? pendingUpdateJobUuids.has(singleJob.uuid) : false

  const hasPendingUpdates = updatePendingChanges.length > 0
  const showSummaryAlert = hasMultipleJobs && updatePendingChanges.length > 1
  const showInlineAlert = hasPendingUpdates && !showSummaryAlert
  const nextChange = updatePendingChanges[0]

  const handleEdit = (job: Job) => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_EDIT_REQUESTED, {
      employeeId,
      jobId: job.uuid,
    })
  }
  const handleAddJob = () => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_ADD_REQUESTED, { employeeId })
  }
  const handleAddAnotherJob = () => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_ADD_ANOTHER_REQUESTED, {
      employeeId,
    })
  }

  const jobsColumns = [
    {
      key: 'jobTitle',
      title: t('card.columns.jobTitle'),
      render: (job: Job) => {
        // Title lives on compensation in the API — `job.title` is a
        // denormalized snapshot that can lag behind comp-level edits on
        // pending jobs, so read from the comp pointed to by
        // `currentCompensationUuid`.
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
      title: t('card.columns.payType'),
      render: (job: Job) => {
        const flsaStatus = job.compensations?.find(
          comp => comp.uuid === job.currentCompensationUuid,
        )?.flsaStatus
        return flsaStatus !== undefined ? t(`flsaStatusLabels.${flsaStatus}`) : '-'
      },
    },
    {
      key: 'effectiveDate',
      title: t('card.columns.effectiveDate'),
      render: (job: Job) => {
        const currentComp = job.compensations?.find(c => c.uuid === job.currentCompensationUuid)
        return currentComp?.effectiveDate ? formatDateLongWithYear(currentComp.effectiveDate) : '-'
      },
    },
    ...(hasAnyPendingNewJobs
      ? [
          {
            key: 'status',
            title: <VisuallyHidden>{t('card.columns.status')}</VisuallyHidden>,
            render: (job: Job) =>
              pendingNewJobUuids.has(job.uuid) ? (
                <Components.Badge status="warning">{t('card.pendingStatus')}</Components.Badge>
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
                label: t('card.editJobCta'),
                icon: <PencilSvg aria-hidden />,
                onClick: () => {
                  handleEdit(job)
                },
              },
            ]),
        ...(!job.primary
          ? [
              {
                label: t('card.deleteJobCta'),
                icon: <TrashCanSvg aria-hidden />,
                onClick: () => {
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
          triggerLabel={t('card.hamburgerTitle')}
          isLoading={isDeletingJob}
          items={items}
        />
      )
    },
  })

  return (
    <BaseLayout error={compensation.errorHandling.errors}>
      <Components.Box
        withPadding={!hasMultipleJobs}
        header={
          <Components.BoxHeader
            title={t('card.title')}
            action={
              hasMultipleJobs ? null : singleJob ? (
                singleJobHasPendingUpdate ? null : (
                  <Components.Button
                    variant="secondary"
                    onClick={() => {
                      handleEdit(singleJob)
                    }}
                  >
                    {t('card.editCta')}
                  </Components.Button>
                )
              ) : (
                <Components.Button
                  variant="secondary"
                  onClick={handleAddJob}
                  icon={<PlusCircleIcon />}
                >
                  {t('card.addJobCta')}
                </Components.Button>
              )
            }
          />
        }
        footer={
          canAddAnotherJob ? (
            <Components.Button
              variant="secondary"
              onClick={handleAddAnotherJob}
              icon={<PlusCircleIcon />}
            >
              {t('card.addAnotherJobCta')}
            </Components.Button>
          ) : undefined
        }
      >
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
                        ? t('card.pendingChange.alertLabelWithJob', {
                            jobTitle: nextChange.jobTitle,
                            date: formatDateLongWithYear(nextChange.effectiveDate),
                          })
                        : t('card.pendingChange.alertLabel', {
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
                          {t('card.pendingChange.cancelCta')}
                        </Components.Button>
                      </div>
                    </Flex>
                  </Components.Alert>
                )}
                {showSummaryAlert && (
                  <Components.Alert
                    status="warning"
                    disableScrollIntoView
                    label={t('card.pendingChange.summaryLabel', {
                      name: employeeFirstName ?? '',
                    })}
                    action={
                      <Components.Button
                        variant="secondary"
                        onClick={() => {
                          setIsReviewOpen(true)
                        }}
                      >
                        {t('card.pendingChange.reviewCta')}
                      </Components.Button>
                    }
                  />
                )}
              </Flex>
            </div>
          )}
          {hasMultipleJobs ? (
            <DataView label={t('card.tableLabel')} isWithinBox {...jobsDataView} />
          ) : singleJob ? (
            <Components.DescriptionList
              items={[
                {
                  term: t('card.jobTitle'),
                  description: singleJob.title || emptyPlaceholder,
                },
                {
                  term: t('card.type'),
                  description: singleJobPaymentTypeLabel || emptyPlaceholder,
                },
                {
                  term: t('card.wage'),
                  description:
                    singleJobNumericRate !== null && singleJob.paymentUnit
                      ? formatCompensationRate(singleJobNumericRate, singleJob.paymentUnit)
                      : emptyPlaceholder,
                },
                {
                  term: t('card.effectiveDate'),
                  description: singleJobCurrentComp?.effectiveDate
                    ? formatDateLongWithYear(singleJobCurrentComp.effectiveDate)
                    : emptyPlaceholder,
                },
                ...(singleJobIsPendingNew
                  ? [
                      {
                        term: t('card.columns.status'),
                        description: (
                          <Components.Badge status="warning">
                            {t('card.pendingStatus')}
                          </Components.Badge>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          ) : (
            <EmptyData
              title={t('card.emptyState.title')}
              description={t('card.emptyState.description')}
            />
          )}
        </Flex>
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
        title={t('card.deleteJobDialog.title')}
        primaryActionLabel={t('card.deleteJobDialog.confirmCta')}
        closeActionLabel={t('card.deleteJobDialog.cancelCta')}
      >
        {pendingDeleteJob
          ? t('card.deleteJobDialog.description', {
              jobTitle: pendingDeleteJob.title,
            })
          : null}
      </Components.Dialog>
    </BaseLayout>
  )
}
