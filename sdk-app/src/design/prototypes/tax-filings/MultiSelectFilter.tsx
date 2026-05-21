import { useEffect, useRef, useState } from 'react'
import { FilterButton } from './FilterButton'
import { summarizeSelection, type FilterOption } from './filterUtils'
import styles from './TaxFilingsFlow.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface MultiSelectFilterProps {
  label: string
  options: FilterOption[]
  selected: string[]
  onChange: (next: string[]) => void
}

export function MultiSelectFilter({ label, options, selected, onChange }: MultiSelectFilterProps) {
  const { Checkbox } = useComponentContext()
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen])

  const summary = summarizeSelection(selected, options)
  const isActive = selected.length > 0

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div ref={wrapperRef} className={styles.filterWrapper}>
      <FilterButton
        buttonRef={buttonRef}
        label={label}
        summary={summary}
        isActive={isActive}
        onClick={() => {
          setIsOpen(o => !o)
        }}
        ariaExpanded={isOpen}
      />
      {isOpen && (
        <div className={styles.filterPopover} role="dialog" aria-label={`Filter by ${label}`}>
          {options.map(option => (
            <Checkbox
              key={option.value}
              label={option.label}
              value={selected.includes(option.value)}
              onChange={() => {
                toggleOption(option.value)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
