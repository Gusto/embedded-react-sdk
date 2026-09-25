import { createMachine } from 'robot3'
import { useMemo, useState } from 'react'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { payScheduleManagementStateMachine } from './payScheduleManagementStateMachine'
import type { PayScheduleManagementContextInterface } from './PayScheduleManagementComponents'
import {
  PayScheduleOverviewContextual,
  PayScheduleEditFormContextual,
} from './PayScheduleManagementComponents'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseComponent, useBase } from '@/components/Base'
import type { BaseComponentKeys } from '@/components/Base/Base'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { Flow } from '@/components/Flow/Flow'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'

/**
 * Props for {@link PaySchedule}.
 *
 * @alpha
 */
export interface PayScheduleProps extends BaseComponentInterface<'Company.Management.PaySchedule'> {
  /** Company whose pay schedule is managed. */
  companyId: string
  /** Shows the AutoPilot row and its Edit action. */
  enableAutoPilot?: boolean
  /** Shows the Manage action. */
  enableMultipleSchedules?: boolean
}

/**
 * Manages a company's pay schedule after onboarding.
 *
 * @remarks
 * Renders the overview when the company already has a pay schedule, or the create form
 * directly when it doesn't.
 *
 * @alpha
 */
export const PaySchedule = ({
  companyId,
  enableAutoPilot,
  enableMultipleSchedules,
  dictionary,
  ...props
}: PayScheduleProps) => {
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
}: Omit<PayScheduleProps, BaseComponentKeys>) {
  useI18n('Company.Management.PaySchedule')
  useComponentDictionary('Company.Management.PaySchedule', dictionary)
  // PayScheduleEditFormContextual reuses the onboarding PayScheduleForm, whose translations
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
    initialComponent: typeof PayScheduleOverviewContextual | typeof PayScheduleEditFormContextual
  }>(() => {
    const hasSchedules = (paySchedules.payScheduleShowResponse?.length ?? 0) > 0
    return {
      initialState: hasSchedules ? 'overview' : 'createSchedule',
      initialComponent: hasSchedules
        ? PayScheduleOverviewContextual
        : PayScheduleEditFormContextual,
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
        }),
      ),
    [companyId, enableAutoPilot, enableMultipleSchedules, initialState, initialComponent],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
