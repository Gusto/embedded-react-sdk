import { useTranslation } from 'react-i18next'
import type {
  CompensationHistoryEntry,
  CompensationHistoryStatus,
  JobCompensationHistory,
} from '../../shared/getCompensationHistory'
import { parseRate } from '../../shared/parseRate'
import { Flex } from '@/components/Common/Flex/Flex'
import {
  ActionsLayout,
  DataView,
  EmptyData,
  Loading,
  useDataView,
  VisuallyHidden,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { useFormatCompensationRate } from '@/helpers/formattedStrings'
import { useI18n } from '@/i18n'

type StatusBadge = {
  status: 'success' | 'info'
  labelKey: 'history.statusLabels.current' | 'history.statusLabels.upcoming'
}

const statusBadgeMap = {
  current: { status: 'success', labelKey: 'history.statusLabels.current' },
  upcoming: { status: 'info', labelKey: 'history.statusLabels.upcoming' },
  past: null,
} as const satisfies Record<CompensationHistoryStatus, StatusBadge | null>

/**
 * Props for {@link CompensationHistoryPresentation}.
 *
 * @internal
 */
export interface CompensationHistoryPresentationProps {
  /** Per-job history to render; ignored while `isLoading` is set. */
  jobs: JobCompensationHistory[]
  /** Whether to render the in-place loading indicator instead of the tables. */
  isLoading?: boolean
  /** Invoked when the "Back" CTA is clicked. */
  onBack: () => void
}

/**
 * Presentational compensation history: one table per job, newest effective date first.
 *
 * @remarks
 * Takes already-derived history and renders it. All data fetching, feature
 * gating, and event emission live in {@link CompensationHistory}. Past rows are
 * unbadged; the badge column header is visually hidden because only the current
 * and upcoming rows carry a badge.
 *
 * @param props - See {@link CompensationHistoryPresentationProps}.
 * @returns The rendered history tables.
 * @internal
 */
export function CompensationHistoryPresentation({
  jobs,
  isLoading = false,
  onBack,
}: CompensationHistoryPresentationProps) {
  useI18n('Employee.Management.Compensation')
  const { t } = useTranslation('Employee.Management.Compensation')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={16}>
        <Components.Heading as="h2">{t('history.title')}</Components.Heading>
        {isLoading ? (
          <Loading />
        ) : jobs.length === 0 ? (
          <EmptyData
            title={t('history.emptyState.title')}
            description={t('history.emptyState.description')}
          />
        ) : (
          <Flex flexDirection="column" gap={32}>
            {jobs.map(job => (
              <JobHistorySection key={job.jobId} job={job} />
            ))}
          </Flex>
        )}
      </Flex>
      <ActionsLayout>
        <Components.Button variant="secondary" onClick={onBack}>
          {t('history.backCta')}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}

function JobHistorySection({ job }: { job: JobCompensationHistory }) {
  const { t } = useTranslation('Employee.Management.Compensation')
  const Components = useComponentContext()
  const dateFormatter = useDateFormatter()
  const formatCompensationRate = useFormatCompensationRate()

  const dataViewProps = useDataView<CompensationHistoryEntry>({
    data: job.entries,
    columns: [
      {
        key: 'effectiveDate',
        title: t('history.columns.effectiveDate'),
        render: entry => dateFormatter.formatLongWithYear(entry.effectiveDate),
      },
      {
        key: 'title',
        title: t('history.columns.jobTitle'),
        render: entry => entry.title ?? '-',
      },
      {
        key: 'flsaStatus',
        title: t('history.columns.employeeType'),
        render: entry => (entry.flsaStatus ? t(`flsaStatusLabels.${entry.flsaStatus}`) : '-'),
      },
      {
        key: 'rate',
        title: t('history.columns.wage'),
        render: entry => {
          const rate = parseRate(entry.rate)
          if (!entry.paymentUnit || rate === null) return '-'
          return formatCompensationRate(rate, entry.paymentUnit)
        },
      },
      {
        key: 'status',
        title: <VisuallyHidden>{t('history.columns.status')}</VisuallyHidden>,
        render: entry => {
          const badge = statusBadgeMap[entry.status]
          if (!badge) return null
          return <Components.Badge status={badge.status}>{t(badge.labelKey)}</Components.Badge>
        },
      },
    ],
  })

  return (
    <Flex flexDirection="column" gap={16}>
      <Components.Heading as="h3">{job.jobTitle}</Components.Heading>
      <DataView label={t('history.tableLabel', { jobTitle: job.jobTitle })} {...dataViewProps} />
    </Flex>
  )
}
