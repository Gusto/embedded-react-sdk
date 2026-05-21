import type { AgentPayment, AgentPaymentStatus, TaxLiabilityPaymentState } from './types'
import { deriveAgentPaymentStatus } from './types'
import styles from './AgentPaymentsFlow.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, Flex, useDataView } from '@/components/Common'
import CaretLeftIcon from '@/assets/icons/caret-left.svg?react'

const TODAY = new Date().toISOString().slice(0, 10)

const STATUS_LABELS: Record<AgentPaymentStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  paid: 'Paid',
  overdue: 'Overdue',
  refunded: 'Refunded',
}

const STATUS_BADGE_VARIANTS: Record<AgentPaymentStatus, 'info' | 'warning' | 'success' | 'error'> =
  {
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

const LIABILITY_STATE_VARIANTS: Record<
  TaxLiabilityPaymentState,
  'info' | 'warning' | 'success' | 'error'
> = {
  paid: 'success',
  pending: 'warning',
  refunded: 'info',
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

function formatUSD(amount: string): string {
  const n = parseFloat(amount)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

interface AgentPaymentDetailProps {
  payment: AgentPayment
  onBack: () => void
}

export function AgentPaymentDetail({ payment, onBack }: AgentPaymentDetailProps) {
  const { Alert, Badge, Button, DescriptionList, Heading, Text } = useComponentContext()

  const status = deriveAgentPaymentStatus(payment, TODAY)

  const liabilityDataViewProps = useDataView({
    data: payment.tax_liabilities ?? [],
    columns: [
      {
        key: 'tax_description',
        title: 'Tax Description',
        render: l => <span className={styles.formName}>{l.tax_description}</span>,
      },
      {
        key: 'check_date',
        title: 'Check Date',
        render: l => (
          <Text as="span" size="sm" variant="supporting">
            {new Date(l.check_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        ),
      },
      {
        key: 'payroll_uuid',
        title: 'Payroll',
        render: l => (
          <Text as="span" size="sm" variant="supporting">
            {l.payroll_uuid.length > 12
              ? `${l.payroll_uuid.slice(0, 8)}…${l.payroll_uuid.slice(-4)}`
              : l.payroll_uuid}
          </Text>
        ),
      },
      {
        key: 'amount',
        title: 'Amount',
        render: l => (
          <Text as="span" size="sm" variant="supporting">
            {formatUSD(l.amount)}
          </Text>
        ),
      },
      {
        key: 'payment_state',
        title: 'State',
        render: l => (
          <Badge status={LIABILITY_STATE_VARIANTS[l.payment_state]}>
            {LIABILITY_STATE_LABELS[l.payment_state]}
          </Badge>
        ),
      },
    ],
    emptyState: () => (
      <Text size="sm" variant="supporting">
        No tax liabilities on record for this payment.
      </Text>
    ),
  })

  return (
    <Flex flexDirection="column" gap={24}>
      <div>
        <Button variant="tertiary" onClick={onBack}>
          <CaretLeftIcon aria-hidden />
          Back to payments
        </Button>
      </div>

      <Flex flexDirection="column" gap={4}>
        <div className={styles.detailHeader}>
          <Heading as="h2">{payment.agent_name}</Heading>
          <Badge status={STATUS_BADGE_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
        </div>
        <Text variant="supporting">{payment.payment_type}</Text>
      </Flex>

      {status === 'overdue' && (
        <Alert status="warning" label="Payment overdue">
          <Text size="sm">
            This payment was due on {formatDate(payment.due_date)} and has not been paid.
          </Text>
        </Alert>
      )}

      <DescriptionList
        layout="horizontal"
        items={[
          { term: 'Payment Type', description: payment.payment_type },
          { term: 'Description', description: payment.description },
          { term: 'Due Date', description: formatDate(payment.due_date) },
          {
            term: 'Paid',
            description: payment.paid_at ? formatDateTimeWithRelative(payment.paid_at) : '—',
          },
          { term: 'Amount', description: formatUSD(payment.amount) },
        ]}
      />

      <Flex flexDirection="column" gap={12}>
        <Heading as="h3">Tax Liabilities</Heading>
        <DataView label="Tax liabilities" {...liabilityDataViewProps} />
      </Flex>
    </Flex>
  )
}
