import { PaymentMethodForm, type PaymentMethodFormDefaults } from './PaymentMethodForm'

export interface PaymentMethodFormDemoProps {
  heading: string
  description: string
  defaultValues: PaymentMethodFormDefaults
}

/**
 * Renders PaymentMethodForm for state demos with a no-op submit handler.
 */
export function PaymentMethodFormDemo(props: PaymentMethodFormDemoProps) {
  return <PaymentMethodForm {...props} onSubmit={async () => Promise.resolve()} />
}
