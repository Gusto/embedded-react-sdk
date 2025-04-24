import { Breadcrumb as AriaBreadcrumb, Link } from 'react-aria-components'
import type { BreadcrumbProps } from './BreadcrumbTypes'

export function Breadcrumb({ children, className, isCurrent, href, onClick }: BreadcrumbProps) {
  return (
    <AriaBreadcrumb>
      {href ? (
        <Link href={href} onPress={onClick}>
          {children}
        </Link>
      ) : (
        <span>{children}</span>
      )}
    </AriaBreadcrumb>
  )
}
