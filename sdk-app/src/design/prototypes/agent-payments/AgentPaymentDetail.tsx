import type { AgentPayment, AgentPaymentStatus, TaxLiabilityPaymentState } from './types'
import { deriveAgentPaymentStatus } from './types'
import styles from './AgentPaymentsFlow.module.scss'
import { InfoTooltip } from '../shared/InfoTooltip'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
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
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    parseFloat(amount),
  )
}

interface AgentPaymentDetailProps {
  payment: AgentPayment
  onBack: () => void
}

export function AgentPaymentDetail({ payment, onBack }: AgentPaymentDetailProps) {
  const { Alert, Badge, Box, BoxHeader, Button, DescriptionList, Table, Text } =
    useComponentContext()

  const status = deriveAgentPaymentStatus(payment, TODAY)
  const liabilities = payment.tax_liabilities ?? []

  return (
    <Flex flexDirection="column" gap={24}>
      <div>
        <Button variant="secondary" icon={<CaretLeftIcon aria-hidden="true" />} onClick={onBack}>
          Back to payments
        </Button>
      </div>

      <Box
        header={
          <BoxHeader
            headingLevel="h2"
            title={
              <div className={styles.detailHeader}>
                <span>{payment.agent_name}</span>
                <Badge status={STATUS_BADGE_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
              </div>
            }
            description={payment.payment_type}
          />
        }
      >
        <DescriptionList
          layout="horizontal"
          items={[
            { term: 'Description', description: payment.description },
            { term: 'Due Date', description: formatDate(payment.due_date) },
            {
              term: 'Paid',
              description: payment.paid_at ? formatDateTimeWithRelative(payment.paid_at) : '—',
            },
            { term: 'Amount', description: formatUSD(payment.amount) },
          ]}
        />
      </Box>

      {status === 'overdue' && (
        <Alert status="warning" label="Payment overdue">
          <Text size="sm">
            This payment was due on {formatDate(payment.due_date)} and has not been paid.
          </Text>
        </Alert>
      )}

      {liabilities.length > 0 && (
        <Box
          header={
            <BoxHeader
              title="Tax Liabilities"
              description="The individual tax components that make up this payment, grouped by payroll run. Multiple payrolls may contribute to a single deposit depending on the tax frequency."
            />
          }
        >
          <Table
            aria-label="Tax liabilities"
            isWithinBox
            headers={[
              { key: 'description', content: 'Tax Description' },
              { key: 'check_date', content: 'Check Date' },
              {
                key: 'payroll',
                content: (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Payroll
                    <InfoTooltip>
                      The unique ID of the payroll run that generated this tax liability. One
                      payment may include liabilities from multiple payroll runs.
                    </InfoTooltip>
                  </span>
                ),
              },
              { key: 'amount', content: 'Amount' },
              { key: 'state', content: 'State' },
            ]}
            rows={liabilities.map((l, i) => ({
              key: String(i),
              data: [
                {
                  key: 'description',
                  content: <span className={styles.formName}>{l.tax_description}</span>,
                },
                {
                  key: 'check_date',
                  content: (
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
                  key: 'payroll',
                  content: (
                    <Text as="span" size="sm" variant="supporting">
                      {l.payroll_uuid.length > 12
                        ? `${l.payroll_uuid.slice(0, 8)}…${l.payroll_uuid.slice(-4)}`
                        : l.payroll_uuid}
                    </Text>
                  ),
                },
                {
                  key: 'amount',
                  content: (
                    <Text as="span" size="sm" variant="supporting">
                      {formatUSD(l.amount)}
                    </Text>
                  ),
                },
                {
                  key: 'state',
                  content: (
                    <Badge status={LIABILITY_STATE_VARIANTS[l.payment_state]}>
                      {LIABILITY_STATE_LABELS[l.payment_state]}
                    </Badge>
                  ),
                },
              ],
            }))}
          />
        </Box>
      )}
    </Flex>
  )
}
