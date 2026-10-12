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
import type {
  DeepPartial,
  ResourceDictionary,
  Resources,
  SupportedLanguages,
} from '@/types/Helpers'

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

function pickNamespaceDictionary<K extends keyof Resources>(
  dictionary: PayScheduleDictionary | undefined,
  ns: K,
): ResourceDictionary<K> | undefined {
  if (!dictionary) return undefined

  const picked = {} as Record<SupportedLanguages, DeepPartial<Resources[K]>>
  for (const lang in dictionary) {
    const langKey = lang as SupportedLanguages
    const nsValue = (
      dictionary[langKey] as Partial<Record<K, DeepPartial<Resources[K]>>> | undefined
    )?.[ns]
    if (nsValue) {
      picked[langKey] = nsValue
    }
  }
  return Object.keys(picked).length > 0 ? (picked as ResourceDictionary<K>) : undefined
}

/**
 * Props for {@link PaySchedule}.
 *
 * @alpha
 */
export interface PayScheduleProps extends Omit<
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
          successAlert: null,
        }),
      ),
    [companyId, enableAutoPilot, enableMultipleSchedules, initialState, initialComponent],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
