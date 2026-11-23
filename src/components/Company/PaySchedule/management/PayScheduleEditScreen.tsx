import { createMachine } from 'robot3'
import { useMemo, useState } from 'react'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { payScheduleManagementStateMachine } from './payScheduleManagementStateMachine'
import type { PayScheduleManagementContextInterface } from './PayScheduleManagementComponents'
import {
  PayScheduleOverviewContextual,
  PayScheduleCreateFormContextual,
} from './PayScheduleManagementComponents'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseComponent, useBase } from '@/components/Base'
import type { BaseComponentKeys } from '@/components/Base/Base'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { pickNamespaceDictionary } from '@/i18n/pickNamespaceDictionary'
import { Flow } from '@/components/Flow/Flow'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import type { DeepPartial, Resources, SupportedLanguages } from '@/types/Helpers'

/**
 * Translation overrides for {@link PaySchedule}, covering both its own namespace and
 * `Company.Management.AutoPilotDialog` — the AutoPilot dialog is an internal spoke of this
 * flow with no standalone `dictionary` prop of its own.
 *
 * @alpha
 */
export type PayScheduleDictionary = {
  [Lang in SupportedLanguages]?: {
    'Company.Management.PaySchedule'?: DeepPartial<Resources['Company.Management.PaySchedule']>
    'Company.Management.AutoPilotDialog'?: DeepPartial<
      Resources['Company.Management.AutoPilotDialog']
    >
  }
}

/**
 * Props for {@link PaySchedule}.
 *
 * @alpha
 */
export interface PayScheduleEditScreenProps extends Omit<
  BaseComponentInterface<'Company.Management.PaySchedule'>,
  'dictionary'
> {
  /** Company whose pay schedule is managed. */
  companyId: string
  /** Shows the AutoPilot row and its Edit action. */
  enableAutoPilot?: boolean
  /** Shows the Manage action. */
  enableMultipleSchedules?: boolean
  /** Overrides for this flow's i18n strings, including the AutoPilot dialog's. */
  dictionary?: PayScheduleDictionary
}

/**
 * The pay schedule overview, form, employee assignment and AutoPilot screens as a single
 * management surface.
 *
 * @remarks
 * Mounted by both management orchestrators — the {@link PaySchedule} block and
 * `CompanyManagement.DashboardFlow`.
 *
 * A hub in its own right: the schedule form, assignment wizard and AutoPilot dialog each
 * return to its own overview, and it shows its own success alerts rather than raising a
 * completion event. That is why the hosting machines give it no save transition at all — the
 * back header is the only way out.
 *
 * Opens on the create form when the company has no schedule yet, so a company without one
 * lands on the screen that creates it.
 *
 * Requires the `managePaySchedules` unstable feature flag; mounting it without the flag throws.
 *
 * @param props - See {@link PayScheduleEditScreenProps}.
 * @returns The pay schedule surface.
 * @internal
 */
export const PayScheduleEditScreen = ({
  companyId,
  enableAutoPilot,
  enableMultipleSchedules,
  dictionary,
  ...props
}: PayScheduleEditScreenProps) => {
  useUnstableFeature('managePaySchedules', { throwIfDisabled: true })

  return (
    <BaseComponent {...props}>
      <Root
        companyId={companyId}
        enableAutoPilot={enableAutoPilot}
        enableMultipleSchedules={enableMultipleSchedules}
        dictionary={dictionary}
      />
    </BaseComponent>
  )
}

function Root({
  companyId,
  enableAutoPilot,
  enableMultipleSchedules,
  dictionary,
}: Omit<PayScheduleEditScreenProps, BaseComponentKeys>) {
  useI18n('Company.Management.PaySchedule')
  useComponentDictionary(
    'Company.Management.PaySchedule',
    pickNamespaceDictionary(dictionary, 'Company.Management.PaySchedule'),
  )
  // AutoPilotDialog is an internal spoke off PayScheduleOverviewContextual, not standalone-
  // mountable, so PaySchedule's own dictionary covers this namespace too.
  useI18n('Company.Management.AutoPilotDialog')
  useComponentDictionary(
    'Company.Management.AutoPilotDialog',
    pickNamespaceDictionary(dictionary, 'Company.Management.AutoPilotDialog'),
  )
  // The schedule form contextuals reuse the onboarding PayScheduleForm, whose translations
  // live under its own namespace and are otherwise never loaded from this flow.
  useI18n('Company.PaySchedule')
  const { onEvent } = useBase()
  const { data: paySchedules } = usePaySchedulesGetAllSuspense({ companyId })

  /**
   * Freeze the initial routing decision. Recomputing it after a later refetch (e.g. once the
   * first schedule is created) would re-seat the machine and orphan its interpreter.
   */
  const [{ initialState, initialComponent }] = useState<{
    initialState: keyof typeof payScheduleManagementStateMachine
    initialComponent: typeof PayScheduleOverviewContextual | typeof PayScheduleCreateFormContextual
  }>(() => {
    const hasSchedules = (paySchedules.payScheduleShowResponse?.length ?? 0) > 0
    return {
      initialState: hasSchedules ? 'overview' : 'createSchedule',
      initialComponent: hasSchedules
        ? PayScheduleOverviewContextual
        : PayScheduleCreateFormContextual,
    }
  })

  const machine = useMemo(
    () =>
      createMachine(
        initialState,
        payScheduleManagementStateMachine,
        (initialContext: PayScheduleManagementContextInterface) => ({
          ...initialContext,
          component: initialComponent,
          companyId,
          enableAutoPilot,
          enableMultipleSchedules,
          successAlert: null,
        }),
      ),
    [companyId, enableAutoPilot, enableMultipleSchedules, initialState, initialComponent],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
