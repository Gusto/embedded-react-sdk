import classnames from 'classnames'
import type { CustomTypeOptions } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Flex } from '../../Flex'
import type { Breadcrumb, ProgressBreadcrumbsProps } from './ProgressBreadcrumbsTypes'
import styles from './ProgressBreadcrumbs.module.scss'
import { componentEvents } from '@/shared/constants'

export function ProgressBreadcrumbs({
  className,
  breadcrumbs,
  currentBreadcrumb,
  cta: Cta,
  onEvent,
}: ProgressBreadcrumbsProps) {
  const { t } = useTranslation(
    breadcrumbs.reduce<Array<keyof CustomTypeOptions['resources']>>((acc, breadcrumb) => {
      if (breadcrumb.namespace) {
        acc.push(breadcrumb.namespace as keyof CustomTypeOptions['resources'])
      }
      return acc
    }, []),
  )

  const handleBreadcrumbClick = (breadcrumb: Breadcrumb) => {
    if (onEvent) {
      onEvent(componentEvents.BREADCRUMB_NAVIGATE, {
        key: breadcrumb.key,
        onNavigate: breadcrumb.onNavigate,
      })
    }
  }

  return (
    <Flex flexDirection="column">
      {Cta && <Cta />}
      <nav aria-label={'Progress Breadcrumbs'} className={classnames(styles.root, className)}>
        <ol className={styles.list}>
          {breadcrumbs.map((breadcrumb, index) => {
            const isCurrentbreadcrumb = breadcrumb.key === currentBreadcrumb
            const isClickable = !isCurrentbreadcrumb && onEvent

            const translatedLabel = breadcrumb.namespace
              ? (t(breadcrumb.label, {
                  ns: breadcrumb.namespace,
                  defaultValue: breadcrumb.label,
                  ...breadcrumb.variables,
                } as never) as unknown as string)
              : (t(breadcrumb.label, {
                  defaultValue: breadcrumb.label,
                  ...breadcrumb.variables,
                } as never) as unknown as string)

            return (
              <li
                key={breadcrumb.key}
                className={classnames(styles.item, isClickable && styles.clickable)}
                aria-current={isCurrentbreadcrumb ? 'step' : false}
              >
                {isClickable ? (
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() => {
                      handleBreadcrumbClick(breadcrumb)
                    }}
                  >
                    {translatedLabel}
                  </button>
                ) : (
                  <span>{translatedLabel}</span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </Flex>
  )
}
