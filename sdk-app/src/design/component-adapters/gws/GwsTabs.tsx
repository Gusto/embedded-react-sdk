import cn from 'classnames'
import styles from './GwsTabs.module.scss'
import type { TabsProps } from '@/components/Common/UI/Tabs/TabsTypes'

export function GwsTabs({
  tabs,
  selectedId,
  onSelectionChange,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: TabsProps) {
  const activeId = selectedId ?? tabs[0]?.id

  return (
    <div className={cn('w-100', className)} {...props}>
      <ul
        className={cn('nav mb-4', styles.navHighlights)}
        role="tablist"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {tabs.map(tab => (
          <li key={tab.id} className="nav-item" role="presentation">
            <button
              type="button"
              role="tab"
              className={cn('nav-link', { active: tab.id === activeId, disabled: tab.isDisabled })}
              id={`tab-${tab.id}`}
              aria-controls={`tabpanel-${tab.id}`}
              aria-selected={tab.id === activeId}
              tabIndex={tab.id === activeId ? 0 : -1}
              disabled={tab.isDisabled}
              onClick={() => {
                if (!tab.isDisabled) onSelectionChange(tab.id)
              }}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="tab-content">
        {tabs.map(tab => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`tabpanel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            className={cn('tab-pane fade', { 'show active': tab.id === activeId })}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
