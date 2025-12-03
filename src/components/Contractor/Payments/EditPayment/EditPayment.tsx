import { EditPaymentPresentation } from './EditPaymentPresentation'
import { useI18n, useComponentDictionary } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

interface EditPaymentProps extends BaseComponentInterface<'Contractor.Payments.EditPayment'> {
  companyId: string
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
  useI18n('Contractor.Payments.EditPayment')

  const onSave = () => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_UPDATE)
  }
  const onCancel = () => {
    onEvent(componentEvents.CANCEL)
  }
  return <EditPaymentPresentation onSave={onSave} onCancel={onCancel} />
}
