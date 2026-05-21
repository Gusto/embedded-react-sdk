import type { TaxFiling, TaxFilingStatus } from './types'
import styles from './TaxFilingsFlow.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'

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
        <Button variant="secondary" onClick={onBack}>
          ← Back to filings
        </Button>
      </div>

      <Flex flexDirection="column" gap={4}>
        <div className={styles.detailHeader}>
          <Heading as="h2">{filing.form_name}</Heading>
          <Badge status={STATUS_BADGE_VARIANTS[filing.status]} className={styles.statusBadgeLg}>
            {STATUS_LABELS[filing.status]}
          </Badge>
          {filing.is_amendment && <Badge status="info">Amended</Badge>}
        </div>
        <Text variant="supporting">{filing.form_title}</Text>
      </Flex>

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
            description: filing.filed_at ? formatDateTime(filing.filed_at) : '—',
          },
          {
            term: 'Last Updated',
            description: formatDateTime(filing.status_updated_at),
          },
        ]}
      />

      {filing.document_uuid && (
        <Box>
          <BoxHeader title="Filed Document" />
          <div className={styles.documentRow}>
            <Text size="sm">The signed filing package is available for download.</Text>
            <Link href={`#download-${filing.document_uuid}`}>Download PDF</Link>
          </div>
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

      <Flex flexDirection="column" gap={16}>
        <Heading as="h3">Status History</Heading>
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
      </Flex>
    </Flex>
  )
}
