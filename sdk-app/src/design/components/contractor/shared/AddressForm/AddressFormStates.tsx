import { AddressForm, type AddressFormValues } from './AddressForm'

export interface AddressFormDemoProps {
  heading: string
  description: string
  defaultValues?: Partial<AddressFormValues>
  /**
   * When true (default), the form renders with a Cancel button. Pass
   * `false` for self-onboarding-style screens that should not show a
   * cancel affordance.
   */
  cancelable?: boolean
}

/**
 * Renders AddressForm for state demos with no-op submit/cancel handlers.
 */
export function AddressFormDemo({ cancelable = true, ...props }: AddressFormDemoProps) {
  return (
    <AddressForm
      {...props}
      onCancel={cancelable ? () => {} : undefined}
      onSubmit={async () => Promise.resolve()}
    />
  )
}
