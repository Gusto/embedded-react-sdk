import { useState, useMemo } from 'react'
import type { AgentPayment, AgentPaymentStatus } from './types'
import { deriveAgentPaymentStatus } from './types'
import styles from './AgentPaymentsFlow.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import SearchIcon from '@/assets/icons/search-lg.svg?react'
import CaretDownIcon from '@/assets/icons/caret-down.svg?react'

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

function formatUSD(amount: string): string {
  const num = parseFloat(amount)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num)
}

type SortKey = 'agent_name' | 'payment_type' | 'due_date' | 'amount' | 'status'
type SortDir = 'asc' | 'desc'

interface AgentPaymentsListProps {
  payments: AgentPayment[]
  onSelectPayment: (uuid: string) => void
}

export function AgentPaymentsList({ payments, onSelectPayment }: AgentPaymentsListProps) {
  const { Alert, Badge, Button, ComboBox, Table, Text, TextInput, Heading } = useComponentContext()

  const today = new Date().toISOString().slice(0, 10)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterPaymentType, setFilterPaymentType] = useState<string>('')
  const [sortKey, setSortKey] = useState<SortKey>('due_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const paymentsWithStatus = useMemo(
    () =>
      payments.map(p => ({
        payment: p,
        status: deriveAgentPaymentStatus(p, today),
      })),
    [payments, today],
  )

  const overduePayments = paymentsWithStatus
    .filter(({ status }) => status === 'overdue')
    .map(({ payment }) => payment)

  const paymentTypeOptions = useMemo(() => {
    const seen = new Set<string>()
    const options = [{ value: '', label: 'All types' }]
    for (const { payment } of paymentsWithStatus) {
      if (!seen.has(payment.payment_type)) {
        seen.add(payment.payment_type)
        options.push({ value: payment.payment_type, label: payment.payment_type })
      }
    }
    return options
  }, [paymentsWithStatus])

  const statusOptions = [
    { value: '', label: 'All statuses' },
    ...(['draft', 'pending', 'paid', 'overdue', 'refunded'] as const).map(s => ({
      value: s,
      label: STATUS_LABELS[s],
    })),
  ]

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let result = paymentsWithStatus.filter(({ payment, status }) => {
      if (filterStatus && status !== filterStatus) return false
      if (filterPaymentType && payment.payment_type !== filterPaymentType) return false
      if (
        q &&
        !payment.agent_name.toLowerCase().includes(q) &&
        !payment.description.toLowerCase().includes(q)
      )
        return false
      return true
    })

    result = [...result].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'agent_name') cmp = a.payment.agent_name.localeCompare(b.payment.agent_name)
      else if (sortKey === 'payment_type')
        cmp = a.payment.payment_type.localeCompare(b.payment.payment_type)
      else if (sortKey === 'due_date') cmp = a.payment.due_date.localeCompare(b.payment.due_date)
      else if (sortKey === 'amount')
        cmp = parseFloat(a.payment.amount) - parseFloat(b.payment.amount)
      else cmp = a.status.localeCompare(b.status)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [paymentsWithStatus, search, filterStatus, filterPaymentType, sortKey, sortDir])

  const sortHeader = (label: string, key: SortKey) => {
    const isActive = sortKey === key
    return (
      <button
        type="button"
        onClick={() => {
          handleSort(key)
        }}
        className={styles.sortButton}
        aria-label={`${label}, sort ${isActive ? (sortDir === 'asc' ? 'descending' : 'ascending') : 'ascending'}`}
      >
        {label}
        <CaretDownIcon
          aria-hidden
          className={styles.sortIcon}
          data-active={isActive || undefined}
          data-dir={isActive ? sortDir : undefined}
        />
      </button>
    )
  }

  const tableRows = filtered.map(({ payment, status }) => ({
    key: payment.uuid,
    data: [
      {
        key: 'agent',
        content: <span className={styles.agentName}>{payment.agent_name}</span>,
      },
      {
        key: 'type',
        content: (
          <Text as="span" size="sm" variant="supporting">
            {payment.payment_type}
          </Text>
        ),
      },
      {
        key: 'description',
        content: (
          <Text as="span" size="sm" variant="supporting">
            {payment.description}
          </Text>
        ),
      },
      {
        key: 'due_date',
        content: (
          <Text as="span" size="sm" variant="supporting">
            {new Date(payment.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        ),
      },
      {
        key: 'amount',
        content: (
          <Text as="span" size="sm" variant="supporting">
            {formatUSD(payment.amount)}
          </Text>
        ),
      },
      {
        key: 'status',
        content: (
          <Badge status={STATUS_BADGE_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
        ),
      },
      {
        key: 'action',
        content: (
          <Button
            variant="secondary"
            onClick={() => {
              onSelectPayment(payment.uuid)
            }}
          >
            View
          </Button>
        ),
      },
    ],
  }))

  return (
    <Flex flexDirection="column" gap={24}>
      <Heading as="h2">Agent Payments</Heading>

      {overduePayments.length > 0 && (
        <Alert
          status="warning"
          label={`${overduePayments.length} payment${overduePayments.length > 1 ? 's' : ''} overdue`}
        >
          <Text size="sm">
            {overduePayments.map((p, i) => (
              <span key={p.uuid}>
                {i > 0 && ', '}
                <button
                  type="button"
                  className={styles.alertLink}
                  onClick={() => {
                    onSelectPayment(p.uuid)
                  }}
                >
                  {p.agent_name} (due{' '}
                  {new Date(p.due_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  )
                </button>
              </span>
            ))}{' '}
            {overduePayments.length === 1 ? 'is' : 'are'} past due and may require immediate
            attention.
          </Text>
        </Alert>
      )}

      <div className={styles.searchRow}>
        <TextInput
          label="Search payments"
          shouldVisuallyHideLabel
          placeholder="Search by agency or description..."
          value={search}
          onChange={setSearch}
          type="search"
          adornmentStart={<SearchIcon aria-hidden />}
        />
      </div>

      <div className={styles.filterRow}>
        <ComboBox
          label="Payment type"
          shouldVisuallyHideLabel
          placeholder="All types"
          options={paymentTypeOptions}
          value={filterPaymentType}
          onChange={setFilterPaymentType}
        />
        <ComboBox
          label="Status"
          shouldVisuallyHideLabel
          placeholder="All statuses"
          options={statusOptions}
          value={filterStatus}
          onChange={setFilterStatus}
        />
      </div>

      <Table
        aria-label="Agent payments"
        headers={[
          { key: 'agent', content: sortHeader('Agent', 'agent_name') },
          { key: 'type', content: sortHeader('Type', 'payment_type') },
          { key: 'description', content: 'Description' },
          { key: 'due_date', content: sortHeader('Due Date', 'due_date') },
          { key: 'amount', content: sortHeader('Amount', 'amount') },
          { key: 'status', content: sortHeader('Status', 'status') },
          { key: 'action', content: '' },
        ]}
        rows={tableRows}
        emptyState={
          <Text variant="supporting" size="sm">
            No payments match your filters.
          </Text>
        }
      />
    </Flex>
  )
}
