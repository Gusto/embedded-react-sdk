import { createMachine } from 'robot3'
import { useMemo } from 'react'
import type { PaymentMethodContextInterface } from './PaymentMethodComponents'
import { CardContextual, BankFormContextual, SplitViewContextual } from './PaymentMethodComponents'
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

export interface PaymentMethodProps extends CommonComponentInterface<'Employee.Management.PaymentMethod'> {
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
  useI18n('Employee.Management.PaymentMethod')

  const initialComponent =
    initialState === 'add'
      ? BankFormContextual
      : initialState === 'split'
        ? SplitViewContextual
        : CardContextual

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
          successAlert: null,
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
}: PaymentMethodProps & BaseComponentInterface<'Employee.Management.PaymentMethod'>) {
  useComponentDictionary('Employee.Management.PaymentMethod', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.PaymentMethod"
      FallbackComponent={FallbackComponent}
    >
      <PaymentMethodFlow {...props} />
    </BaseBoundaries>
  )
}
