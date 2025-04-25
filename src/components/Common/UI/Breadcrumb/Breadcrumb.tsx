import { Breadcrumb as AriaBreadcrumb } from 'react-aria-components'
import type { BreadcrumbProps } from './BreadcrumbTypes'

export function Breadcrumb({ children, className, isCurrent, href, onClick }: BreadcrumbProps) {
  return (
    <AriaBreadcrumb className={className} data-current={isCurrent}>
      {href ? (
        <a href={href} onClick={onClick}>
          {children}
        </a>
      ) : (
        <span>{children}</span>
      )}
    </AriaBreadcrumb>
  )
}
