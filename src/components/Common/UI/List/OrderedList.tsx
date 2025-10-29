import classnames from 'classnames'
import { type OrderedListProps, OrderedListDefaults } from './ListTypes'
import styles from './List.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'

export function OrderedList(rawProps: OrderedListProps) {
  const resolvedProps = applyMissingDefaults(rawProps, OrderedListDefaults)
  const { items, className, ...props } = resolvedProps

  return (
    <ol className={classnames(styles.list, className)} data-variant="ordered" {...props}>
      {items.map((item, index) => {
        // Simple key generation - use index-based key
        // which is completely fine for static lists
        const key = `item-${index}`

        return <li key={key}>{item}</li>
      })}
    </ol>
  )
}
