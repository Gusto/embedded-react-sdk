import { createMachine } from 'robot3'
import { useMemo } from 'react'
import type { OnboardingContextInterface } from '../../OnboardingFlow/OnboardingFlowComponents'
import type { PaymentMethodContextInterface } from './PaymentMethodComponents'
import { ListViewContextual } from './PaymentMethodComponents'
import { paymentMethodStateMachine } from './paymentMethodStateMachine'
import { Flow } from '@/components/Flow/Flow'
import { useFlow } from '@/components/Flow/useFlow'
import {
  BaseBoundaries,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { type EventType } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { OnEventType } from '@/components/Base/useBase'

export interface PaymentMethodProps extends CommonComponentInterface<'Employee.PaymentMethod'> {
  employeeId: string
  defaultValues?: never
  isAdmin?: boolean
  onEvent: OnEventType<EventType, unknown>
}

function PaymentMethodFlow({ employeeId, isAdmin = false, onEvent }: PaymentMethodProps) {
  useI18n('Employee.PaymentMethod')

  const machine = useMemo(
    () =>
      createMachine(
        'list',
        paymentMethodStateMachine,
        (initialContext: PaymentMethodContextInterface) => ({
          ...initialContext,
          component: ListViewContextual,
          employeeId,
          isAdmin,
        }),
      ),
    [employeeId, isAdmin],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

export function PaymentMethod({
  dictionary,
  FallbackComponent,
  ...props
}: PaymentMethodProps & BaseComponentInterface) {
  useComponentDictionary('Employee.PaymentMethod', dictionary)
  return (
    <BaseBoundaries componentName="Employee.PaymentMethod" FallbackComponent={FallbackComponent}>
      <PaymentMethodFlow {...props} />
    </BaseBoundaries>
  )
}

export function PaymentMethodContextual() {
  const { employeeId, onEvent, isAdmin } = useFlow<OnboardingContextInterface>()
  return (
    <PaymentMethod employeeId={ensureRequired(employeeId)} onEvent={onEvent} isAdmin={isAdmin} />
  )
}
