import { Breadcrumbs as AriaBreadcrumbs } from 'react-aria-components'
import classnames from 'classnames'
import type { BreadcrumbsProps } from './BreadcrumbTypes'
import styles from './Breadcrumbs.module.scss'
export function Breadcrumbs({ children, className }: BreadcrumbsProps) {
  return (
    <nav className={classnames(styles.root, className)}>
      <AriaBreadcrumbs>{children}</AriaBreadcrumbs>
    </nav>
  )
}
