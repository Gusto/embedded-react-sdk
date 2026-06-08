import classnames from 'classnames'
import type { OrderedListProps } from './ListTypes'
import styles from './List.module.scss'

/**
 * Renders an ordered (numbered) list from an array of item nodes.
 *
 * @param props - See {@link OrderedListProps}.
 * @returns The rendered ordered list element.
 * @internal
 */
export function OrderedList({ items, className, ...props }: OrderedListProps) {
  return (
    <ol className={classnames(styles.list, className)} data-variant="ordered" {...props}>
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
    </ol>
  )
}
