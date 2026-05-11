import classNames from 'classnames'
import type { OrderedListProps } from '@gusto/embedded-react-sdk'
import styles from './List.module.scss'

export function OrderedList({
  items,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: OrderedListProps) {
  return (
    <ol
      className={classNames(styles.root, styles.ordered, className)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      {items.map((item, index) => (
        <li key={index} className={styles.item}>
          {item}
        </li>
      ))}
    </ol>
  )
}
