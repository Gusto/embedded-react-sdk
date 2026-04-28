import { useTranslation } from 'react-i18next'
import { FlowBreadcrumbs } from '../Common/FlowBreadcrumbs/FlowBreadcrumbs'
import type { BreadcrumbTrail } from '../Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { Flex } from '../Common/Flex'
import { FlexItem } from '../Common'
import { useFlow } from './useFlow'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import CaretLeftIcon from '@/assets/icons/caret-left.svg?react'

/**
 * Renders the chrome above the active flow component (back affordance,
 * progress bar, breadcrumbs, ...). Layout is driven by a single
 * discriminated `header` field on the flow context. Each variant maps to a
 * focused renderer below:
 *
 *   header.type === 'minimal'     → MinimalHeader
 *   header.type === 'progress'    → ProgressHeader
 *   header.type === 'breadcrumbs' → BreadcrumbsHeader
 *
 * To add a new piece of chrome:
 *   1. Add a new variant to `FlowHeaderConfig` in `useFlow.ts`.
 *   2. Add a new renderer function below.
 *   3. Branch on it in `FlowHeader`.
 */
export function FlowHeader() {
  const { header, component } = useFlow()

  if (!header || !component) return null

  switch (header.type) {
    case 'minimal':
      return <MinimalHeader cta={header.cta} />
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

function MinimalHeader({ cta: Cta }: { cta?: React.ComponentType }) {
  const { onEvent } = useFlow()
  const Components = useComponentContext()
  const { t } = useTranslation()

  return (
    <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
      <FlexItem>
        <Components.Button
          variant="tertiary"
          icon={<CaretLeftIcon aria-hidden="true" />}
          onClick={() => {
            onEvent(componentEvents.CANCEL, undefined)
          }}
        >
          {t('back')}
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
