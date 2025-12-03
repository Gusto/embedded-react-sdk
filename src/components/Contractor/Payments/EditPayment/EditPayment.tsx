import { FormProvider, useForm } from 'react-hook-form'
import { EditPaymentPresentation } from './EditPaymentPresentation'
import { useComponentDictionary } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

interface EditPaymentProps extends BaseComponentInterface<'Contractor.Payments.EditPayment'> {
  companyId: string
}

interface EditPaymentFormData {
  wageType: 'Hourly' | 'Fixed'
  hours?: string
  wage?: string
  bonus?: string
  reimbursement?: string
  wageTotal?: string
  paymentMethod: string
}

export function EditPayment(props: EditPaymentProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ companyId, dictionary, onEvent, children }: EditPaymentProps) => {
  useComponentDictionary('Contractor.Payments.EditPayment', dictionary)

  const formMethods = useForm<EditPaymentFormData>({
    defaultValues: {
      wageType: 'Hourly',
      hours: '',
      wage: '',
      bonus: '',
      reimbursement: '',
      wageTotal: '0',
      paymentMethod: 'Check',
    },
  })

  const onSave = () => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_UPDATE)
  }

  const onCancel = () => {
    onEvent(componentEvents.CANCEL)
  }

  return (
    <FormProvider {...formMethods}>
      <EditPaymentPresentation onSave={onSave} onCancel={onCancel} />
    </FormProvider>
  )
}
