import { useMemo, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { Compensation } from '@gusto/embedded-api/models/components/compensation'
import { useJobsAndCompensationsGetJobsSuspense } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { useJobsAndCompensationsDeleteCompensationMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsDeleteCompensation'
import { useJobsAndCompensationsDeleteMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsDelete'
import { CancelChangeDialog, type PendingCompensationChange } from '../shared/CancelChangeDialog'
import { DeleteJobDialog, type PendingDeleteJob } from '../shared/DeleteJobDialog'
import styles from './ListView.module.scss'
import { BaseBoundaries, BaseLayout, type CommonComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { DataView, Flex, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents, FlsaStatus, type EventType } from '@/shared/constants'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import { useFormatPayRate } from '@/helpers/formattedStrings'

export interface ListViewProps extends CommonComponentInterface<'Employee.Compensation'> {
  employeeId: string
  /**
   * Receives:
   * - `EMPLOYEE_COMPENSATION_EDIT` with `{ jobId, compensationId }` when the
   *   user clicks Edit on a job's current or pending-future compensation.
   * - `EMPLOYEE_JOB_ADD` when the user clicks "Add another job" (eligible
   *   multi-job employees only).
   * - `EMPLOYEE_COMPENSATION_CHANGE_CANCELLED` with `{ jobId, compensationId }`
   *   after a pending future-dated change is successfully deleted.
   * - `EMPLOYEE_JOB_DELETED` with `{ jobId }` after a secondary job is
   *   successfully deleted.
   */
  onEvent: OnEventType<EventType, unknown>
}

export function ListView({ dictionary, ...props }: ListViewProps) {
  useComponentDictionary('Employee.Compensation', dictionary)
  return (
    <BaseBoundaries componentName="Employee.Compensation.Management">
      <Root {...props} />
    </BaseBoundaries>
  )
}

function findCurrentCompensation(job: Job): Compensation | undefined {
  return job.compensations?.find(c => c.uuid === job.currentCompensationUuid)
}

function findPendingFutureCompensation(job: Job): Compensation | undefined {
  const today = new Date().toISOString().split('T')[0]!
  const future = (job.compensations ?? [])
    .filter(
      c => c.uuid !== job.currentCompensationUuid && c.effectiveDate && c.effectiveDate > today,
    )
    .sort((a, b) => (a.effectiveDate! < b.effectiveDate! ? -1 : 1))
  return future[0]
}

function Root({ employeeId, className, onEvent }: ListViewProps) {
  useI18n('Employee.Compensation')

  const { data: jobsData } = useJobsAndCompensationsGetJobsSuspense({ employeeId })
  const jobs = useMemo(() => jobsData.jobs ?? [], [jobsData.jobs])

  const primaryJob = useMemo(() => jobs.find(j => j.primary) ?? jobs[0], [jobs])
  const secondaryJobs = useMemo(() => jobs.filter(j => j !== primaryJob), [jobs, primaryJob])

  const primaryCurrentComp = primaryJob ? findCurrentCompensation(primaryJob) : undefined
  const isEligibleForAdditionalJobs = primaryCurrentComp?.flsaStatus === FlsaStatus.NONEXEMPT

  const [pendingChange, setPendingChange] = useState<PendingCompensationChange | null>(null)
  const [pendingDeleteJob, setPendingDeleteJob] = useState<PendingDeleteJob | null>(null)

  const deleteCompensationMutation = useJobsAndCompensationsDeleteCompensationMutation()
  const deleteJobMutation = useJobsAndCompensationsDeleteMutation()

  const handleEditCompensation = (jobId: string, compensationId: string) => {
    onEvent(componentEvents.EMPLOYEE_COMPENSATION_EDIT, { jobId, compensationId })
  }

  const handleAddJob = () => {
    onEvent(componentEvents.EMPLOYEE_JOB_ADD)
  }

  const handleConfirmCancelChange = async () => {
    if (!pendingChange) return
    const { compensationId } = pendingChange
    const targetJob = jobs.find(j => j.compensations?.some(c => c.uuid === compensationId))
    await deleteCompensationMutation.mutateAsync({ request: { compensationId } })
    setPendingChange(null)
    onEvent(componentEvents.EMPLOYEE_COMPENSATION_CHANGE_CANCELLED, {
      jobId: targetJob?.uuid,
      compensationId,
    })
  }

  const handleConfirmDeleteJob = async () => {
    if (!pendingDeleteJob) return
    const { jobId } = pendingDeleteJob
    await deleteJobMutation.mutateAsync({ request: { jobId } })
    setPendingDeleteJob(null)
    onEvent(componentEvents.EMPLOYEE_JOB_DELETED, { jobId })
  }

  return (
    <section className={classNames(styles.container, className)}>
      <BaseLayout>
        <Flex flexDirection="column" gap={24}>
          {primaryJob && (
            <PrimaryJobCard
              job={primaryJob}
              isPrimary={true}
              onEdit={handleEditCompensation}
              onCancelPendingChange={change => {
                setPendingChange(change)
              }}
              onAddJob={
                isEligibleForAdditionalJobs && secondaryJobs.length === 0 ? handleAddJob : undefined
              }
            />
          )}

          {secondaryJobs.length > 0 && (
            <SecondaryJobsSection
              jobs={secondaryJobs}
              onEdit={handleEditCompensation}
              onDelete={job => {
                setPendingDeleteJob({ jobId: job.uuid, jobTitle: job.title ?? '' })
              }}
              onCancelPendingChange={change => {
                setPendingChange(change)
              }}
              onAddJob={isEligibleForAdditionalJobs ? handleAddJob : undefined}
            />
          )}
        </Flex>
      </BaseLayout>

      <CancelChangeDialog
        pendingChange={pendingChange}
        isPrimaryActionLoading={deleteCompensationMutation.isPending}
        onClose={() => {
          setPendingChange(null)
        }}
        onConfirm={() => {
          void handleConfirmCancelChange()
        }}
      />
      <DeleteJobDialog
        pendingDeleteJob={pendingDeleteJob}
        isPrimaryActionLoading={deleteJobMutation.isPending}
        onClose={() => {
          setPendingDeleteJob(null)
        }}
        onConfirm={() => {
          void handleConfirmDeleteJob()
        }}
      />
    </section>
  )
}

interface PrimaryJobCardProps {
  job: Job
  isPrimary: boolean
  onEdit: (jobId: string, compensationId: string) => void
  onCancelPendingChange: (change: PendingCompensationChange) => void
  onAddJob?: () => void
}

function PrimaryJobCard({
  job,
  isPrimary,
  onEdit,
  onCancelPendingChange,
  onAddJob,
}: PrimaryJobCardProps) {
  const { t } = useTranslation('Employee.Compensation')
  const Components = useComponentContext()
  const formatPayRate = useFormatPayRate()

  const currentComp = findCurrentCompensation(job)
  const pendingComp = findPendingFutureCompensation(job)

  if (!currentComp) return null

  const displayTitle = currentComp.title || job.title || ''
  const rate = Number(currentComp.rate ?? 0)
  const paymentUnit = currentComp.paymentUnit ?? job.paymentUnit ?? ''

  return (
    <Components.Box
      header={
        <Components.BoxHeader
          title={isPrimary ? t('management.primaryJobLabel') : displayTitle}
          action={
            <Components.Button
              variant="secondary"
              onClick={() => {
                onEdit(job.uuid, currentComp.uuid)
              }}
            >
              {t('management.editCompensationCta')}
            </Components.Button>
          }
        />
      }
    >
      <Flex flexDirection="column" gap={16}>
        <Flex flexDirection="column" gap={12}>
          <Field label={t('management.jobColumn')} value={displayTitle} Components={Components} />
          <Field
            label={t('management.typeColumn')}
            value={currentComp.flsaStatus ? t(`flsaStatusLabels.${currentComp.flsaStatus}`) : '-'}
            Components={Components}
          />
          <Field
            label={t('management.rateColumn')}
            value={paymentUnit ? formatPayRate(rate, paymentUnit) : String(rate)}
            Components={Components}
          />
          {currentComp.effectiveDate && (
            <Field
              label={t('management.effectiveDateColumn')}
              value={formatDateLongWithYear(currentComp.effectiveDate) || currentComp.effectiveDate}
              Components={Components}
            />
          )}
        </Flex>

        {pendingComp && (
          <PendingChangeBanner
            compensation={pendingComp}
            jobTitle={displayTitle}
            onCancel={() => {
              onCancelPendingChange({
                compensationId: pendingComp.uuid,
                effectiveDate: pendingComp.effectiveDate ?? '',
                jobTitle: displayTitle,
              })
            }}
          />
        )}

        {onAddJob && (
          <Components.Button variant="secondary" onClick={onAddJob} icon={<PlusCircleIcon />}>
            {t('management.addAnotherJobCta')}
          </Components.Button>
        )}
      </Flex>
    </Components.Box>
  )
}

interface FieldProps {
  label: string
  value: string
  Components: ReturnType<typeof useComponentContext>
}

function Field({ label, value, Components }: FieldProps) {
  return (
    <Flex flexDirection="column" gap={0}>
      <Components.Text variant="supporting">{label}</Components.Text>
      <Components.Text>{value}</Components.Text>
    </Flex>
  )
}

interface PendingChangeBannerProps {
  compensation: Compensation
  jobTitle: string
  onCancel: () => void
}

function PendingChangeBanner({ compensation, onCancel }: PendingChangeBannerProps) {
  const { t } = useTranslation('Employee.Compensation')
  const Components = useComponentContext()

  const date = compensation.effectiveDate
    ? formatDateLongWithYear(compensation.effectiveDate) || compensation.effectiveDate
    : ''

  return (
    <Components.Alert status="info" label={t('management.pendingChange.banner', { date })}>
      <Components.Button variant="tertiary" onClick={onCancel}>
        {t('management.pendingChange.cancelCta')}
      </Components.Button>
    </Components.Alert>
  )
}

interface SecondaryJobsSectionProps {
  jobs: Job[]
  onEdit: (jobId: string, compensationId: string) => void
  onDelete: (job: Job) => void
  onCancelPendingChange: (change: PendingCompensationChange) => void
  onAddJob?: () => void
}

function SecondaryJobsSection({
  jobs,
  onEdit,
  onDelete,
  onCancelPendingChange,
  onAddJob,
}: SecondaryJobsSectionProps) {
  const { t } = useTranslation('Employee.Compensation')
  const Components = useComponentContext()
  const formatPayRate = useFormatPayRate()

  const dataViewProps = useDataView({
    data: jobs,
    columns: [
      {
        key: 'title',
        title: t('management.jobColumn'),
        render: (job: Job) => {
          const currentComp = findCurrentCompensation(job)
          return currentComp?.title || job.title || ''
        },
      },
      {
        key: 'rate',
        title: t('management.rateColumn'),
        render: (job: Job) => {
          const currentComp = findCurrentCompensation(job)
          if (!currentComp) return ''
          const rate = Number(currentComp.rate ?? 0)
          const paymentUnit = currentComp.paymentUnit ?? job.paymentUnit ?? ''
          return paymentUnit ? formatPayRate(rate, paymentUnit) : String(rate)
        },
      },
      {
        key: 'effectiveDate',
        title: t('management.effectiveDateColumn'),
        render: (job: Job) => {
          const currentComp = findCurrentCompensation(job)
          if (!currentComp?.effectiveDate) return ''
          return formatDateLongWithYear(currentComp.effectiveDate) || currentComp.effectiveDate
        },
      },
    ],
    itemMenu: (job: Job) => {
      const currentComp = findCurrentCompensation(job)
      return (
        <HamburgerMenu
          triggerLabel={t('management.hamburgerTitle')}
          items={[
            {
              label: t('management.editCompensationCta'),
              icon: <PencilSvg aria-hidden />,
              onClick: () => {
                if (currentComp) onEdit(job.uuid, currentComp.uuid)
              },
            },
            {
              label: t('management.deleteJobCta'),
              icon: <TrashCanSvg aria-hidden />,
              onClick: () => {
                onDelete(job)
              },
            },
          ]}
        />
      )
    },
  })

  const pendingChanges = jobs
    .map(job => {
      const pendingComp = findPendingFutureCompensation(job)
      if (!pendingComp) return null
      const currentComp = findCurrentCompensation(job)
      return {
        jobId: job.uuid,
        compensation: pendingComp,
        jobTitle: currentComp?.title || job.title || '',
      }
    })
    .filter(<T,>(c: T | null): c is T => c !== null)

  return (
    <Components.Box
      header={
        <Components.BoxHeader
          title={t('management.secondaryJobsTitle')}
          action={
            onAddJob && (
              <Components.Button variant="secondary" onClick={onAddJob} icon={<PlusCircleIcon />}>
                {t('management.addAnotherJobCta')}
              </Components.Button>
            )
          }
        />
      }
    >
      <Flex flexDirection="column" gap={16}>
        <DataView label={t('management.secondaryJobsTableLabel')} isWithinBox {...dataViewProps} />
        {pendingChanges.map(({ jobId, compensation, jobTitle }) => (
          <PendingChangeBanner
            key={`${jobId}:${compensation.uuid}`}
            compensation={compensation}
            jobTitle={jobTitle}
            onCancel={() => {
              onCancelPendingChange({
                compensationId: compensation.uuid,
                effectiveDate: compensation.effectiveDate ?? '',
                jobTitle,
              })
            }}
          />
        ))}
      </Flex>
    </Components.Box>
  )
}
