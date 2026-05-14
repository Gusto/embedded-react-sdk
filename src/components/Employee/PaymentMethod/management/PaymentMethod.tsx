import { createMachine } from 'robot3'
import { useMemo } from 'react'
import type { PaymentMethodContextInterface } from './PaymentMethodComponents'
import {
  ListViewContextual,
  BankFormContextual,
  SplitViewContextual,
} from './PaymentMethodComponents'
import { paymentMethodStateMachine } from './paymentMethodStateMachine'
import { Flow } from '@/components/Flow/Flow'
import {
  BaseBoundaries,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { type EventType } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'
import type { OnEventType } from '@/components/Base/useBase'

export interface PaymentMethodProps extends CommonComponentInterface<'Employee.PaymentMethod'> {
  employeeId: string
  defaultValues?: never
  isAdmin?: boolean
  initialState?: 'list' | 'add' | 'split'
  onEvent: OnEventType<EventType, unknown>
}

function PaymentMethodFlow({
  employeeId,
  isAdmin = true,
  initialState = 'list',
  onEvent,
}: PaymentMethodProps) {
  useI18n('Employee.PaymentMethod')

  const initialComponent =
    initialState === 'add'
      ? BankFormContextual
      : initialState === 'split'
        ? SplitViewContextual
        : ListViewContextual

  const machine = useMemo(
    () =>
      createMachine(
        initialState,
        paymentMethodStateMachine,
        (ctx: PaymentMethodContextInterface) => ({
          ...ctx,
          component: initialComponent,
          employeeId,
          isAdmin,
        }),
      ),
    [employeeId, isAdmin, initialState, initialComponent],
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
    <BaseBoundaries
      componentName="Employee.PaymentMethod.Management"
      FallbackComponent={FallbackComponent}
    >
      <PaymentMethodFlow {...props} />
    </BaseBoundaries>
  )
}
