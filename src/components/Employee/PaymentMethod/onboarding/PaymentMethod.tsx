import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { useEmployeePaymentMethodsGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodsGetBankAccounts'
import type { OnboardingContextInterface } from '../../OnboardingFlow/OnboardingFlowComponents'
import type { PaymentMethodContextInterface } from '../shared/PaymentMethodComponents'
import { InitialViewContextual, ListViewContextual } from '../shared/PaymentMethodComponents'
import { paymentMethodStateMachine } from './paymentMethodStateMachine'
import { Flow } from '@/components/Flow/Flow'
import { useFlow } from '@/components/Flow/useFlow'
import { BaseComponent, type BaseComponentInterface, type CommonComponentInterface } from '@/components/Base'
import { type EventType } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { OnEventType } from '@/components/Base/useBase'

export interface PaymentMethodProps extends CommonComponentInterface<'Employee.PaymentMethod'> {
  employeeId: string
  defaultValues?: never
  isAdmin?: boolean
}

function PaymentMethodFlow({
  employeeId,
  isAdmin = false,
  onEvent,
}: PaymentMethodProps & { onEvent: OnEventType<EventType, unknown> }) {
  useI18n('Employee.PaymentMethod')

  const { data: bankAccountsList } = useEmployeePaymentMethodsGetBankAccountsSuspense({
    employeeId,
  })
  const bankAccountCount = bankAccountsList.employeeBankAccounts!.length

  const machine = useMemo(
    () =>
      createMachine(
        bankAccountCount === 0 ? 'initial' : 'list',
        paymentMethodStateMachine,
        (): PaymentMethodContextInterface => ({
          component: bankAccountCount === 0 ? InitialViewContextual : ListViewContextual,
          onEvent,
          employeeId,
          isAdmin,
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

export function PaymentMethod({ dictionary, ...props }: PaymentMethodProps & BaseComponentInterface) {
  useComponentDictionary('Employee.PaymentMethod', dictionary)
  return (
    <BaseComponent {...props}>
      <PaymentMethodFlow {...props} />
    </BaseComponent>
  )
}

export function PaymentMethodContextual() {
  const { employeeId, onEvent, isAdmin } = useFlow<OnboardingContextInterface>()
  return (
    <PaymentMethod
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
      isAdmin={isAdmin}
    />
  )
}
