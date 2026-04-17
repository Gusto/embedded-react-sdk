import { useState, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { categorizedRegistry, CATEGORIES, type Category } from './registry'
import styles from './Sidebar.module.scss'

interface SidebarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  isOpen: boolean
  onToggle: () => void
}

function CategorySection({
  category,
  items,
  searchQuery,
}: {
  category: Category
  items: { name: string }[]
  searchQuery: string
}) {
  const [collapsed, setCollapsed] = useState(false)

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    const q = searchQuery.toLowerCase()
    return items.filter(item => item.name.toLowerCase().includes(q))
  }, [items, searchQuery])

  if (filteredItems.length === 0) return null

  const displayCategory = category === 'InformationRequests' ? 'Info Requests' : category

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
        <span>
          <span
            className={`${styles.categoryArrow} ${collapsed ? styles.categoryArrowCollapsed : ''}`}
          >
            ▾
          </span>
          {displayCategory}
        </span>
        <span className={styles.categoryCount}>{filteredItems.length}</span>
      </div>
      {!collapsed && (
        <ul className={styles.items}>
          {filteredItems.map(item => (
            <li key={item.name} className={styles.item}>
              <NavLink to={`/${category.toLowerCase()}/${item.name}`}>{item.name}</NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Sidebar({ searchQuery, onSearchChange, isOpen, onToggle }: SidebarProps) {
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
            placeholder="Search components..."
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
        {CATEGORIES.map(category => {
          const items = categorizedRegistry[category]
          return (
            <CategorySection
              key={category}
              category={category}
              items={items}
              searchQuery={searchQuery}
            />
          )
        })}
      </div>
    </aside>
  )
}
