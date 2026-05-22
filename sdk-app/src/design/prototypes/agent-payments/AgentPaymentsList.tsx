import { useState, useMemo } from 'react'
import type { AgentPayment, AgentPaymentStatus } from './types'
import { deriveAgentPaymentStatus } from './types'
import type { FilterDef, FilterOption } from '../tax-filings/filterUtils'
import styles from './AgentPaymentsFlow.module.scss'
import { DataViewFilters } from '../tax-filings/DataViewFilters'
import { InfoTooltip } from '../shared/InfoTooltip'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, Flex, useDataView } from '@/components/Common'
import EyeIcon from '@/assets/icons/eye.svg?react'
import CaretDownIcon from '@/assets/icons/caret-down.svg?react'

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

const STATUS_ORDER: AgentPaymentStatus[] = ['overdue', 'pending', 'draft', 'paid', 'refunded']
const STATUS_OPTIONS: FilterOption[] = STATUS_ORDER.map(s => ({
  value: s,
  label: STATUS_LABELS[s],
}))

const TYPE_OPTIONS: FilterOption[] = [
  { value: 'Federal Tax', label: 'Federal Tax' },
  { value: 'State Tax', label: 'State Tax' },
]

type SortKey = 'agent_name' | 'due_date' | 'amount' | 'status'
type SortDir = 'asc' | 'desc'

interface AgentPaymentsListProps {
  payments: AgentPayment[]
  onSelectPayment: (uuid: string) => void
}

function formatUSD(amount: string): string {
  const n = parseFloat(amount)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function AgentPaymentsList({ payments, onSelectPayment }: AgentPaymentsListProps) {
  const { Alert, Badge, ButtonIcon, Text, Heading } = useComponentContext()

  const [search, setSearch] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('due_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const overduePayments = useMemo(
    () => payments.filter(p => deriveAgentPaymentStatus(p, TODAY) === 'overdue'),
    [payments],
  )

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
    const statusActive = selectedStatuses.length > 0
    const typesActive = selectedTypes.length > 0

    const result = payments.filter(p => {
      const status = deriveAgentPaymentStatus(p, TODAY)
      if (statusActive && !selectedStatuses.includes(status)) return false
      if (typesActive && !selectedTypes.includes(p.payment_type)) return false
      if (
        q &&
        !p.agent_name.toLowerCase().includes(q) &&
        !p.description.toLowerCase().includes(q)
      )
        return false
      return true
    })

    return [...result].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'agent_name') cmp = a.agent_name.localeCompare(b.agent_name)
      else if (sortKey === 'due_date') cmp = a.due_date.localeCompare(b.due_date)
      else if (sortKey === 'amount') cmp = parseFloat(a.amount) - parseFloat(b.amount)
      else
        cmp = deriveAgentPaymentStatus(a, TODAY).localeCompare(deriveAgentPaymentStatus(b, TODAY))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [payments, search, selectedStatuses, selectedTypes, sortKey, sortDir])

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

  const filterDefs: FilterDef[] = [
    {
      key: 'status',
      label: 'Status',
      options: STATUS_OPTIONS,
      selected: selectedStatuses,
      onChange: setSelectedStatuses,
    },
    {
      key: 'type',
      label: 'Type',
      options: TYPE_OPTIONS,
      selected: selectedTypes,
      onChange: setSelectedTypes,
    },
  ]

  const dataViewProps = useDataView<AgentPayment>({
    data: filtered,
    columns: [
      {
        key: 'agent_name',
        title: sortHeader('Agent', 'agent_name'),
        render: p => <span className={styles.formName}>{p.agent_name}</span>,
      },
      {
        key: 'payment_type',
        title: 'Type',
        render: p => (
          <Text as="span" size="sm" variant="supporting">
            {p.payment_type}
          </Text>
        ),
      },
      {
        key: 'description',
        title: 'Description',
        render: p => (
          <Text as="span" size="sm" variant="supporting">
            {p.description}
          </Text>
        ),
      },
      {
        key: 'due_date',
        title: sortHeader('Due date', 'due_date'),
        render: p => (
          <Text as="span" size="sm" variant="supporting">
            {new Date(p.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        ),
      },
      {
        key: 'amount',
        title: sortHeader('Amount', 'amount'),
        render: p => (
          <Text as="span" size="sm" variant="supporting">
            {formatUSD(p.amount)}
          </Text>
        ),
      },
      {
        key: 'status',
        title: (
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            {sortHeader('Status', 'status')}
            <InfoTooltip>
              <strong>Draft</strong> — scheduled but not yet submitted.{'\n'}
              <strong>Pending</strong> — submitted and awaiting confirmation.{'\n'}
              <strong>Paid</strong> — confirmed paid to the agency.{'\n'}
              <strong>Overdue</strong> — past the due date and unpaid.{'\n'}
              <strong>Refunded</strong> — a credit or reversal was applied.
            </InfoTooltip>
          </span>
        ),
        render: p => {
          const status = deriveAgentPaymentStatus(p, TODAY)
          return <Badge status={STATUS_BADGE_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
        },
      },
    ],
    itemMenu: p => (
      <ButtonIcon
        aria-label="View payment"
        variant="tertiary"
        onClick={() => {
          onSelectPayment(p.uuid)
        }}
      >
        <EyeIcon aria-hidden />
      </ButtonIcon>
    ),
    emptyState: () => (
      <Flex flexDirection="column" alignItems="center" gap={8}>
        <Text variant="supporting" size="sm">
          No payments match your filters.
        </Text>
      </Flex>
    ),
  })

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={8}>
        <Heading as="h2">Agent Payments</Heading>
        <Text variant="supporting" size="sm">
          Gusto collects and remits tax deposits to government agencies on your company&apos;s
          behalf. Each payment represents a tax deposit made or scheduled for a specific period.
        </Text>
      </Flex>

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
                  {p.agent_name} (due {new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
                </button>
              </span>
            ))}{' '}
            {overduePayments.length === 1 ? 'is' : 'are'} past due and may require immediate
            attention.
          </Text>
        </Alert>
      )}

      <DataViewFilters
        search={search}
        onSearchChange={setSearch}
        searchLabel="Search payments"
        searchPlaceholder="Search by agent or description..."
        filters={filterDefs}
        onClearAll={() => {
          setSelectedStatuses([])
          setSelectedTypes([])
        }}
      />

      <DataView label="Agent payments" {...dataViewProps} />
    </Flex>
  )
}
