import classnames from 'classnames'
import type { UnorderedListProps } from './ListTypes'
import styles from './List.module.scss'

export function UnorderedList({ items, className, ...props }: UnorderedListProps) {
  return (
    <ul className={classnames(styles.list, className)} data-variant="unordered" {...props}>
      {items.map((item, index) => {
        // Simple key generation - use index-based key
        // which is completely fine for static lists
        const key = `item-${index}`

        return (
          <li key={key} className={styles.item}>
            {item}
          </li>
        )
      })}
    </ul>
  )
}
