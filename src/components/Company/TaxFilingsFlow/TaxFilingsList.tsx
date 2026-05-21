import { useState, useMemo } from 'react'
import type { TaxFiling, TaxFilingStatus } from './types'
import styles from './TaxFilingsFlow.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import SearchIcon from '@/assets/icons/search-lg.svg?react'
import CaretDownIcon from '@/assets/icons/caret-down.svg?react'

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

type SortKey = 'form_name' | 'period_start' | 'due_date' | 'status'
type SortDir = 'asc' | 'desc'

interface TaxFilingsListProps {
  filings: TaxFiling[]
  onSelectFiling: (uuid: string) => void
}

export function TaxFilingsList({ filings, onSelectFiling }: TaxFilingsListProps) {
  const { Alert, Badge, Button, ComboBox, Table, Text, TextInput, Heading } = useComponentContext()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterJurisdiction, setFilterJurisdiction] = useState<string>('')
  const [filterFormName, setFilterFormName] = useState<string>('')
  const [sortKey, setSortKey] = useState<SortKey>('period_start')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const failedFilings = filings.filter(f => f.status === 'failed')

  const jurisdictionOptions = useMemo(() => {
    const seen = new Set<string>()
    const options = [{ value: '', label: 'All jurisdictions' }]
    for (const f of filings) {
      if (!seen.has(f.jurisdiction)) {
        seen.add(f.jurisdiction)
        options.push({ value: f.jurisdiction, label: f.jurisdiction })
      }
    }
    return options
  }, [filings])

  const formNameOptions = useMemo(() => {
    const seen = new Set<string>()
    const options = [{ value: '', label: 'All form types' }]
    for (const f of filings) {
      if (!seen.has(f.form_name)) {
        seen.add(f.form_name)
        options.push({ value: f.form_name, label: f.form_name })
      }
    }
    return options
  }, [filings])

  const statusOptions = [
    { value: '', label: 'All statuses' },
    ...(['not_started', 'in_progress', 'accepted', 'failed'] as const).map(s => ({
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
    let result = filings.filter(f => {
      if (filterStatus && f.status !== filterStatus) return false
      if (filterJurisdiction && f.jurisdiction !== filterJurisdiction) return false
      if (filterFormName && f.form_name !== filterFormName) return false
      if (q && !f.form_name.toLowerCase().includes(q) && !f.agency_name.toLowerCase().includes(q))
        return false
      return true
    })

    result = [...result].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'form_name') cmp = a.form_name.localeCompare(b.form_name)
      else if (sortKey === 'period_start') cmp = a.period_start.localeCompare(b.period_start)
      else if (sortKey === 'due_date') cmp = a.due_date.localeCompare(b.due_date)
      else cmp = a.status.localeCompare(b.status)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [filings, search, filterStatus, filterJurisdiction, filterFormName, sortKey, sortDir])

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

  const tableRows = filtered.map(filing => ({
    key: filing.uuid,
    data: [
      {
        key: 'form',
        content: (
          <span>
            <span className={styles.formName}>{filing.form_name}</span>
            {filing.is_amendment && (
              <Badge status="info" className={styles.amendmentBadge}>
                Amended
              </Badge>
            )}
          </span>
        ),
      },
      {
        key: 'jurisdiction',
        content: (
          <Text as="span" size="sm" variant="supporting">
            {filing.jurisdiction}
          </Text>
        ),
      },
      {
        key: 'agency',
        content: (
          <Text as="span" size="sm" variant="supporting">
            {filing.agency_name}
          </Text>
        ),
      },
      {
        key: 'period',
        content: (
          <Text as="span" size="sm" variant="supporting">
            {filing.period}
          </Text>
        ),
      },
      {
        key: 'due_date',
        content: (
          <Text as="span" size="sm" variant="supporting">
            {new Date(filing.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        ),
      },
      {
        key: 'status',
        content: (
          <Badge status={STATUS_BADGE_VARIANTS[filing.status]}>
            {STATUS_LABELS[filing.status]}
          </Badge>
        ),
      },
      {
        key: 'action',
        content: (
          <Button
            variant="secondary"
            onClick={() => {
              onSelectFiling(filing.uuid)
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
      <Heading as="h2">Tax Filings</Heading>

      {failedFilings.length > 0 && (
        <Alert
          status="error"
          label={`${failedFilings.length} filing${failedFilings.length > 1 ? 's' : ''} require${failedFilings.length === 1 ? 's' : ''} attention`}
        >
          <Text size="sm">
            {failedFilings.map((f, i) => (
              <span key={f.uuid}>
                {i > 0 && ', '}
                <button
                  type="button"
                  className={styles.alertLink}
                  onClick={() => {
                    onSelectFiling(f.uuid)
                  }}
                >
                  {f.form_name} ({f.period})
                </button>
              </span>
            ))}{' '}
            {failedFilings.length === 1 ? 'has' : 'have'} failed and may need action before the
            deadline.
          </Text>
        </Alert>
      )}

      <div className={styles.searchRow}>
        <TextInput
          label="Search filings"
          shouldVisuallyHideLabel
          placeholder="Search by form name or agency..."
          value={search}
          onChange={setSearch}
          type="search"
          adornmentStart={<SearchIcon aria-hidden />}
        />
      </div>

      <div className={styles.filterRow}>
        <ComboBox
          label="Status"
          shouldVisuallyHideLabel
          placeholder="All statuses"
          options={statusOptions}
          value={filterStatus}
          onChange={setFilterStatus}
        />
        <ComboBox
          label="Form type"
          shouldVisuallyHideLabel
          placeholder="All form types"
          options={formNameOptions}
          value={filterFormName}
          onChange={setFilterFormName}
        />
        <ComboBox
          label="Jurisdiction"
          shouldVisuallyHideLabel
          placeholder="All jurisdictions"
          options={jurisdictionOptions}
          value={filterJurisdiction}
          onChange={setFilterJurisdiction}
        />
      </div>

      <Table
        aria-label="Tax filings"
        headers={[
          { key: 'form', content: sortHeader('Form', 'form_name') },
          { key: 'jurisdiction', content: 'Jurisdiction' },
          { key: 'agency', content: 'Agency' },
          { key: 'period', content: sortHeader('Period', 'period_start') },
          { key: 'due_date', content: sortHeader('Due Date', 'due_date') },
          { key: 'status', content: sortHeader('Status', 'status') },
          { key: 'action', content: '' },
        ]}
        rows={tableRows}
        emptyState={
          <Text variant="supporting" size="sm">
            No filings match your filters.
          </Text>
        }
      />
    </Flex>
  )
}
