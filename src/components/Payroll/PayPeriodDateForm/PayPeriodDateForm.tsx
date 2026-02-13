import { PayPeriodDateFormPresentation } from './PayPeriodDateFormPresentation'
import { type PayPeriodDateFormProps } from './PayPeriodDateFormTypes'
import { usePayPeriodDateForm } from './usePayPeriodDateForm'
import { BaseComponent } from '@/components/Base'
import { useComponentDictionary } from '@/i18n'

export function PayPeriodDateForm(props: PayPeriodDateFormProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ onEvent, dictionary, initialValues }: PayPeriodDateFormProps) {
  useComponentDictionary('Payroll.PayPeriodDateForm', dictionary)

  const { data, actions, meta, form } = usePayPeriodDateForm({
    onEvent,
    initialValues,
  })

  return (
    <form onSubmit={form.handleSubmit(actions.onSubmit)}>
      <PayPeriodDateFormPresentation {...data} {...actions} {...meta} />
    </form>
  )
}
