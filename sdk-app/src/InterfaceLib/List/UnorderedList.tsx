import classNames from 'classnames'
import type { UnorderedListProps } from '@gusto/embedded-react-sdk'
import styles from './List.module.scss'

export function UnorderedList({
  items,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: UnorderedListProps) {
  return (
    <ul
      className={classNames(styles.root, styles.unordered, className)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      {items.map((item, index) => (
        <li key={index} className={styles.item}>
          {item}
        </li>
      ))}
    </ul>
  )
}
