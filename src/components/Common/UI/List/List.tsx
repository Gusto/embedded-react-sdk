import classnames from 'classnames'
import { isValidElement } from 'react'
import type { ListProps } from './ListTypes'
import styles from './List.module.scss'

export function List({ variant = 'unordered', items, className, ...props }: ListProps) {
  const ListElement = variant === 'ordered' ? 'ol' : 'ul'

  return (
    <ListElement className={classnames(styles.list, className)} data-variant={variant} {...props}>
      {items.map((item, index) => {
        // Generate a stable key - use index as fallback
        const key = (() => {
          if (item === null || item === undefined) return `item-${index}`
          if (
            typeof item === 'object' &&
            !isValidElement(item) &&
            'id' in item &&
            item.id != null &&
            (typeof item.id === 'string' || typeof item.id === 'number')
          ) {
            return String(item.id)
          }
          return `item-${index}`
        })()

        return (
          <li key={key} className={styles.item}>
            {item}
          </li>
        )
      })}
    </ListElement>
  )
}
