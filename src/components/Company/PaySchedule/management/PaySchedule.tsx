import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { payScheduleManagementStateMachine } from './payScheduleManagementStateMachine'
import type { PayScheduleManagementContextInterface } from './PayScheduleManagementComponents'
import { PayScheduleOverviewContextual } from './PayScheduleManagementComponents'
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

  const machine = useMemo(
    () =>
      createMachine(
        'overview',
        payScheduleManagementStateMachine,
        (initialContext: PayScheduleManagementContextInterface) => ({
          ...initialContext,
          component: PayScheduleOverviewContextual,
          companyId,
          enableAutoPilot,
          enableMultipleSchedules,
          successAlert: null,
        }),
      ),
    [companyId, enableAutoPilot, enableMultipleSchedules],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
