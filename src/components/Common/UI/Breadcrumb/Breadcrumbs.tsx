import { Breadcrumbs as AriaBreadcrumbs } from 'react-aria-components'
import type { BreadcrumbsProps } from './BreadcrumbTypes'
import styles from './Breadcrumbs.module.scss'

export function Breadcrumbs({ children, className }: BreadcrumbsProps) {
  return (
    <span className={styles.root}>
      <AriaBreadcrumbs>{children}</AriaBreadcrumbs>
    </span>
  )
}
