import type { Contractor } from '@gusto/embedded-api-v-2025-11-15/models/components/contractor'
import { ProfileDetailsForm } from './ProfileDetailsForm'

export interface ProfileDetailsFormDemoProps {
  contractor: Contractor
  heading: string
  description: string
  showStartDate?: boolean
  showEmail?: boolean
  /**
   * When true (default), the form renders with a Cancel button. Pass
   * `false` for self-onboarding-style screens that should not show a
   * cancel affordance — the submit button label changes to "Continue".
   */
  cancelable?: boolean
}

/**
 * Renders ProfileDetailsForm for state demos with no-op submit/cancel
 * handlers. The form's `useForm` is self-contained, so no extra wrapping
 * is needed.
 */
export function ProfileDetailsFormDemo({
  cancelable = true,
  ...props
}: ProfileDetailsFormDemoProps) {
  return (
    <ProfileDetailsForm
      {...props}
      onCancel={cancelable ? () => {} : undefined}
      onSubmit={async () => Promise.resolve()}
    />
  )
}
