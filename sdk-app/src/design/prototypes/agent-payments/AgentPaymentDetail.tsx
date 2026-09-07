import type { TaxPayment, TaxPaymentStatus } from './types'
import { deriveTaxPaymentScope, deriveTaxPaymentStatus, FEDERAL_JURISDICTION } from './types'
import styles from './AgentPaymentsFlow.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'

const STATUS_LABELS: Record<TaxPaymentStatus, string> = {
  paid: 'Paid',
  scheduled: 'Scheduled',
  overdue: 'Overdue',
  refund: 'Refund / Credit',
}

const STATUS_BADGE_VARIANTS: Record<TaxPaymentStatus, 'info' | 'warning' | 'success' | 'error'> = {
  paid: 'success',
  scheduled: 'info',
  overdue: 'error',
  refund: 'info',
}

function formatUSD(amount: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(parseFloat(amount))
}

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
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
  payment: TaxPayment
  onBack: () => void
}

export function AgentPaymentDetail({ payment, onBack }: AgentPaymentDetailProps) {
  const { Alert, Badge, Button, DescriptionList, Heading, Text, Table } = useComponentContext()

  const today = new Date().toISOString().slice(0, 10)
  const status = deriveTaxPaymentStatus(payment, today)
  const scope = deriveTaxPaymentScope(payment)
  const lineItems = payment.line_items ?? []

  const scopeLabel =
    scope === 'federal'
      ? 'Federal'
      : `State${payment.jurisdiction === FEDERAL_JURISDICTION ? '' : ` · ${payment.jurisdiction}`}`

  const lineItemRows = lineItems.map((lineItem, index) => ({
    key: `${lineItem.payroll_uuid}-${index}`,
    data: [
      {
        key: 'unique_tax_id',
        content: (
          <Text as="span" size="sm">
            {lineItem.unique_tax_id}
          </Text>
        ),
      },
      {
        key: 'payroll_uuid',
        content: (
          <span className={styles.payrollUuid} title={lineItem.payroll_uuid}>
            {truncateUuid(lineItem.payroll_uuid)}
          </span>
        ),
      },
      {
        key: 'amount',
        content: (
          <Text as="span" size="sm" variant="supporting">
            {formatUSD(lineItem.amount)}
          </Text>
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
          <Heading as="h2">{payment.agency_name}</Heading>
          <Badge status={STATUS_BADGE_VARIANTS[status]} className={styles.statusBadgeLg}>
            {STATUS_LABELS[status]}
          </Badge>
        </div>
        <Text variant="supporting">{scopeLabel}</Text>
      </Flex>

      {status === 'overdue' && (
        <Alert status="warning" label="Payment overdue">
          <Text size="sm">
            This payment was due on {formatDate(payment.due_date)} and has not been sent. Please
            take action to avoid penalties.
          </Text>
        </Alert>
      )}

      <DescriptionList
        layout="horizontal"
        items={[
          {
            term: 'Jurisdiction',
            description: scopeLabel,
          },
          {
            term: 'Period',
            description: `${formatDate(payment.period_start)} – ${formatDate(payment.period_end)}`,
          },
          {
            term: 'Due Date',
            description: formatDate(payment.due_date),
          },
          {
            term: 'Payment Sent On',
            description: payment.payment_sent_on ? formatDate(payment.payment_sent_on) : '—',
          },
          {
            term: 'Amount',
            description: formatUSD(payment.amount),
          },
          {
            term: 'Amount Paid',
            description: formatUSD(payment.amount_paid),
          },
        ]}
      />

      {lineItems.length > 0 && (
        <Flex flexDirection="column" gap={16}>
          <Heading as="h3">Tax Liabilities</Heading>
          <Table
            aria-label="Tax liabilities"
            headers={[
              { key: 'unique_tax_id', content: 'Tax ID' },
              { key: 'payroll_uuid', content: 'Payroll' },
              { key: 'amount', content: 'Amount' },
            ]}
            rows={lineItemRows}
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
