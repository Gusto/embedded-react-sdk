import type { PolicyType } from '@gusto/embedded-api/models/components/timeoffpolicy'

// SDK exposes more PolicyType values (bereavement, custom, etc.) but only
// vacation and sick are creatable through the time-off policy endpoint.
// Holiday is a distinct concept routed through @gusto/embedded-api's
// holidayPayPolicies* hooks against a different endpoint family.
export type CreatableTimeOffPolicyType = Extract<PolicyType, 'sick' | 'vacation'>
export type TimeOffPolicyType = PolicyType | 'holiday'

export const EDITABLE_TIME_OFF_POLICY_TYPES = ['sick', 'vacation', 'holiday'] as const

export type EditableTimeOffPolicyType = (typeof EDITABLE_TIME_OFF_POLICY_TYPES)[number]

export function isEditableTimeOffPolicyType(
  policyType: string | null | undefined,
): policyType is EditableTimeOffPolicyType {
  return EDITABLE_TIME_OFF_POLICY_TYPES.includes(policyType as EditableTimeOffPolicyType)
}

export function assertCreatablePolicyType(
  policyType: TimeOffPolicyType,
): asserts policyType is CreatableTimeOffPolicyType {
  if (policyType !== 'sick' && policyType !== 'vacation') {
    throw new Error(
      `Expected creatable time-off policy type ('sick' or 'vacation'), got '${policyType}'`,
    )
  }
}
