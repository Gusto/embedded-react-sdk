import type { PolicyType } from '@gusto/embedded-api-v-2025-11-15/models/components/timeoffpolicy'

// SDK exposes more PolicyType values (bereavement, custom, etc.) but only
// vacation and sick are creatable through the time-off policy endpoint.
// Holiday is a distinct concept routed through @gusto/embedded-api-v-2025-11-15's
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

// Subset of types the SDK surfaces from the time_off_policies endpoint.
// Holiday lives on a separate endpoint and is merged into the list by the caller.
export const LISTED_TIME_OFF_POLICY_TYPES = [
  'sick',
  'vacation',
] as const satisfies readonly PolicyType[]

export function isListedTimeOffPolicyType(
  policyType: PolicyType | null | undefined,
): policyType is CreatableTimeOffPolicyType {
  return LISTED_TIME_OFF_POLICY_TYPES.includes(policyType as CreatableTimeOffPolicyType)
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
