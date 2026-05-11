import classNames from 'classnames'
import type { ReactNode } from 'react'
import type { DescriptionListProps } from '@gusto/embedded-react-sdk'
import styles from './DescriptionList.module.scss'

export function DescriptionList({
  items,
  layout = 'stacked',
  showSeparators = true,
  className,
}: DescriptionListProps) {
  const renderTerms = (term: ReactNode | ReactNode[]) => {
    const terms = Array.isArray(term) ? term : [term]
    return terms.map((t, i) => <dt key={i}>{t}</dt>)
  }

  const renderDescriptions = (description: ReactNode | ReactNode[]) => {
    const descriptions = Array.isArray(description) ? description : [description]
    return descriptions.map((d, i) => <dd key={i}>{d}</dd>)
  }

  return (
    <dl
      className={classNames(styles.root, showSeparators && styles.withSeparators, className)}
      data-layout={layout}
    >
      {items.map((item, index) => (
        <div key={index} className={styles.item}>
          {renderTerms(item.term)}
          {renderDescriptions(item.description)}
        </div>
      ))}
    </dl>
  )
}
