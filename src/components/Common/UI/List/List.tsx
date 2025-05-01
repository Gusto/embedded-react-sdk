import classnames from 'classnames'
import type { ListProps } from './ListTypes'
import styles from './List.module.scss'

export function List({ variant = 'unordered', items, className, ...props }: ListProps) {
  const ListElement = variant === 'ordered' ? 'ol' : 'ul'

  return (
    <ListElement className={classnames(styles.list, className)} data-variant={variant} {...props}>
      {items.map((item, index) => (
        <li key={index} className={styles.item}>
          {item}
        </li>
      ))}
    </ListElement>
  )
}
