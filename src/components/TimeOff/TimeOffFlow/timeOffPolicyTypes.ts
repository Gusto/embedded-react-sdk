import type { PolicyType } from '@gusto/embedded-api-v-2025-11-15/models/components/timeoffpolicy'

/**
 * Time off policy types that can be created through the time off policy management workflow.
 *
 * @remarks
 * Only `sick` and `vacation` are creatable through the time off policy endpoint. Holiday policies are a separate concept managed through the holiday pay policy endpoint family.
 *
 * @public
 */
export type CreatableTimeOffPolicyType = Extract<PolicyType, 'sick' | 'vacation'>

/** @internal */
export type TimeOffPolicyType = PolicyType | 'holiday'

const EDITABLE_TIME_OFF_POLICY_TYPES = ['sick', 'vacation', 'holiday'] as const

/** @internal */
export type EditableTimeOffPolicyType = (typeof EDITABLE_TIME_OFF_POLICY_TYPES)[number]

/** @internal */
export function isEditableTimeOffPolicyType(
  policyType: string | null | undefined,
): policyType is EditableTimeOffPolicyType {
  return EDITABLE_TIME_OFF_POLICY_TYPES.includes(policyType as EditableTimeOffPolicyType)
}

// Subset of types the SDK surfaces from the time_off_policies endpoint.
// Holiday lives on a separate endpoint and is merged into the list by the caller.
const LISTED_TIME_OFF_POLICY_TYPES = ['sick', 'vacation'] as const satisfies readonly PolicyType[]

/** @internal */
export function isListedTimeOffPolicyType(
  policyType: PolicyType | null | undefined,
): policyType is CreatableTimeOffPolicyType {
  return LISTED_TIME_OFF_POLICY_TYPES.includes(policyType as CreatableTimeOffPolicyType)
}

/** @internal */
export function assertCreatablePolicyType(
  policyType: TimeOffPolicyType,
): asserts policyType is CreatableTimeOffPolicyType {
  if (policyType !== 'sick' && policyType !== 'vacation') {
    throw new Error(
      `Expected creatable time-off policy type ('sick' or 'vacation'), got '${policyType}'`,
    )
  }
}
