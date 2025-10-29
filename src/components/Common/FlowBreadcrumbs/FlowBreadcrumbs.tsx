import type { CustomTypeOptions } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useMemo, useRef } from 'react'
import type { FlowBreadcrumbsProps } from './FlowBreadcrumbsTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents } from '@/shared/constants'
import { useI18n } from '@/i18n/I18n'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'
import { formatDateForBreadcrumb } from '@/helpers/dateFormatting'
import { useContainerBreakpoints } from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'

export function FlowBreadcrumbs({
  breadcrumbs,
  currentBreadcrumbId,
  onEvent,
}: FlowBreadcrumbsProps) {
  const breadcrumbContainerRef = useRef<HTMLDivElement | null>(null)
  const breakpoints = useContainerBreakpoints({ ref: breadcrumbContainerRef })
  // Small if we only contain the base breakpoint
  const isSmallContainer = breakpoints.length === 1

  const { Breadcrumbs } = useComponentContext()
  const { locale } = useLocale()
  const namespaces = breadcrumbs.reduce<Array<keyof CustomTypeOptions['resources']>>(
    (acc, breadcrumb) => {
      if (breadcrumb.namespace) {
        acc.push(breadcrumb.namespace as keyof CustomTypeOptions['resources'])
      }
      return acc
    },
    [],
  )
  useI18n(namespaces)
  const { t } = useTranslation(namespaces)
  const parsedBreadcrumbs = useMemo(
    () =>
      breadcrumbs.map(breadcrumb => {
        const formattedVariables = breadcrumb.variables
          ? {
              ...breadcrumb.variables,
              startDate:
                typeof breadcrumb.variables.startDate === 'string'
                  ? formatDateForBreadcrumb(breadcrumb.variables.startDate, locale)
                  : breadcrumb.variables.startDate,
              endDate:
                typeof breadcrumb.variables.endDate === 'string'
                  ? formatDateForBreadcrumb(breadcrumb.variables.endDate, locale)
                  : breadcrumb.variables.endDate,
            }
          : undefined

        const translatedLabel = breadcrumb.namespace
          ? (t(breadcrumb.label, {
              ns: breadcrumb.namespace,
              defaultValue: breadcrumb.label,
              ...formattedVariables,
            } as never) as unknown as string)
          : (t(breadcrumb.label, {
              defaultValue: breadcrumb.label,
              ...formattedVariables,
            } as never) as unknown as string)
        return {
          id: breadcrumb.id,
          label: translatedLabel,
        }
      }),
    [breadcrumbs, t, locale],
  )

  const handleBreadcrumbClick = (breadcrumbId: string) => {
    const breadcrumb = breadcrumbs.find(breadcrumb => breadcrumb.id === breadcrumbId)
    if (onEvent && breadcrumb) {
      onEvent(componentEvents.BREADCRUMB_NAVIGATE, {
        key: breadcrumbId,
        onNavigate: breadcrumb.onNavigate,
      })
    }
  }
  return (
    <div ref={breadcrumbContainerRef}>
      <Breadcrumbs
        isSmallContainer={isSmallContainer}
        breadcrumbs={parsedBreadcrumbs}
        currentBreadcrumbId={currentBreadcrumbId}
        onClick={handleBreadcrumbClick}
      />
    </div>
  )
}
