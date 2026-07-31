import classNames from 'classnames'
import type { ReactNode } from 'react'
import styles from './DescriptionList.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Prototype-local mirror of the SDK's DescriptionList with an optional per-row `action` slot
 * rendered at the item level (outside the term/description spans) so a trailing button aligns
 * to the row rather than to the description cell.
 */
export interface DescriptionListItem {
  term: ReactNode
  description: ReactNode
  action?: ReactNode
}

export interface DescriptionListProps {
  items: DescriptionListItem[]
  showSeparators?: boolean
  className?: string
}

export function DescriptionList({ items, showSeparators = true, className }: DescriptionListProps) {
  const Components = useComponentContext()

  return (
    <dl className={classNames(styles.root, showSeparators && styles.withSeparators, className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className={classNames(styles.item, {
            [styles.itemWithAction!]: item.action != null,
          })}
        >
          <dt>
            <Components.Text as="span" weight="medium">
              {item.term}
            </Components.Text>
          </dt>
          <dd>
            <Components.Text as="span" variant="supporting">
              {item.description}
            </Components.Text>
          </dd>
          {item.action ? <div className={styles.itemAction}>{item.action}</div> : null}
        </div>
      ))}
    </dl>
  )
}
