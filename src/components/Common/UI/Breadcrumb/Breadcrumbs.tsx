import { Breadcrumb as AriaBreadcrumb, Breadcrumbs as AriaBreadcrumbs } from 'react-aria-components'
import classnames from 'classnames'
import type { BreadcrumbsProps, Crumb } from './BreadcrumbTypes'
import styles from './Breadcrumbs.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Breadcrumbs({ crumbs, className }: BreadcrumbsProps) {
  const Components = useComponentContext()

  const renderLink = (crumb: Crumb) => {
    if (!crumb.href) return <span>{crumb.label}</span>

    if (crumb.onClick) {
      return (
        <a href={crumb.href} onClick={crumb.onClick}>
          {crumb.label}
        </a>
      )
    }

    return <Components.Link href={crumb.href}>{crumb.label}</Components.Link>
  }

  return (
    <nav className={classnames(styles.root, className)}>
      <AriaBreadcrumbs>
        {crumbs.map((crumb, index) => (
          <AriaBreadcrumb
            key={index}
            className={crumb.isCurrent ? styles.current : undefined}
            data-current={crumb.isCurrent}
          >
            {renderLink(crumb)}
          </AriaBreadcrumb>
        ))}
      </AriaBreadcrumbs>
    </nav>
  )
}
