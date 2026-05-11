import classNames from 'classnames'
import type { BreadcrumbsProps } from '@gusto/embedded-react-sdk'
import styles from './Breadcrumbs.module.scss'

export function Breadcrumbs({
  breadcrumbs,
  currentBreadcrumbId,
  'aria-label': ariaLabel = 'Breadcrumbs',
  className,
  onClick,
  isSmallContainer = false,
}: BreadcrumbsProps) {
  const items = isSmallContainer
    ? breadcrumbs.filter(b => b.id === currentBreadcrumbId).slice(-1)
    : breadcrumbs

  return (
    <nav aria-label={ariaLabel} className={classNames(styles.root, className)}>
      <ol className={styles.list}>
        {items.map((breadcrumb, index) => {
          const isCurrent = breadcrumb.id === currentBreadcrumbId
          const isClickable = breadcrumb.isClickable !== false && !!onClick
          const handleClick = () => {
            if (isClickable) onClick!(breadcrumb.id)
          }
          return (
            <li key={breadcrumb.id} className={styles.item}>
              {index > 0 && (
                <span aria-hidden="true" className={styles.separator}>
                  /
                </span>
              )}
              {isClickable && !isCurrent ? (
                <button type="button" onClick={handleClick} className={styles.link}>
                  {breadcrumb.label}
                </button>
              ) : (
                <span className={styles.current} aria-current={isCurrent ? 'page' : undefined}>
                  {breadcrumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
