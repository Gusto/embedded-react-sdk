import { useState, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { categorizedRegistry, CATEGORIES, type Category } from './registry'
import styles from './Sidebar.module.scss'

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

export function Sidebar({ searchQuery, onSearchChange }: SidebarProps) {
  return (
    <aside className={styles.root}>
      <div className={styles.search}>
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={e => {
            onSearchChange(e.target.value)
          }}
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
