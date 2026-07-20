import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { payScheduleStateMachine } from './payScheduleStateMachine'
import type { PayScheduleContextInterface } from './PayScheduleComponents'
import { PayScheduleFormContextual, PayScheduleListContextual } from './PayScheduleComponents'
import type { PayScheduleFormData } from './shared/usePayScheduleForm/payScheduleSchema'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseComponent, useBase } from '@/components/Base'
import type { BaseComponentKeys } from '@/components/Base/Base'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { Flow } from '@/components/Flow/Flow'
import type { RequireAtLeastOne } from '@/types/Helpers'

/**
 * The full set of fields that may be pre-filled on the {@link PaySchedule} create form.
 *
 * @public
 */
export type PayScheduleDefaultFields = {
  [
    K in keyof Pick<
      PayScheduleFormData,
      'anchorPayDate' | 'anchorEndOfPayPeriod' | 'day1' | 'day2' | 'customName' | 'frequency'
    >
  ]: NonNullable<PayScheduleFormData[K]>
}

/**
 * Default values for the {@link PaySchedule} form fields. Server data for an existing pay schedule
 * takes precedence over these defaults when editing.
 *
 * @public
 */
export type PayScheduleDefaultValues = RequireAtLeastOne<Partial<PayScheduleDefaultFields>>

/**
 * Props for the {@link PaySchedule} component.
 *
 * @public
 */
export interface PayScheduleProps extends BaseComponentInterface<'Company.PaySchedule'> {
  /** Identifier of the company whose pay schedules are managed. */
  companyId: string
  /** Default values used to pre-fill the create form. Ignored fields not listed in {@link PayScheduleDefaultValues}. */
  defaultValues?: PayScheduleDefaultValues
}

/**
 * Manages a company's pay schedules, including listing existing schedules and creating or editing one.
 *
 * @remarks
 * Renders the schedule list when at least one pay schedule exists and the create form otherwise.
 * Emits the following events through `onEvent`:
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `paySchedule/created` | A new pay schedule was created | The created pay schedule entity |
 * | `paySchedule/updated` | An existing pay schedule was updated | The updated pay schedule entity |
 *
 * @param props - {@link PayScheduleProps} plus the standard base component props.
 * @returns The pay schedule list or form depending on whether any schedules exist.
 * @public
 */
export const PaySchedule = ({
  companyId,
  defaultValues,
  dictionary,
  ...props
}: PayScheduleProps) => {
  useI18n('Company.PaySchedule')
  useComponentDictionary('Company.PaySchedule', dictionary)
  return (
    <BaseComponent {...props}>
      <Root companyId={companyId} defaultValues={defaultValues} />
    </BaseComponent>
  )
}

function Root({ companyId, defaultValues }: Omit<PayScheduleProps, BaseComponentKeys>) {
  const { onEvent } = useBase()
  const { data: paySchedules } = usePaySchedulesGetAllSuspense({ companyId })

  const hasSchedules = (paySchedules.payScheduleShowResponse?.length ?? 0) > 0
  const initialState = hasSchedules ? 'listSchedules' : 'addSchedule'
  const initialComponent = hasSchedules ? PayScheduleListContextual : PayScheduleFormContextual

  const machine = useMemo(
    () =>
      createMachine(
        initialState,
        payScheduleStateMachine,
        (initialContext: PayScheduleContextInterface) => ({
          ...initialContext,
          component: initialComponent,
          companyId,
          defaultValues,
        }),
      ),
    [companyId, defaultValues, initialState, initialComponent],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
