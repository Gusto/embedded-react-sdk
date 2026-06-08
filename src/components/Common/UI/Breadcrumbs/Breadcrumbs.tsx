import classnames from 'classnames'
import { Flex } from '../../Flex'
import { type BreadcrumbsProps, BreadcrumbsDefaults } from './BreadcrumbsTypes'
import styles from './Breadcrumbs.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'

/**
 * Renders a navigational breadcrumb trail for multi-step flows, marking the current step and collapsing to a back link on small containers.
 *
 * @param rawProps - The {@link BreadcrumbsProps} controlling the list of breadcrumbs, current step, and click behavior.
 * @returns The rendered breadcrumb navigation.
 * @internal
 */
export function Breadcrumbs(rawProps: BreadcrumbsProps) {
  const resolvedProps = applyMissingDefaults(rawProps, BreadcrumbsDefaults)
  const {
    className,
    breadcrumbs,
    currentBreadcrumbId,
    'aria-label': ariaLabel,
    onClick,
    isSmallContainer,
  } = resolvedProps

  const currentIndex = breadcrumbs.findIndex(b => b.id === currentBreadcrumbId)
  const previousBreadcrumb = currentIndex > 0 ? breadcrumbs[currentIndex - 1] : null

  const isPreviousBreadcrumbClickable = previousBreadcrumb?.isClickable !== false

  if (isSmallContainer && previousBreadcrumb && onClick && isPreviousBreadcrumbClickable) {
    return (
      <Flex flexDirection="column">
        <nav aria-label={ariaLabel} className={className}>
          <button
            type="button"
            className={styles.smallBack}
            onClick={() => {
              onClick(previousBreadcrumb.id)
            }}
          >
            {previousBreadcrumb.label}
          </button>
        </nav>
      </Flex>
    )
  }

  return (
    <Flex flexDirection="column">
      <nav aria-label={ariaLabel} className={className}>
        <ol className={styles.list}>
          {breadcrumbs.map(breadcrumb => {
            const isCurrentbreadcrumb = breadcrumb.id === currentBreadcrumbId
            const isClickable = breadcrumb.isClickable !== false && !isCurrentbreadcrumb && onClick

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
