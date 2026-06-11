import Link from '@docusaurus/Link'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import styles from './styles.module.css'

export interface LinkCardItem {
  title: string
  description: string
  to: string
}

interface LinkCardGridProps {
  items: LinkCardItem[]
  columns?: 1 | 2 | 3
}

const columnClass = {
  1: 'cols1',
  2: 'cols2',
  3: 'cols3',
} as const

export default function LinkCardGrid({ items, columns = 2 }: LinkCardGridProps): ReactNode {
  return (
    <div className={clsx(styles.grid, styles[columnClass[columns]])}>
      {items.map(({ title, description, to }) => (
        <Link key={`${title}-${to}`} to={to} className={styles.card}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </Link>
      ))}
    </div>
  )
}
