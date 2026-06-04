import { useTranslation } from 'react-i18next'
import type { CustomTypeOptions } from 'i18next'
import { FlowBreadcrumbs } from '../Common/FlowBreadcrumbs/FlowBreadcrumbs'
import type { BreadcrumbTrail } from '../Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { Flex } from '../Common/Flex'
import { FlexItem } from '../Common'
import { useFlow } from './useFlow'
import { componentEvents, type EventType } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import CaretLeftIcon from '@/assets/icons/caret-left.svg?react'

/**
 * Renders the chrome above the active flow component (back affordance, progress bar, breadcrumbs).
 *
 * @remarks
 * Reads the discriminated `header` value from {@link FlowContext} and dispatches to the matching
 * internal renderer:
 *
 * - `header.type === 'minimal'` — back button and optional CTA.
 * - `header.type === 'progress'` — step indicator with `currentStep` / `totalSteps`.
 * - `header.type === 'breadcrumbs'` — breadcrumb trail; renders nothing while
 *   `currentBreadcrumbId` is absent so passive states (e.g. landing screens) don't reset the bar.
 *
 * When no `header` is configured, or there is no active `component` in context, nothing is
 * rendered. To add a new chrome variant: extend {@link FlowHeaderConfig}, add a renderer below,
 * and add a branch here.
 *
 * @returns A header element above the active flow component, or `null` when no header should show.
 * @internal
 */
export function FlowHeader() {
  const { header, component } = useFlow()

  if (!header || !component) return null

  switch (header.type) {
    case 'minimal':
      return <MinimalHeader back={header.back} cta={header.cta} />
    case 'progress':
      return (
        <ProgressHeader
          currentStep={header.currentStep}
          totalSteps={header.totalSteps}
          cta={header.cta}
        />
      )
    case 'breadcrumbs':
      // The breadcrumb trail is intentionally persisted across "passive"
      // states (e.g. landing screens) so that subsequent transitions can
      // pick up where they left off without rebuilding it. We render the
      // bar only when there's an active breadcrumb to show; otherwise
      // we treat the flow as "no chrome" for this state.
      if (!header.currentBreadcrumbId) return null
      return (
        <BreadcrumbsHeader
          currentBreadcrumbId={header.currentBreadcrumbId}
          breadcrumbs={header.breadcrumbs}
          cta={header.cta}
        />
      )
  }
}

function MinimalHeader({
  back,
  cta: Cta,
}: {
  back?: {
    labelKey: string
    namespace: keyof CustomTypeOptions['resources']
    event: EventType
  }
  cta?: React.ComponentType
}) {
  const { onEvent } = useFlow()
  const Components = useComponentContext()
  const { t } = useTranslation(back?.namespace)

  const label = back ? t(back.labelKey as never) : t('back')
  const event = back?.event ?? componentEvents.CANCEL

  return (
    <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
      <FlexItem>
        <Components.Button
          variant="secondary"
          icon={<CaretLeftIcon aria-hidden="true" />}
          onClick={() => {
            onEvent(event, undefined)
          }}
        >
          {label}
        </Components.Button>
      </FlexItem>
      {Cta && (
        <FlexItem>
          <Cta />
        </FlexItem>
      )}
    </Flex>
  )
}

function ProgressHeader({
  currentStep,
  totalSteps,
  cta: Cta,
}: {
  currentStep: number
  totalSteps: number
  cta?: React.ComponentType
}) {
  const Components = useComponentContext()
  const { t } = useTranslation()

  return (
    <Components.ProgressBar
      totalSteps={totalSteps}
      currentStep={currentStep}
      label={t('progressBarLabel', { totalSteps, currentStep })}
      cta={Cta}
    />
  )
}

function BreadcrumbsHeader({
  currentBreadcrumbId,
  breadcrumbs = {},
  cta: Cta,
}: {
  currentBreadcrumbId?: string
  breadcrumbs?: BreadcrumbTrail
  cta?: React.ComponentType
}) {
  const { onEvent } = useFlow()

  return (
    <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
      <FlexItem flexGrow={1}>
        <FlowBreadcrumbs
          breadcrumbs={currentBreadcrumbId ? (breadcrumbs[currentBreadcrumbId] ?? []) : []}
          currentBreadcrumbId={currentBreadcrumbId}
          onEvent={onEvent}
        />
      </FlexItem>
      <FlexItem>{Cta && <Cta />}</FlexItem>
    </Flex>
  )
}
