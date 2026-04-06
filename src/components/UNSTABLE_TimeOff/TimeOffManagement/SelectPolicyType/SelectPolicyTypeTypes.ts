export type SelectPolicyType = 'sick' | 'vacation' | 'holiday'

export interface SelectPolicyTypePresentationProps {
  onContinue: (policyType: SelectPolicyType) => void
  onCancel: () => void
  defaultPolicyType?: SelectPolicyType
}
