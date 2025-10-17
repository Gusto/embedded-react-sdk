import type { CustomTypeOptions } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import type { FlowBreadcrumbsProps } from './FlowBreadcrumbsTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents } from '@/shared/constants'

export function FlowBreadcrumbs({
  breadcrumbs,
  currentBreadcrumbId,
  onEvent,
}: FlowBreadcrumbsProps) {
  const { Breadcrumbs } = useComponentContext()
  //TODO: this is not working
  const namespaces = breadcrumbs.reduce<Array<keyof CustomTypeOptions['resources']>>(
    (acc, breadcrumb) => {
      if (breadcrumb.namespace) {
        acc.push(breadcrumb.namespace as keyof CustomTypeOptions['resources'])
      }
      return acc
    },
    [],
  )
  const { t } = useTranslation(namespaces)

  const parsedBreadcrumbs = useMemo(
    () =>
      breadcrumbs.map(breadcrumb => {
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
        return {
          id: breadcrumb.id,
          label: translatedLabel,
        }
      }),
    [breadcrumbs, t],
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
    <Breadcrumbs
      breadcrumbs={parsedBreadcrumbs}
      currentBreadcrumbId={currentBreadcrumbId}
      onClick={handleBreadcrumbClick}
    />
  )
}
