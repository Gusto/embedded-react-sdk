import type { AgentPayment, AgentPaymentStatus, TaxLiabilityPaymentState } from './types'
import { deriveAgentPaymentStatus } from './types'
import styles from './AgentPaymentsFlow.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'

const STATUS_LABELS: Record<AgentPaymentStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  paid: 'Paid',
  overdue: 'Overdue',
  refunded: 'Refunded',
}

const STATUS_BADGE_VARIANTS: Record<
  AgentPaymentStatus,
  'info' | 'warning' | 'success' | 'error'
> = {
  draft: 'info',
  pending: 'warning',
  paid: 'success',
  overdue: 'error',
  refunded: 'info',
}

const LIABILITY_STATE_LABELS: Record<TaxLiabilityPaymentState, string> = {
  paid: 'Paid',
  pending: 'Pending',
  refunded: 'Refunded',
}

const LIABILITY_STATE_BADGE_VARIANTS: Record<
  TaxLiabilityPaymentState,
  'info' | 'warning' | 'success' | 'error'
> = {
  paid: 'success',
  pending: 'warning',
  refunded: 'info',
}

function formatUSD(amount: string): string {
  const num = parseFloat(amount)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num)
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

function formatDateTime(iso: string): string {
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function truncateUuid(uuid: string): string {
  if (uuid.length <= 13) return uuid
  return `${uuid.slice(0, 8)}…${uuid.slice(-4)}`
}

interface AgentPaymentDetailProps {
  payment: AgentPayment
  onBack: () => void
}

export function AgentPaymentDetail({ payment, onBack }: AgentPaymentDetailProps) {
  const { Alert, Badge, Button, DescriptionList, Heading, Text, Table } = useComponentContext()

  const today = new Date().toISOString().slice(0, 10)
  const status = deriveAgentPaymentStatus(payment, today)

  const liabilityRows = (payment.tax_liabilities ?? []).map((liability, idx) => ({
    key: `${liability.payroll_uuid}-${idx}`,
    data: [
      {
        key: 'tax_description',
        content: (
          <Text as="span" size="sm">
            {liability.tax_description}
          </Text>
        ),
      },
      {
        key: 'check_date',
        content: (
          <Text as="span" size="sm" variant="supporting">
            {formatDate(liability.check_date)}
          </Text>
        ),
      },
      {
        key: 'payroll_uuid',
        content: (
          <span className={styles.payrollUuid} title={liability.payroll_uuid}>
            {truncateUuid(liability.payroll_uuid)}
          </span>
        ),
      },
      {
        key: 'amount',
        content: (
          <Text as="span" size="sm" variant="supporting">
            {formatUSD(liability.amount)}
          </Text>
        ),
      },
      {
        key: 'state',
        content: (
          <Badge status={LIABILITY_STATE_BADGE_VARIANTS[liability.payment_state]}>
            {LIABILITY_STATE_LABELS[liability.payment_state]}
          </Badge>
        ),
      },
    ],
  }))

  return (
    <Flex flexDirection="column" gap={24}>
      <div>
        <Button variant="secondary" onClick={onBack}>
          ← Back to payments
        </Button>
      </div>

      <Flex flexDirection="column" gap={4}>
        <div className={styles.detailHeader}>
          <Heading as="h2">{payment.agent_name}</Heading>
          <Badge status={STATUS_BADGE_VARIANTS[status]} className={styles.statusBadgeLg}>
            {STATUS_LABELS[status]}
          </Badge>
        </div>
        <Text variant="supporting">{payment.payment_type}</Text>
      </Flex>

      {status === 'overdue' && (
        <Alert status="warning" label="Payment overdue">
          <Text size="sm">
            This payment was due on {formatDate(payment.due_date)} and has not been paid. Please
            take action to avoid penalties.
          </Text>
        </Alert>
      )}

      <DescriptionList
        layout="horizontal"
        items={[
          {
            term: 'Payment Type',
            description: payment.payment_type,
          },
          {
            term: 'Description',
            description: payment.description,
          },
          {
            term: 'Due Date',
            description: formatDate(payment.due_date),
          },
          {
            term: 'Paid',
            description: payment.paid_at ? formatDateTimeWithRelative(payment.paid_at) : '—',
          },
          {
            term: 'Amount',
            description: formatUSD(payment.amount),
          },
        ]}
      />

      {(payment.tax_liabilities ?? []).length > 0 && (
        <Flex flexDirection="column" gap={16}>
          <Heading as="h3">Tax Liabilities</Heading>
          <Table
            aria-label="Tax liabilities"
            headers={[
              { key: 'tax_description', content: 'Tax Description' },
              { key: 'check_date', content: 'Check Date' },
              { key: 'payroll_uuid', content: 'Payroll' },
              { key: 'amount', content: 'Amount' },
              { key: 'state', content: 'State' },
            ]}
            rows={liabilityRows}
            emptyState={
              <Text variant="supporting" size="sm">
                No tax liabilities.
              </Text>
            }
          />
        </Flex>
      )}
    </Flex>
  )
}
