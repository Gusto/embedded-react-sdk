import classnames from 'classnames'
import type { CustomTypeOptions } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Flex } from '../../Flex'
import type { ProgressBreadcrumbsProps } from './ProgressBreadcrumbsTypes'
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
    breadcrumbs.reduce<Array<keyof CustomTypeOptions['resources']>>((acc, step) => {
      if (step.namespace) {
        acc.push(step.namespace as keyof CustomTypeOptions['resources'])
      }
      return acc
    }, []),
  )

  const handleBreadcrumbClick = (stepKey: string, index: number) => {
    if (onEvent) {
      onEvent(componentEvents.BREADCRUMB_NAVIGATE, { key: stepKey })
    }
  }

  return (
    <Flex flexDirection="column">
      {Cta && <Cta />}
      <nav aria-label={'Progress Breadcrumbs'} className={classnames(styles.root, className)}>
        <ol className={styles.list}>
          {breadcrumbs.map((step, index) => {
            const isCurrentStep = step.key === currentBreadcrumb
            const isClickable = !isCurrentStep && onEvent

            const translatedLabel = step.namespace
              ? (t(step.label, {
                  ns: step.namespace,
                  defaultValue: step.label,
                  ...step.variables,
                } as never) as unknown as string)
              : (t(step.label, {
                  defaultValue: step.label,
                  ...step.variables,
                } as never) as unknown as string)

            return (
              <li
                key={step.key}
                className={classnames(styles.item, isClickable && styles.clickable)}
                aria-current={isCurrentStep ? 'step' : undefined}
              >
                {isClickable ? (
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() => {
                      handleBreadcrumbClick(step.key, index)
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
