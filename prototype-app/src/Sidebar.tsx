import { useState, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { categorizedRegistry, CATEGORIES, type Category } from './registry'
import styles from './Sidebar.module.scss'
import CaretRightIcon from '@/assets/icons/caret-right.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface SidebarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

function CategorySection({
  category,
  items,
  searchQuery,
}: {
  category: Category
  items: { name: string; path: string }[]
  searchQuery: string
}) {
  const [collapsed, setCollapsed] = useState(false)

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    const q = searchQuery.toLowerCase()
    return items.filter(item => item.name.toLowerCase().includes(q))
  }, [items, searchQuery])

  if (filteredItems.length === 0) return null

  return (
    <div className={styles.category}>
      <div
        className={styles.categoryHeader}
        aria-label={`${category} (${filteredItems.length})`}
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
            <CaretRightIcon />
          </span>
          {category}
        </span>
        <span className={styles.categoryCount}>{filteredItems.length}</span>
      </div>
      {!collapsed && (
        <ul className={styles.items}>
          {filteredItems.map(item => (
            <li key={item.path} className={styles.item}>
              <NavLink to={item.path}>{item.name}</NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Sidebar({ searchQuery, onSearchChange }: SidebarProps) {
  const Components = useComponentContext()

  return (
    <aside className={styles.root}>
      <div className={styles.search}>
        <Components.TextInput
          label="Search prototypes"
          shouldVisuallyHideLabel
          placeholder="Search prototypes..."
          value={searchQuery}
          onChange={onSearchChange}
        />
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
