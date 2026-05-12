import { createElement } from 'react'
import type { BoxHeaderProps } from '@gusto/embedded-react-sdk'
import styles from './BoxHeader.module.scss'

export function BoxHeader({ title, description, action, headingLevel = 'h3' }: BoxHeaderProps) {
  return (
    <div className={styles.root}>
      <div className={styles.body}>
        {createElement(headingLevel, { className: styles.title }, title)}
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action}
    </div>
  )
}
