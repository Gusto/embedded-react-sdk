import { useState, useMemo } from 'react'
import type { TaxPayment, TaxPaymentStatus } from './types'
import { deriveTaxPaymentStatus, FEDERAL_JURISDICTION } from './types'
import styles from './AgentPaymentsFlow.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { EmptyData, Flex } from '@/components/Common'
import SearchIcon from '@/assets/icons/search-lg.svg?react'
import CaretDownIcon from '@/assets/icons/caret-down.svg?react'

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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatPeriod(payment: TaxPayment): string {
  return `${formatDate(payment.period_start)} – ${formatDate(payment.period_end)}`
}

type SortKey = 'agency_name' | 'jurisdiction' | 'due_date' | 'amount' | 'status'
type SortDir = 'asc' | 'desc'

interface AgentPaymentsListProps {
  payments: TaxPayment[]
  onSelectPayment: (uuid: string) => void
}

export function AgentPaymentsList({ payments, onSelectPayment }: AgentPaymentsListProps) {
  const { Alert, Badge, Button, Select, Table, Text, TextInput, Heading } = useComponentContext()

  const today = new Date().toISOString().slice(0, 10)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterJurisdiction, setFilterJurisdiction] = useState<string>('')
  const [sortKey, setSortKey] = useState<SortKey>('due_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const paymentsWithStatus = useMemo(
    () =>
      payments.map(payment => ({
        payment,
        status: deriveTaxPaymentStatus(payment, today),
      })),
    [payments, today],
  )

  const overduePayments = paymentsWithStatus
    .filter(({ status }) => status === 'overdue')
    .map(({ payment }) => payment)

  const jurisdictionOptions = useMemo(() => {
    const seen = new Set<string>()
    const options = [{ value: '', label: 'All jurisdictions' }]
    for (const { payment } of paymentsWithStatus) {
      if (!seen.has(payment.jurisdiction)) {
        seen.add(payment.jurisdiction)
        options.push({
          value: payment.jurisdiction,
          label:
            payment.jurisdiction === FEDERAL_JURISDICTION ? 'Federal (US)' : payment.jurisdiction,
        })
      }
    }
    return options
  }, [paymentsWithStatus])

  const statusOptions = [
    { value: '', label: 'All statuses' },
    ...(['paid', 'scheduled', 'overdue', 'refund'] as const).map(status => ({
      value: status,
      label: STATUS_LABELS[status],
    })),
  ]

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(direction => (direction === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    const result = paymentsWithStatus.filter(({ payment, status }) => {
      if (filterStatus && status !== filterStatus) return false
      if (filterJurisdiction && payment.jurisdiction !== filterJurisdiction) return false
      if (query && !payment.agency_name.toLowerCase().includes(query)) return false
      return true
    })

    return [...result].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'agency_name')
        cmp = a.payment.agency_name.localeCompare(b.payment.agency_name)
      else if (sortKey === 'jurisdiction')
        cmp = a.payment.jurisdiction.localeCompare(b.payment.jurisdiction)
      else if (sortKey === 'due_date') cmp = a.payment.due_date.localeCompare(b.payment.due_date)
      else if (sortKey === 'amount')
        cmp = parseFloat(a.payment.amount) - parseFloat(b.payment.amount)
      else cmp = a.status.localeCompare(b.status)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [paymentsWithStatus, search, filterStatus, filterJurisdiction, sortKey, sortDir])

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
        key: 'agency',
        content: <span className={styles.agentName}>{payment.agency_name}</span>,
      },
      {
        key: 'jurisdiction',
        content: (
          <Text as="span" size="sm" variant="supporting">
            {payment.jurisdiction === FEDERAL_JURISDICTION
              ? 'Federal'
              : `State · ${payment.jurisdiction}`}
          </Text>
        ),
      },
      {
        key: 'period',
        content: (
          <Text as="span" size="sm" variant="supporting">
            {formatPeriod(payment)}
          </Text>
        ),
      },
      {
        key: 'due_date',
        content: (
          <Text as="span" size="sm" variant="supporting">
            {formatDate(payment.due_date)}
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
        content: <Badge status={STATUS_BADGE_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>,
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
            {overduePayments.map((payment, index) => (
              <span key={payment.uuid}>
                {index > 0 && ', '}
                <button
                  type="button"
                  className={styles.alertLink}
                  onClick={() => {
                    onSelectPayment(payment.uuid)
                  }}
                >
                  {payment.agency_name} (due {formatDate(payment.due_date)})
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
          placeholder="Search by agency..."
          value={search}
          onChange={setSearch}
          type="search"
          adornmentStart={<SearchIcon aria-hidden />}
        />
      </div>

      <div className={styles.filterRow}>
        <Select
          label="Jurisdiction"
          shouldVisuallyHideLabel
          placeholder="All jurisdictions"
          options={jurisdictionOptions}
          value={filterJurisdiction}
          onChange={setFilterJurisdiction}
        />
        <Select
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
          { key: 'agency', content: sortHeader('Agency', 'agency_name') },
          { key: 'jurisdiction', content: sortHeader('Jurisdiction', 'jurisdiction') },
          { key: 'period', content: 'Period' },
          { key: 'due_date', content: sortHeader('Due Date', 'due_date') },
          { key: 'amount', content: sortHeader('Amount', 'amount') },
          { key: 'status', content: sortHeader('Status', 'status') },
          { key: 'action', content: '' },
        ]}
        rows={tableRows}
        emptyState={<EmptyData title="No payments match your filters" />}
      />
    </Flex>
  )
}
