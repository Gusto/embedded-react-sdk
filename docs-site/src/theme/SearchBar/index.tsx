import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from '@docusaurus/router'
import useIsBrowser from '@docusaurus/useIsBrowser'
import OriginalSearchBar from '@easyops-cn/docusaurus-search-local/dist/client/client/theme/SearchBar'
import styles from './styles.module.css'

function SearchIcon({ className, size = 16 }: { className?: string; size?: number }): ReactNode {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

const SearchTrigger = ({
  onClick,
  triggerRef,
}: {
  onClick: () => void
  triggerRef: React.Ref<HTMLButtonElement>
}): ReactNode => (
  <button
    ref={triggerRef}
    type="button"
    className={styles.searchTrigger}
    onClick={onClick}
    aria-label="Search docs"
  >
    <SearchIcon className={styles.searchTriggerIcon} />
    <span className={styles.searchTriggerText}>Search docs</span>
    <span className={styles.searchTriggerKbd}>
      <kbd>⌘</kbd>
      <kbd>K</kbd>
    </span>
  </button>
)

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function SearchBar(): ReactNode {
  const isBrowser = useIsBrowser()
  const [isOpen, setIsOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (!isBrowser) return
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsOpen(prev => !prev)
      } else if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isBrowser])

  useEffect(() => {
    if (!isOpen) return
    const trapTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const modal = modalRef.current
      if (!modal) return
      const focusable = modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (focusable.length === 0) return
      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', trapTab)
    return () => document.removeEventListener('keydown', trapTab)
  }, [isOpen])

  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (!isOpen && wasOpenRef.current) {
      triggerRef.current?.focus()
    }
    wasOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const id = window.requestAnimationFrame(() => {
      const input = modalRef.current?.querySelector<HTMLInputElement>('input.navbar__search-input')
      input?.focus()
    })
    return () => window.cancelAnimationFrame(id)
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname, location.search, location.hash])

  useEffect(() => {
    if (!isOpen) return
    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return
      const input = modalRef.current?.querySelector<HTMLInputElement>('input.navbar__search-input')
      input?.focus()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleVisibility)
    }
  }, [isOpen])

  // The underlying autocomplete library closes and empties its dropdown on
  // input blur. When the OS moves focus to another app (e.g. Terminal), the
  // input blurs and the results vanish. Block the blur event from reaching the
  // library's handler whenever the document itself is losing focus — the user
  // blur (clicking elsewhere in the page) still closes as expected.
  useEffect(() => {
    if (!isOpen) return
    const blockBlurOnWindowSwitch = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null
      if (!target?.matches('input.navbar__search-input')) return
      if (document.hasFocus()) return
      event.stopImmediatePropagation()
      event.stopPropagation()
    }
    document.addEventListener('blur', blockBlurOnWindowSwitch, true)
    return () => document.removeEventListener('blur', blockBlurOnWindowSwitch, true)
  }, [isOpen])

  return (
    <>
      <SearchTrigger onClick={open} triggerRef={triggerRef} />
      {isBrowser &&
        isOpen &&
        createPortal(
          <div className={styles.searchModalBackdrop} onClick={close} role="presentation">
            <div
              ref={modalRef}
              className={styles.searchModal}
              role="dialog"
              aria-modal="true"
              aria-label="Search docs"
              onClick={event => event.stopPropagation()}
            >
              <div className={styles.searchInputArea}>
                <SearchIcon className={styles.searchInputIcon} size={20} />
                <OriginalSearchBar />
                <button
                  type="button"
                  className={styles.searchEscChip}
                  onClick={close}
                  aria-label="Close search"
                >
                  <kbd>esc</kbd>
                </button>
              </div>
              <div className={styles.searchEmptyState}>
                <SearchIcon className={styles.searchEmptyIcon} size={32} />
                <p className={styles.searchEmptyTitle}>Start typing to search</p>
                <p className={styles.searchEmptyHint}>
                  Look up components, hooks, guides, and more.
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
