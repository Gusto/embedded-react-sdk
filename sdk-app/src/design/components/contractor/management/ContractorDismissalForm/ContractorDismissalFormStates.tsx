import type { Contractor } from '@gusto/embedded-api-v-2025-11-15/models/components/contractor'
import { ContractorDismissalForm } from './ContractorDismissalForm'
import { BaseComponent } from '@/components/Base'

export interface ContractorDismissalFormDemoProps {
  contractor: Contractor
  isPending?: boolean
}

/**
 * Renders ContractorDismissalForm for state demos. Wraps it in
 * BaseComponent because the form's `useBase()` call needs that context.
 * Callbacks default to no-ops — the form's submit handler awaits
 * `onDismiss` which silently resolves, so the user can fill the form
 * out and click Dismiss without anything escaping the demo.
 */
export function ContractorDismissalFormDemo({
  contractor,
  isPending,
}: ContractorDismissalFormDemoProps) {
  return (
    <BaseComponent onEvent={() => {}}>
      <ContractorDismissalForm
        contractor={contractor}
        isPending={isPending}
        onCancel={() => {}}
        onDismiss={async () => {}}
      />
    </BaseComponent>
  )
}
