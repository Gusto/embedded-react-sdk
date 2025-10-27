import type React from 'react'
import classNames from 'classnames'
import styles from './List.module.scss'

interface ListProps {
  items: React.ReactNode[]
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
}

const List: React.FC<ListProps> = ({ items, className, ...otherProps }) => {
  return (
    <ul className={classNames(styles.root, className)} {...otherProps}>
      {items.map((item, index) => {
        const key = `item-${index}`
        return <li key={key}>{item}</li>
      })}
    </ul>
  )
}

export { List }
