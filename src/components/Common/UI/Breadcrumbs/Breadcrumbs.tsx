import classnames from 'classnames'
import { Flex } from '../../Flex'
import type { BreadcrumbsProps } from './BreadcrumbsTypes'
import styles from './Breadcrumbs.module.scss'

export function Breadcrumbs({
  className,
  breadcrumbs,
  currentBreadcrumbId,
  'aria-label': ariaLabel = 'Breadcrumbs',
  onClick,
}: BreadcrumbsProps) {
  return (
    <Flex flexDirection="column">
      <nav aria-label={ariaLabel} className={classnames(styles.root, className)}>
        <ol className={styles.list}>
          {breadcrumbs.map(breadcrumb => {
            const isCurrentbreadcrumb = breadcrumb.id === currentBreadcrumbId
            const isClickable = !isCurrentbreadcrumb && onClick

            return (
              <li
                key={breadcrumb.id}
                className={classnames(styles.item, isClickable && styles.clickable)}
                aria-current={isCurrentbreadcrumb ? 'step' : false}
              >
                {isClickable ? (
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() => {
                      onClick(breadcrumb.id)
                    }}
                  >
                    {breadcrumb.label}
                  </button>
                ) : (
                  <span>{breadcrumb.label}</span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </Flex>
  )
}
