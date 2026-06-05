import { SplitPaymentsFormBody } from '../shared/SplitPaymentsFormBody'
import type { UseSplitPaymentsFormProps } from '../shared/useSplitPaymentsForm'
import { useOnboardingSplitFormDictionary } from './useFormDictionary'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

export interface SplitViewProps extends Omit<UseSplitPaymentsFormProps, 'employeeId'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

export function SplitView({ employeeId, onEvent, ...hookProps }: SplitViewProps) {
  const dictionary = useOnboardingSplitFormDictionary()

  return (
    <SplitPaymentsFormBody
      employeeId={employeeId}
      dictionary={dictionary}
      onSaved={data => {
        onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED, data)
      }}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
      {...hookProps}
    />
  )
}
