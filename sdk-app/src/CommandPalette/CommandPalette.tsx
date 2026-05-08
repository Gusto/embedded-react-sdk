import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchPages, type PageEntry } from './pages'
import styles from './CommandPalette.module.scss'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

const ROW_ID_PREFIX = 'command-palette-row-'

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const results = useMemo(() => (isOpen ? searchPages(query) : []), [isOpen, query])
  const showResults = isOpen && query.trim().length > 0

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setHighlightIndex(0)
      return
    }
    inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!showResults) return
    const target = results[highlightIndex]
    if (!target) return
    document.getElementById(`${ROW_ID_PREFIX}${target.id}`)?.scrollIntoView({ block: 'nearest' })
  }, [highlightIndex, showResults, results])

  if (!isOpen) return null

  const goTo = (page: PageEntry) => {
    void navigate(page.path)
    onClose()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const target = results[highlightIndex] ?? results[0]
      if (target) goTo(target)
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (results.length === 0) return
      setHighlightIndex(prev => Math.min(prev + 1, results.length - 1))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (results.length === 0) return
      setHighlightIndex(prev => Math.max(prev - 1, 0))
    }
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    setHighlightIndex(0)
  }

  const activeId =
    showResults && results[highlightIndex]
      ? `${ROW_ID_PREFIX}${results[highlightIndex].id}`
      : undefined

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        aria-label="Close page search"
      />
      <div className={styles.container}>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          className={styles.input}
          placeholder="Search pages…"
          value={query}
          onChange={onChange}
          onKeyDown={onKeyDown}
          aria-label="Search pages"
          aria-autocomplete="list"
          aria-controls="command-palette-list"
          aria-expanded={showResults}
          aria-activedescendant={activeId}
          spellCheck={false}
          autoComplete="off"
        />
        {showResults &&
          (results.length > 0 ? (
            <ul id="command-palette-list" className={styles.list} role="listbox">
              {results.map((page, index) => {
                const isActive = index === highlightIndex
                return (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- listbox keyboard nav happens on the input via aria-activedescendant
                  <li
                    id={`${ROW_ID_PREFIX}${page.id}`}
                    key={page.id}
                    role="option"
                    aria-selected={isActive}
                    className={`${styles.row}${isActive ? ` ${styles.rowActive}` : ''}`}
                    onClick={() => {
                      goTo(page)
                    }}
                    onMouseEnter={() => {
                      setHighlightIndex(index)
                    }}
                  >
                    <span className={styles.label}>{page.label}</span>
                    <span className={styles.category}>{page.category}</span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className={styles.empty}>No matches</div>
          ))}
      </div>
    </div>
  )
}
