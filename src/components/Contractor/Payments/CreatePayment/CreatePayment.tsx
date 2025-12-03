import { CreatePaymentPresentation } from './CreatePaymentPresentation'
import { useComponentDictionary } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

interface CreatePaymentProps extends BaseComponentInterface<'Contractor.Payments.CreatePayment'> {
  companyId: string
}

export function CreatePayment(props: CreatePaymentProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ companyId, dictionary, onEvent, children }: CreatePaymentProps) => {
  useComponentDictionary('Contractor.Payments.CreatePayment', dictionary)

  const onSaveAndContinue = () => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_REVIEW)
  }
  const onEditContractor = () => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_EDIT)
  }
  return (
    <CreatePaymentPresentation
      contractors={[
        {
          contractorName: 'Louis Armstrong',
          uuid: '1',
          contractorUuid: 'armstrong-louis',
          wageType: 'Fixed',
          paymentMethod: 'Direct Deposit',
          hours: undefined,
          wage: '1000',
          bonus: '0',
          reimbursement: '0',
          wageTotal: '1000',
        },
      ]}
      paymentDate="2025-09-17"
      onPaymentDateChange={() => {}}
      onSaveAndContinue={onSaveAndContinue}
      onEditContractor={onEditContractor}
      totals={{
        amount: '1180',
        debitAmount: '1180',
        wageAmount: '1000',
        reimbursementAmount: '0',
      }}
    />
  )
}
