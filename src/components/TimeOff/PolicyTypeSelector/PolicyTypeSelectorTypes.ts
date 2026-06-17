/**
 * Identifier for the kind of time-off policy a company can configure.
 *
 * @public
 */
export type PolicyType = 'sick' | 'vacation' | 'holiday'

/** @internal */
export interface PolicyTypeSelectorPresentationProps {
  /** Called with the chosen policy type when the user confirms the selection. */
  onContinue: (policyType: PolicyType) => void
  /** Called when the user cancels the selection. */
  onCancel: () => void
  /** Pre-selected policy type rendered when the form mounts. */
  defaultPolicyType?: PolicyType
  /** When true, the holiday option is omitted because the company already has a holiday pay policy. */
  holidayPolicyExists?: boolean
}
