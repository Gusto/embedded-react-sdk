import { useRef, useState } from 'react'
import { MultiSelectFilter } from './MultiSelectFilter'
import { FilterButton } from './FilterButton'
import { MobileFiltersModal } from './MobileFiltersModal'
import { isFilterActive, type FilterDef } from './filterUtils'
import styles from './TaxFilingsFlow.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import useContainerBreakpoints from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import SearchIcon from '@/assets/icons/search-lg.svg?react'
import FilterIcon from '@/assets/icons/filter-funnel.svg?react'
import CloseIcon from '@/assets/icons/close.svg?react'

interface DataViewFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  searchLabel: string
  searchPlaceholder: string
  filters: FilterDef[]
  onClearAll: () => void
}

export function DataViewFilters({
  search,
  onSearchChange,
  searchLabel,
  searchPlaceholder,
  filters,
  onClearAll,
}: DataViewFiltersProps) {
  const { TextInput } = useComponentContext()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const breakpoints = useContainerBreakpoints({ ref: containerRef })
  const isCompact = !breakpoints.includes('small')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const anyFilterActive = filters.some(f => isFilterActive(f.selected))
  const activeFilterCount = filters.filter(f => isFilterActive(f.selected)).length

  return (
    <div
      ref={ref => {
        containerRef.current = ref
      }}
      className={styles.dataViewFilters}
    >
      <div className={styles.searchRow}>
        <TextInput
          label={searchLabel}
          shouldVisuallyHideLabel
          placeholder={searchPlaceholder}
          value={search}
          onChange={onSearchChange}
          type="search"
          adornmentStart={<SearchIcon aria-hidden />}
        />
      </div>

      {isCompact ? (
        <div className={styles.filterRow}>
          <FilterButton
            label="Filters"
            summary={activeFilterCount > 0 ? `${activeFilterCount} active` : 'None'}
            isActive={activeFilterCount > 0}
            onClick={() => {
              setIsModalOpen(true)
            }}
            icon={<FilterIcon aria-hidden />}
            hideCaret
          />
          <MobileFiltersModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
            }}
            filters={filters}
          />
        </div>
      ) : (
        <div className={styles.filterRow}>
          {filters.map(filter => (
            <MultiSelectFilter
              key={filter.key}
              label={filter.label}
              options={filter.options}
              selected={filter.selected}
              onChange={filter.onChange}
            />
          ))}
          {anyFilterActive && (
            <button type="button" className={styles.clearFiltersButton} onClick={onClearAll}>
              <CloseIcon aria-hidden className={styles.clearFiltersIcon} />
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
