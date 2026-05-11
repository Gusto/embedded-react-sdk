import classNames from 'classnames'
import type { DescriptionListProps } from '@gusto/embedded-react-sdk'
import styles from './DescriptionList.module.scss'

export function DescriptionList({
  items,
  layout = 'stacked',
  showSeparators = true,
  className,
}: DescriptionListProps) {
  return (
    <dl
      className={classNames(styles.root, className)}
      data-layout={layout}
      data-separators={showSeparators || undefined}
    >
      {items.map((item, index) => (
        <div key={index} className={styles.item}>
          <dt className={styles.term}>{item.term}</dt>
          <dd className={styles.description}>{item.description}</dd>
        </div>
      ))}
    </dl>
  )
}
