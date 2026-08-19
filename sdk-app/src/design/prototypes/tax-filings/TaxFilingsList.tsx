import { useState, useMemo } from 'react'
import type { TaxFiling, TaxFilingStatus } from './types'
import type { FilterDef, FilterOption } from './filterUtils'
import styles from './TaxFilingsFlow.module.scss'
import { DataViewFilters } from './DataViewFilters'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, Flex, useDataView } from '@/components/Common'
import EyeIcon from '@/assets/icons/eye.svg?react'
import CaretDownIcon from '@/assets/icons/caret-down.svg?react'

const STATUS_LABELS: Record<TaxFilingStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  accepted: 'Accepted',
  failed: 'Needs action',
}

const STATUS_BADGE_VARIANTS: Record<TaxFilingStatus, 'info' | 'warning' | 'success' | 'error'> = {
  not_started: 'info',
  in_progress: 'warning',
  accepted: 'success',
  failed: 'error',
}

const STATUS_ORDER: TaxFilingStatus[] = ['failed', 'in_progress', 'accepted', 'not_started']
const STATUS_OPTIONS: FilterOption[] = STATUS_ORDER.map(status => ({
  value: status,
  label: STATUS_LABELS[status],
}))

type SortKey = 'form_name' | 'period_start' | 'due_date' | 'status'
type SortDir = 'asc' | 'desc'

interface TaxFilingsListProps {
  filings: TaxFiling[]
  onSelectFiling: (uuid: string) => void
}

export function TaxFilingsList({ filings, onSelectFiling }: TaxFilingsListProps) {
  const { Badge, ButtonIcon, Text, Heading } = useComponentContext()

  const jurisdictionOptions = useMemo<FilterOption[]>(() => {
    const seen = new Set<string>()
    const out: FilterOption[] = []
    for (const f of filings) {
      if (!seen.has(f.jurisdiction)) {
        seen.add(f.jurisdiction)
        out.push({ value: f.jurisdiction, label: f.jurisdiction })
      }
    }
    return out
  }, [filings])

  const formNameOptions = useMemo<FilterOption[]>(() => {
    const seen = new Set<string>()
    const out: FilterOption[] = []
    for (const f of filings) {
      if (!seen.has(f.form_name)) {
        seen.add(f.form_name)
        out.push({ value: f.form_name, label: f.form_name })
      }
    }
    return out
  }, [filings])

  const [search, setSearch] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedForms, setSelectedForms] = useState<string[]>([])
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('period_start')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

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
    const formsActive = selectedForms.length > 0
    const jurisdictionsActive = selectedJurisdictions.length > 0

    const result = filings.filter(f => {
      if (statusActive && !selectedStatuses.includes(f.status)) return false
      if (formsActive && !selectedForms.includes(f.form_name)) return false
      if (jurisdictionsActive && !selectedJurisdictions.includes(f.jurisdiction)) return false
      if (q && !f.form_name.toLowerCase().includes(q) && !f.agency_name.toLowerCase().includes(q))
        return false
      return true
    })

    return [...result].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'form_name') cmp = a.form_name.localeCompare(b.form_name)
      else if (sortKey === 'period_start') cmp = a.period_start.localeCompare(b.period_start)
      else if (sortKey === 'due_date') cmp = a.due_date.localeCompare(b.due_date)
      else cmp = a.status.localeCompare(b.status)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filings, search, selectedStatuses, selectedForms, selectedJurisdictions, sortKey, sortDir])

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
      key: 'form',
      label: 'Form',
      options: formNameOptions,
      selected: selectedForms,
      onChange: setSelectedForms,
    },
    {
      key: 'jurisdiction',
      label: 'Jurisdiction',
      options: jurisdictionOptions,
      selected: selectedJurisdictions,
      onChange: setSelectedJurisdictions,
    },
  ]

  const clearAllFilters = () => {
    setSelectedStatuses([])
    setSelectedForms([])
    setSelectedJurisdictions([])
  }

  const dataViewProps = useDataView<TaxFiling>({
    data: filtered,
    columns: [
      {
        key: 'form_name',
        title: sortHeader('Form', 'form_name'),
        render: filing => (
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
        title: 'Jurisdiction',
        render: filing => (
          <Text as="span" size="sm" variant="supporting">
            {filing.jurisdiction}
          </Text>
        ),
      },
      {
        key: 'agency_name',
        title: 'Agency',
        render: filing => (
          <Text as="span" size="sm" variant="supporting">
            {filing.agency_name}
          </Text>
        ),
      },
      {
        key: 'period_start',
        title: sortHeader('Period', 'period_start'),
        render: filing => (
          <Text as="span" size="sm" variant="supporting">
            {filing.period}
          </Text>
        ),
      },
      {
        key: 'due_date',
        title: sortHeader('Due date', 'due_date'),
        render: filing => (
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
        title: sortHeader('Status', 'status'),
        render: filing => (
          <Badge status={STATUS_BADGE_VARIANTS[filing.status]}>
            {STATUS_LABELS[filing.status]}
          </Badge>
        ),
      },
    ],
    itemMenu: filing => (
      <ButtonIcon
        aria-label="View filing"
        variant="tertiary"
        onClick={() => {
          onSelectFiling(filing.uuid)
        }}
      >
        <EyeIcon aria-hidden />
      </ButtonIcon>
    ),
    emptyState: () => (
      <Flex flexDirection="column" alignItems="center" gap={8}>
        <Text variant="supporting" size="sm">
          No filings match your filters.
        </Text>
      </Flex>
    ),
  })

  return (
    <Flex flexDirection="column" gap={24}>
      <Heading as="h2">Tax Filings</Heading>

      <DataViewFilters
        search={search}
        onSearchChange={setSearch}
        searchLabel="Search filings"
        searchPlaceholder="Search by form name or agency..."
        filters={filterDefs}
        onClearAll={clearAllFilters}
      />

      <DataView label="Tax filings" {...dataViewProps} />
    </Flex>
  )
}
