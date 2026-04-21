import { useState, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
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
import CaretRightIcon from '@/assets/icons/caret-right.svg?react'

interface SidebarProps {
  mode: AppMode
  searchQuery: string
  onSearchChange: (query: string) => void
  isOpen: boolean
  onToggle: () => void
}

function CategorySection({
  category,
  items,
  searchQuery,
  mode,
}: {
  category: string
  items: { name: string; path?: string }[]
  searchQuery: string
  mode: AppMode
}) {
  const [collapsed, setCollapsed] = useState(false)

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    const q = searchQuery.toLowerCase()
    return items.filter(item => item.name.toLowerCase().includes(q))
  }, [items, searchQuery])

  if (filteredItems.length === 0) return null

  const displayCategory =
    mode === 'preview' && category === 'InformationRequests' ? 'Info Requests' : category

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
          <CaretRightIcon
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
            return (
              <li key={item.name} className={styles.item}>
                <NavLink to={to}>{item.name}</NavLink>
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
          <span>▸</span>
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
            <span>◂</span>
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
