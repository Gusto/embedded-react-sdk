import { useEffect, useState } from 'react'
import type { FilterDef } from './filterUtils'
import styles from './TaxFilingsFlow.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface MobileFiltersModalProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterDef[]
}

export function MobileFiltersModal({ isOpen, onClose, filters }: MobileFiltersModalProps) {
  const { Modal, Button, Checkbox, Heading } = useComponentContext()
  const [staged, setStaged] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (isOpen) {
      const next: Record<string, string[]> = {}
      for (const f of filters) next[f.key] = f.selected
      setStaged(next)
    }
  }, [isOpen, filters])

  const toggleOption = (filterKey: string, value: string) => {
    setStaged(prev => {
      const current = prev[filterKey] ?? []
      const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
      return { ...prev, [filterKey]: next }
    })
  }

  const handleReset = () => {
    const next: Record<string, string[]> = {}
    for (const f of filters) next[f.key] = []
    setStaged(next)
  }

  const handleApply = () => {
    for (const f of filters) {
      const value = staged[f.key]
      if (value) f.onChange(value)
    }
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      shouldCloseOnBackdropClick
      footer={
        <div className={styles.mobileFiltersFooter}>
          <Button variant="tertiary" onClick={handleReset}>
            Reset
          </Button>
          <div className={styles.mobileFiltersFooterActions}>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      }
    >
      <div className={styles.mobileFiltersBody}>
        <Heading as="h2">Filters</Heading>
        {filters.map((filter, index) => (
          <div key={filter.key} className={styles.mobileFilterSection}>
            {index > 0 && <hr className={styles.mobileFilterDivider} />}
            <Heading as="h3" styledAs="h4">
              {filter.label}
            </Heading>
            <div className={styles.mobileFilterOptions}>
              {filter.options.map(option => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  value={(staged[filter.key] ?? filter.selected).includes(option.value)}
                  onChange={() => {
                    toggleOption(filter.key, option.value)
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
