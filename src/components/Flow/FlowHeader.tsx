import { useTranslation } from 'react-i18next'
import type { CustomTypeOptions } from 'i18next'
import { FlowBreadcrumbs } from '../Common/FlowBreadcrumbs/FlowBreadcrumbs'
import type { BreadcrumbTrail } from '../Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { Flex } from '../Common/Flex'
import { FlexItem } from '../Common'
import { useFlow } from './useFlow'
import { type EventType } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import CaretLeftIcon from '@/assets/icons/caret-left.svg?react'

/**
 * Renders the chrome above the active flow component.
 *
 * @remarks
 * Reads the `header` value from {@link FlowContext} and composes three independent pieces:
 *
 * - `back` — if set, a destination-labeled back button rendered above the indicator row.
 * - `indicator` — `'progress'` renders a step indicator; `'breadcrumbs'` renders a trail
 *   (and is suppressed while `currentBreadcrumbId` is absent so passive landing states
 *   don't reset the bar); `'none'` renders no indicator.
 * - `cta` — optional component composed alongside the indicator. For `progress`, the CTA
 *   is embedded inside the progress bar component; otherwise it sits next to the back
 *   button (when `indicator` is `'none'`) or breadcrumbs trail.
 *
 * Returns `null` when there is no active `component`, no `header`, or the `header` would
 * produce no visible chrome (e.g. `{ indicator: 'none' }` with no `back` and no `cta`).
 *
 * @returns A header element above the active flow component, or `null` when no header should show.
 * @internal
 */
export function FlowHeader() {
  const { header, component } = useFlow()

  if (!header || !component) return null

  const { back, cta: Cta, indicator } = header

  if (indicator === 'progress') {
    return (
      <>
        {back && <BackRow back={back} />}
        <ProgressIndicator
          currentStep={header.currentStep}
          totalSteps={header.totalSteps}
          cta={Cta}
        />
      </>
    )
  }

  if (indicator === 'breadcrumbs') {
    return (
      <>
        {back && <BackRow back={back} />}
        {header.currentBreadcrumbId && (
          <BreadcrumbsIndicator
            currentBreadcrumbId={header.currentBreadcrumbId}
            breadcrumbs={header.breadcrumbs}
            cta={Cta}
          />
        )}
      </>
    )
  }

  if (!back && !Cta) return null

  return (
    <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
      {back && (
        <FlexItem>
          <BackButton back={back} />
        </FlexItem>
      )}
      {Cta && (
        <FlexItem>
          <Cta />
        </FlexItem>
      )}
    </Flex>
  )
}

function BackRow({
  back,
}: {
  back: {
    labelKey: string
    namespace: keyof CustomTypeOptions['resources']
    event: EventType
  }
}) {
  return (
    <Flex flexDirection="row" alignItems="center">
      <FlexItem>
        <BackButton back={back} />
      </FlexItem>
    </Flex>
  )
}

function BackButton({
  back,
}: {
  back: {
    labelKey: string
    namespace: keyof CustomTypeOptions['resources']
    event: EventType
  }
}) {
  const { onEvent } = useFlow()
  const Components = useComponentContext()
  // Pass the namespace per-call via the `ns` option rather than binding it via
  // `useTranslation(ns)`. The hook caches the namespace on first render and
  // does not re-bind when the `back.namespace` prop changes between steps,
  // which leaves `t(key)` resolving against a stale namespace and returning
  // the key literal.
  const { t } = useTranslation()
  const label = t(back.labelKey as never, { ns: back.namespace })

  return (
    <Components.Button
      variant="secondary"
      icon={<CaretLeftIcon aria-hidden="true" />}
      onClick={() => {
        onEvent(back.event, undefined)
      }}
    >
      {label}
    </Components.Button>
  )
}

function ProgressIndicator({
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

function BreadcrumbsIndicator({
  currentBreadcrumbId,
  breadcrumbs = {},
  cta: Cta,
}: {
  currentBreadcrumbId: string
  breadcrumbs?: BreadcrumbTrail
  cta?: React.ComponentType
}) {
  const { onEvent } = useFlow()

  return (
    <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
      <FlexItem flexGrow={1}>
        <FlowBreadcrumbs
          breadcrumbs={breadcrumbs[currentBreadcrumbId] ?? []}
          currentBreadcrumbId={currentBreadcrumbId}
          onEvent={onEvent}
        />
      </FlexItem>
      <FlexItem>{Cta && <Cta />}</FlexItem>
    </Flex>
  )
}
