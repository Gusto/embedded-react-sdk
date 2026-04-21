import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import type { PayScheduleCreateUpdate } from '@gusto/embedded-api/models/components/payschedulecreateupdate'
import { payScheduleStateMachine } from './payScheduleStateMachine'
import type { PayScheduleContextInterface } from './PayScheduleComponents'
import { PayScheduleFormContextual, PayScheduleListContextual } from './PayScheduleComponents'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base'
import { BaseComponent, useBase } from '@/components/Base'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { Flow } from '@/components/Flow/Flow'
import type { RequireAtLeastOne } from '@/types/Helpers'

type PayScheduleDefaultFields = {
  [K in keyof Pick<
    PayScheduleCreateUpdate,
    'anchorPayDate' | 'anchorEndOfPayPeriod' | 'day1' | 'day2' | 'customName' | 'frequency'
  >]: NonNullable<PayScheduleCreateUpdate[K]>
}

export type PayScheduleDefaultValues = RequireAtLeastOne<Partial<PayScheduleDefaultFields>>

interface PayScheduleProps extends CommonComponentInterface<'Company.PaySchedule'> {
  companyId: string
  defaultValues?: PayScheduleDefaultValues
}

export const PaySchedule = ({
  companyId,
  defaultValues,
  dictionary,
  ...props
}: PayScheduleProps & BaseComponentInterface) => {
  useI18n('Company.PaySchedule')
  useComponentDictionary('Company.PaySchedule', dictionary)
  return (
    <BaseComponent {...props}>
      <Root companyId={companyId} defaultValues={defaultValues} />
    </BaseComponent>
  )
}

function Root({ companyId, defaultValues }: PayScheduleProps) {
  const { onEvent } = useBase()
  const { data: paySchedules } = usePaySchedulesGetAllSuspense({ companyId })

  const hasSchedules = (paySchedules.paySchedules?.length ?? 0) > 0
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
