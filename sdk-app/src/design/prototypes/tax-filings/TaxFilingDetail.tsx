import type { TaxFiling, TaxFilingStatus } from './types'
import styles from './TaxFilingsFlow.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import CaretLeftIcon from '@/assets/icons/caret-left.svg?react'

const STATUS_LABELS: Record<TaxFilingStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  accepted: 'Accepted',
  failed: 'Failed',
}

const STATUS_BADGE_VARIANTS: Record<TaxFilingStatus, 'info' | 'warning' | 'success' | 'error'> = {
  not_started: 'info',
  in_progress: 'warning',
  accepted: 'success',
  failed: 'error',
}

const FAILURE_CATEGORY_LABELS: Record<string, string> = {
  missing_agency_account: 'Missing Agency Account',
  invalid_tax_id: 'Invalid Tax ID',
  missing_payment: 'Missing Payment',
  agency_rejected: 'Rejected by Agency',
  calculation_error: 'Calculation Error',
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

function formatRelative(iso: string): string {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000
  const abs = Math.abs(diff)
  if (abs < 60) return rtf.format(Math.round(diff), 'second')
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  if (abs < 2592000) return rtf.format(Math.round(diff / 86400), 'day')
  if (abs < 31536000) return rtf.format(Math.round(diff / 2592000), 'month')
  return rtf.format(Math.round(diff / 31536000), 'year')
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDateTimeWithRelative(iso: string): string {
  return `${formatRelative(iso)} — ${formatDateTime(iso)}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

interface TaxFilingDetailProps {
  filing: TaxFiling
  onBack: () => void
}

export function TaxFilingDetail({ filing, onBack }: TaxFilingDetailProps) {
  const { Alert, Badge, Button, DescriptionList, Heading, Text, Box, BoxHeader, Link } =
    useComponentContext()

  return (
    <Flex flexDirection="column" gap={24}>
      <div>
        <Button variant="secondary" icon={<CaretLeftIcon aria-hidden="true" />} onClick={onBack}>
          Back to filings
        </Button>
      </div>

      <Box
        header={
          <BoxHeader
            headingLevel="h2"
            title={
              <div className={styles.detailHeader}>
                <span>{filing.form_name}</span>
                <div className={styles.detailHeaderBadges}>
                  <Badge
                    status={STATUS_BADGE_VARIANTS[filing.status]}
                    className={styles.statusBadgeLg}
                  >
                    {STATUS_LABELS[filing.status]}
                  </Badge>
                  {filing.is_amendment && <Badge status="info">Amended</Badge>}
                </div>
              </div>
            }
            description={filing.form_title}
          />
        }
      >
        <DescriptionList
          layout="horizontal"
          items={[
            {
              term: 'Agency',
              description: filing.agency_name,
            },
            {
              term: 'Jurisdiction',
              description: filing.jurisdiction,
            },
            {
              term: 'Period',
              description: `${filing.period} (${formatDate(filing.period_start)} – ${formatDate(filing.period_end)})`,
            },
            {
              term: 'Due Date',
              description: formatDate(filing.due_date),
            },
            {
              term: 'Filed',
              description: filing.filed_at ? formatDateTimeWithRelative(filing.filed_at) : '—',
            },
            {
              term: 'Last Updated',
              description: formatDateTimeWithRelative(filing.status_updated_at),
            },
          ]}
        />
      </Box>

      {filing.document_uuid && (
        <Box
          header={<BoxHeader title="Filing Package" />}
          footer={
            <Button
              variant="secondary"
              onClick={() => {
                window.location.hash = `download-${filing.document_uuid}`
              }}
            >
              Download PDF
            </Button>
          }
        >
          <Flex flexDirection="row" gap={8} justifyContent="space-between" alignItems="center">
            <Text size="sm" variant="supporting">
              The signed filing package is available for download.
            </Text>
          </Flex>
        </Box>
      )}

      {filing.failure_reason && (
        <Alert
          status="error"
          label={
            FAILURE_CATEGORY_LABELS[filing.failure_reason.category] ??
            filing.failure_reason.category
          }
        >
          <Flex flexDirection="column" gap={8}>
            <Text size="sm">{filing.failure_reason.description}</Text>
            <Flex flexDirection="column" gap={4}>
              <Text size="sm" weight="semibold">
                Next step:
              </Text>
              <Text size="sm">{filing.failure_reason.next_step}</Text>
              {filing.failure_reason.next_step_url && (
                <Link href={filing.failure_reason.next_step_url}>Take action →</Link>
              )}
            </Flex>
          </Flex>
        </Alert>
      )}

      <Box header={<BoxHeader title="Status History" />}>
        <div className={styles.timeline}>
          {[...filing.status_history].reverse().map((entry, idx) => (
            <div key={idx} className={styles.timelineEntry}>
              <div className={styles.timelineDot} data-status={entry.status} />
              <div className={styles.timelineContent}>
                <div className={styles.timelineRow}>
                  <Badge status={STATUS_BADGE_VARIANTS[entry.status]}>
                    {STATUS_LABELS[entry.status]}
                  </Badge>
                  <Text size="sm" variant="supporting">
                    {formatDateTime(entry.changed_at)}
                  </Text>
                </div>
                {entry.failure_reason && (
                  <Text size="sm" variant="supporting" className={styles.timelineReason}>
                    {entry.failure_reason.description}
                  </Text>
                )}
              </div>
            </div>
          ))}
        </div>
      </Box>
    </Flex>
  )
}
