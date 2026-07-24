import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTaxRateManagement, type TaxRateKeyGroup } from './context'
import { extractRequirementColumns, toHistoryRows, type HistoryRow } from './toHistoryRows'
import { AddRateAction } from './AddRateAction'
import { DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'

interface TaxRateHistorySectionProps {
  group: TaxRateKeyGroup
  /**
   * Whether to render this group's own heading + "Add tax rate" button.
   *
   * @remarks
   * Set to `false` when this is the only group for the state — the page-level header already
   * carries the title and the single add-rate action, so a repeated per-group header would be
   * redundant.
   *
   * @defaultValue `true`
   */
  showHeader?: boolean
}

type BadgeStatus = 'success' | 'info' | 'warning'

const statusBadgeMap = {
  current: 'success',
  scheduled: 'info',
  historical: 'warning',
} as const satisfies Record<HistoryRow['status'], BadgeStatus>

const statusLabelKeyMap = {
  current: 'currentBadge',
  scheduled: 'scheduledBadge',
  historical: 'historicalBadge',
} as const satisfies Record<HistoryRow['status'], string>

/** @internal */
export function TaxRateHistorySection({ group, showHeader = true }: TaxRateHistorySectionProps) {
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'manageRates' })
  const Components = useComponentContext()
  const dateFormatter = useDateFormatter()
  const { state } = useTaxRateManagement()

  const rows = useMemo(() => toHistoryRows(group.sets), [group.sets])
  const requirementColumns = useMemo(() => extractRequirementColumns(group.sets), [group.sets])

  const sectionLabel = group.label ?? group.key

  const { ...dataViewProps } = useDataView<HistoryRow>({
    data: rows,
    columns: [
      {
        key: 'effectiveFrom',
        title: t('effectiveDateColumnLabel'),
        render: row => dateFormatter.formatLongWithYear(row.effectiveFrom),
      },
      {
        key: 'status',
        title: '',
        render: row => (
          <Components.Badge status={statusBadgeMap[row.status]}>
            {t(statusLabelKeyMap[row.status])}
          </Components.Badge>
        ),
      },
      ...requirementColumns.map(column => ({
        key: column.key,
        title: column.label ?? column.key,
        render: (row: HistoryRow) => row.values[column.key] ?? '',
      })),
    ],
    emptyState: () => (
      <EmptyData title={t('emptyHistoryTitle')} description={t('emptyHistoryDescription')} />
    ),
  })

  return (
    <section aria-label={sectionLabel}>
      <Flex flexDirection="column" gap={16} alignItems="stretch">
        {showHeader && (
          <Flex justifyContent="space-between" alignItems="center" gap={16}>
            <Components.Heading as="h3">{sectionLabel}</Components.Heading>
            <AddRateAction state={state} group={group} />
          </Flex>
        )}
        <DataView label={sectionLabel} {...dataViewProps} />
      </Flex>
    </section>
  )
}
