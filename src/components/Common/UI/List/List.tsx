import classnames from 'classnames'
import type { ListProps } from './ListTypes'
import styles from './List.module.scss'

export function List({ variant = 'unordered', items, className, ...props }: ListProps) {
  const ListElement = variant === 'ordered' ? 'ol' : 'ul'

  return (
    <ListElement className={classnames(styles.list, className)} data-variant={variant} {...props}>
      {items.map((item) => (
        <li key={typeof item === 'object' && item.id ? item.id : item} className={styles.item}>
          {item}
        </li>
      ))}
    </ListElement>
  )
}
