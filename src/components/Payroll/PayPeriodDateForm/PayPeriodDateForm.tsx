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

  const { isCheckOnly, onCheckOnlyChange, onSubmit, handleSubmit } = usePayPeriodDateForm({
    onEvent,
    initialValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PayPeriodDateFormPresentation
        isCheckOnly={isCheckOnly}
        onCheckOnlyChange={onCheckOnlyChange}
      />
    </form>
  )
}
