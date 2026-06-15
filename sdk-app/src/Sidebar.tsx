import { useState, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  categorizedRegistry as previewRegistry,
  CATEGORIES as PREVIEW_CATEGORIES,
} from './registry'
import {
  categorizedRegistry as designRegistry,
  CATEGORIES as DESIGN_CATEGORIES,
} from './design/registry'
import type { AppMode } from './useAppMode'
import styles from './Sidebar.module.scss'

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function PanelLeftCloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="m16 15-3-3 3-3" />
    </svg>
  )
}

function PanelLeftOpenIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="m14 9 3 3-3 3" />
    </svg>
  )
}

interface SidebarProps {
  mode: AppMode
  searchQuery: string
  onSearchChange: (query: string) => void
  isOpen: boolean
  onToggle: () => void
  onShowShortcuts: () => void
}

interface SidebarItem {
  name: string
  path?: string
  children?: SidebarItem[]
}

function isUnder(pathname: string, target: string): boolean {
  return pathname === target || pathname.startsWith(`${target}/`)
}

const PREVIEW_CATEGORY_LABELS: Record<string, string> = {
  InformationRequests: 'Info Requests',
  EmployeeManagement: 'Employee Management',
  EmployeeOnboarding: 'Employee Onboarding',
}

function formatPreviewCategory(category: string): string {
  return PREVIEW_CATEGORY_LABELS[category] ?? category
}

function CategorySection({
  category,
  items,
  searchQuery,
  mode,
}: {
  category: string
  items: SidebarItem[]
  searchQuery: string
  mode: AppMode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    const q = searchQuery.toLowerCase()
    return items.filter(item => {
      if (item.name.toLowerCase().includes(q)) return true
      return item.children?.some(child => child.name.toLowerCase().includes(q)) ?? false
    })
  }, [items, searchQuery])

  if (searchQuery && filteredItems.length === 0) return null

  const displayCategory = mode === 'preview' ? formatPreviewCategory(category) : category

  return (
    <div className={styles.category}>
      <div
        className={styles.categoryHeader}
        onClick={() => {
          setCollapsed(!collapsed)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') setCollapsed(!collapsed)
        }}
      >
        <div className={styles.categoryTitle}>
          <ChevronRightIcon
            className={`${styles.categoryArrow} ${collapsed ? styles.categoryArrowCollapsed : ''}`}
          />
          {displayCategory}
        </div>
        <span className={styles.categoryCount}>{filteredItems.length}</span>
      </div>
      {!collapsed && (
        <ul className={styles.items}>
          {filteredItems.map(item => {
            const to =
              mode === 'design' && item.path ? item.path : `/${category.toLowerCase()}/${item.name}`
            const showChildren =
              !!item.children?.length && !!item.path && isUnder(pathname, item.path)
            return (
              <li key={item.name} className={styles.item}>
                <NavLink to={to} end={!item.children}>
                  {item.name}
                </NavLink>
                {showChildren && item.children && (
                  <ul className={styles.subItems}>
                    {item.children.map(child => {
                      const childPath = child.path ?? '#'
                      // A child is "active" when the URL is under its path,
                      // unless the URL is under a deeper sibling's path
                      // (so e.g. Prototype stays highlighted while drilled
                      // into the live flow but un-highlights on Component
                      // states).
                      const isActiveByPath = !!child.path && isUnder(pathname, child.path)
                      const isUnderDeeperSibling =
                        !!child.path &&
                        item.children!.some(
                          other =>
                            other !== child &&
                            !!other.path &&
                            other.path.startsWith(`${child.path!}/`) &&
                            isUnder(pathname, other.path),
                        )
                      const isActive = isActiveByPath && !isUnderDeeperSibling
                      return (
                        <li key={child.name} className={styles.subItem}>
                          <NavLink to={childPath} className={() => (isActive ? 'active' : '')}>
                            {child.name}
                          </NavLink>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function Sidebar({ mode, searchQuery, onSearchChange, isOpen, onToggle }: SidebarProps) {
  const placeholder = mode === 'design' ? 'Search prototypes...' : 'Search components...'

  if (!isOpen) {
    return (
      <aside className={styles.rootCollapsed}>
        <button
          type="button"
          className={styles.collapsedHeader}
          onClick={onToggle}
          aria-label="Show components sidebar"
          title="Show components sidebar"
        >
          <PanelLeftOpenIcon />
        </button>
      </aside>
    )
  }

  return (
    <aside className={styles.root}>
      <div className={styles.search}>
        <div className={styles.searchRow}>
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={e => {
              onSearchChange(e.target.value)
            }}
          />
          <button
            type="button"
            className={styles.sidebarToggle}
            onClick={onToggle}
            aria-label="Hide sidebar"
            title="Hide sidebar"
          >
            <PanelLeftCloseIcon />
          </button>
        </div>
      </div>
      <div className={styles.list}>
        {mode === 'preview'
          ? PREVIEW_CATEGORIES.map(category => {
              const items = previewRegistry[category]
              return (
                <CategorySection
                  key={category}
                  category={category}
                  items={items}
                  searchQuery={searchQuery}
                  mode={mode}
                />
              )
            })
          : DESIGN_CATEGORIES.map(category => {
              const items = designRegistry[category]
              return (
                <CategorySection
                  key={category}
                  category={category}
                  items={items}
                  searchQuery={searchQuery}
                  mode={mode}
                />
              )
            })}
      </div>
    </aside>
  )
}
