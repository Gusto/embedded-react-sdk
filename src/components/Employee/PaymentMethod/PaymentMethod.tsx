import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
import { PaymentMethodProvider } from './usePaymentMethod'
import { useEmployeePaymentMethod } from './useEmployeePaymentMethod'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { Actions } from '@/components/Employee/PaymentMethod/Actions'
import { BankAccountForm } from '@/components/Employee/PaymentMethod/BankAccountEdit'
import { BankAccountsList } from '@/components/Employee/PaymentMethod/BankAccountsList'
import { Head } from '@/components/Employee/PaymentMethod/Head'
import { PaymentTypeForm } from '@/components/Employee/PaymentMethod/PaymentTypeForm'
import { Split } from '@/components/Employee/PaymentMethod/Split'
import { useI18n } from '@/i18n'
import { useFlow } from '@/components/Flow/useFlow'
import { useComponentDictionary } from '@/i18n/I18n'

interface PaymentMethodProps extends CommonComponentInterface<'Employee.PaymentMethod'> {
  employeeId: string
  defaultValues?: never
  isAdmin?: boolean
}

export function PaymentMethod(props: PaymentMethodProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ employeeId, className, dictionary, isAdmin = false }: PaymentMethodProps) => {
  useI18n('Employee.PaymentMethod')
  useComponentDictionary('Employee.PaymentMethod', dictionary)

  const { data, actions, meta, form } = useEmployeePaymentMethod({ employeeId, isAdmin })

  return (
    <section className={className}>
      <PaymentMethodProvider
        value={{
          bankAccounts: data.bankAccounts,
          isPending: meta.isPending,
          watchedType: data.watchedType,
          mode: meta.mode,
          paymentMethod: data.paymentMethod,
          handleCancel: actions.handleCancel,
          handleAdd: actions.handleAdd,
          handleDelete: actions.handleDelete,
          handleSplit: actions.handleSplit,
          isAdmin: meta.isAdmin,
        }}
      >
        <FormProvider {...form}>
          <Form onSubmit={actions.onSubmit}>
            <Head />
            <PaymentTypeForm />
            <BankAccountsList />
            <BankAccountForm />
            <Split />
            <Actions />
          </Form>
        </FormProvider>
      </PaymentMethodProvider>
    </section>
  )
}

export const PaymentMethodContextual = () => {
  const { employeeId, onEvent, isAdmin } = useFlow<OnboardingContextInterface>()
  const { t } = useTranslation('common')

  if (!employeeId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'PaymentMethod',
        param: 'employeeId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <PaymentMethod employeeId={employeeId} onEvent={onEvent} isAdmin={isAdmin} />
}
