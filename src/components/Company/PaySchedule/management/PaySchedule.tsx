import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { payScheduleBlockStateMachine } from './payScheduleBlockStateMachine'
import type { PayScheduleBlockContextInterface } from './PayScheduleComponents'
import { PaySchedulesCardContextual } from './PayScheduleComponents'
import type { PayScheduleDictionary } from './PayScheduleEditScreen'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseBoundaries } from '@/components/Base'
import { Flow } from '@/components/Flow/Flow'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { pickNamespaceDictionary } from '@/i18n/pickNamespaceDictionary'

/**
 * Props for the {@link PaySchedule} management block.
 *
 * @alpha
 */
export interface PayScheduleProps extends Omit<
  BaseComponentInterface<'Company.Management.PaySchedule'>,
  'dictionary'
> {
  /** The associated company identifier. */
  companyId: string
  /** Adds the AutoPilot row and its Edit action to the schedule surface. */
  enableAutoPilot?: boolean
  /** Adds the Manage action that opens employee assignment. */
  enableMultipleSchedules?: boolean
  /** Translation overrides for this block and the schedule screens it opens. */
  dictionary?: PayScheduleDictionary
}

/**
 * A company's pay schedules, as a self-contained card and editor.
 *
 * @remarks
 * Opens on `PaySchedulesCard` and swaps to the pay schedule surface when its action is used,
 * returning to the card via the "Back to pay schedules" header. Opening it from the card's
 * empty state lands on the create form, since the surface opens there when the company has no
 * schedule yet.
 *
 * Unlike the other management blocks this one shows no success alert on the card. The surface
 * behind it is a hub in its own right — its schedule form, employee assignment wizard and
 * AutoPilot dialog each return to its own overview and it shows its own alerts for each — so
 * there is nothing to defer to the card and no completion event to return on. The back header
 * is the only way out.
 *
 * Use this when a single pay schedules surface is wanted on its own.
 * `CompanyManagement.Dashboard` composes `PaySchedulesCard` directly instead, so that a card's
 * action routes within the dashboard rather than opening a second, nested editor.
 *
 * Requires both the `companySettingsDashboard` and `managePaySchedules` unstable feature flags
 * — the first for the card, the second for the schedule surface. Mounting it without either
 * throws.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/paySchedule/editRequested` | The card's action was used | `{ companyId: string }` |
 * | `company/management/paySchedule/editCancelled` | The surface was left via the back header | — |
 *
 * @param props - See {@link PayScheduleProps}.
 * @returns The rendered pay schedule management block.
 * @alpha
 *
 * @example
 * ```tsx
 * import { CompanyManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <CompanyManagement.PaySchedule
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function PaySchedule({
  companyId,
  enableAutoPilot,
  enableMultipleSchedules,
  onEvent,
  dictionary,
  FallbackComponent,
  LoaderComponent,
}: PayScheduleProps) {
  // Both gates, so the block fails loudly and immediately rather than deep inside the card or
  // the surface, which each check one of them.
  useUnstableFeature('companySettingsDashboard', { throwIfDisabled: true })
  useUnstableFeature('managePaySchedules', { throwIfDisabled: true })

  useI18n('Company.Management.PaySchedule')
  useComponentDictionary(
    'Company.Management.PaySchedule',
    pickNamespaceDictionary(dictionary, 'Company.Management.PaySchedule'),
  )
  useI18n('Company.Management.PaySchedules')

  const machine = useMemo(
    () =>
      createMachine(
        'card',
        payScheduleBlockStateMachine,
        (ctx: PayScheduleBlockContextInterface) => ({
          ...ctx,
          component: PaySchedulesCardContextual,
          companyId,
          enableAutoPilot,
          enableMultipleSchedules,
          LoaderComponent,
        }),
      ),
    [companyId, enableAutoPilot, enableMultipleSchedules, LoaderComponent],
  )

  return (
    <BaseBoundaries
      componentName="Company.Management.PaySchedule"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <Flow machine={machine} onEvent={onEvent} />
    </BaseBoundaries>
  )
}
