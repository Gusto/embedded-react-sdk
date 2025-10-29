import classnames from 'classnames'
import { type UnorderedListProps, UnorderedListDefaults } from './ListTypes'
import styles from './List.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'

export function UnorderedList(rawProps: UnorderedListProps) {
  const resolvedProps = applyMissingDefaults(rawProps, UnorderedListDefaults)
  const { items, className, ...props } = resolvedProps

  return (
    <ul className={classnames(styles.list, className)} data-variant="unordered" {...props}>
      {items.map((item, index) => {
        const key = `item-${index}`

        return <li key={key}>{item}</li>
      })}
    </ul>
  )
}
