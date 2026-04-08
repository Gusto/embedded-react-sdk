export type PolicyType = 'sick' | 'vacation' | 'holiday'

export interface PolicyTypeSelectorPresentationProps {
  onContinue: (policyType: PolicyType) => void
  onCancel: () => void
  defaultPolicyType?: PolicyType
}
