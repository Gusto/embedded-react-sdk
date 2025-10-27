import classNames from 'classnames'
import type { ReactNode } from 'react'
import { type DescriptionListProps, DescriptionListDefaults } from './DescriptionListTypes'
import styles from './DescriptionList.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'

export function DescriptionList(rawProps: DescriptionListProps) {
  const resolvedProps = applyMissingDefaults(rawProps, DescriptionListDefaults)
  const { items, className } = resolvedProps

  const renderTerms = (term: ReactNode | ReactNode[]) => {
    const terms = Array.isArray(term) ? term : [term]
    return terms.map((t, i) => <dt key={i}>{t}</dt>)
  }

  const renderDescriptions = (description: ReactNode | ReactNode[]) => {
    const descriptions = Array.isArray(description) ? description : [description]
    return descriptions.map((d, i) => <dd key={i}>{d}</dd>)
  }

  return (
    <dl className={classNames(styles.root, className)}>
      {items.map((item, index) => (
        <div key={index} className={styles.item}>
          {renderTerms(item.term)}
          {renderDescriptions(item.description)}
        </div>
      ))}
    </dl>
  )
}
