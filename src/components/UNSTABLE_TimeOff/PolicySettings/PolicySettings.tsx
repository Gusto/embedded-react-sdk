import { useCallback } from 'react'
import { useTimeOffPoliciesGetSuspense } from '@gusto/embedded-api/react-query/timeOffPoliciesGet'
import { useTimeOffPoliciesUpdateMutation } from '@gusto/embedded-api/react-query/timeOffPoliciesUpdate'
import type { PutV1TimeOffPoliciesTimeOffPolicyUuidRequestBody } from '@gusto/embedded-api/models/operations/putv1timeoffpoliciestimeoffpolicyuuid'
import type { TimeOffPolicy } from '@gusto/embedded-api/models/components/timeoffpolicy'
import { PolicySettingsPresentation } from './PolicySettingsPresentation'
import type { PolicySettingsFormData, PolicySettingsAccrualMethod } from './PolicySettingsTypes'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'

export interface PolicySettingsProps extends BaseComponentInterface {
  policyId: string
}

export function PolicySettings(props: PolicySettingsProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const HOURLY_ACCRUAL_METHODS = [
  'per_hour_worked',
  'per_hour_worked_no_overtime',
  'per_hour_paid',
  'per_hour_paid_no_overtime',
]

function deriveAccrualMethodCategory(apiAccrualMethod: string): PolicySettingsAccrualMethod {
  if (HOURLY_ACCRUAL_METHODS.includes(apiAccrualMethod)) return 'hours_worked'
  return 'fixed'
}

function deriveDefaultValues(policy: TimeOffPolicy): Partial<PolicySettingsFormData> {
  const defaults: Partial<PolicySettingsFormData> = {}

  if (policy.maxAccrualHoursPerYear != null) {
    defaults.accrualMaximumEnabled = true
    defaults.accrualMaximum = Number(policy.maxAccrualHoursPerYear)
  }

  if (policy.maxHours != null) {
    defaults.balanceMaximumEnabled = true
    defaults.balanceMaximum = Number(policy.maxHours)
  }

  if (policy.carryoverLimitHours != null) {
    defaults.carryOverLimitEnabled = true
    defaults.carryOverLimit = Number(policy.carryoverLimitHours)
  }

  if (policy.accrualWaitingPeriodDays != null && policy.accrualWaitingPeriodDays > 0) {
    defaults.waitingPeriodEnabled = true
    defaults.waitingPeriod = policy.accrualWaitingPeriodDays
  }

  if (policy.paidOutOnTermination != null) {
    defaults.paidOutOnTermination = policy.paidOutOnTermination
  }

  return defaults
}

function buildUpdateRequestBody(
  data: PolicySettingsFormData,
  version: string,
): PutV1TimeOffPoliciesTimeOffPolicyUuidRequestBody {
  return {
    maxAccrualHoursPerYear:
      data.accrualMaximumEnabled && data.accrualMaximum != null
        ? String(data.accrualMaximum)
        : null,
    maxHours:
      data.balanceMaximumEnabled && data.balanceMaximum != null
        ? String(data.balanceMaximum)
        : null,
    carryoverLimitHours:
      data.carryOverLimitEnabled && data.carryOverLimit != null
        ? String(data.carryOverLimit)
        : null,
    accrualWaitingPeriodDays:
      data.waitingPeriodEnabled && data.waitingPeriod != null ? data.waitingPeriod : null,
    paidOutOnTermination: data.paidOutOnTermination,
    complete: true,
    version,
  }
}

function Root({ policyId }: PolicySettingsProps) {
  const { onEvent, baseSubmitHandler } = useBase()

  const { data: policyResponse } = useTimeOffPoliciesGetSuspense({
    timeOffPolicyUuid: policyId,
  })

  const { mutateAsync: updateTimeOffPolicy } = useTimeOffPoliciesUpdateMutation()

  const policy = policyResponse.timeOffPolicy!
  const accrualCategory = deriveAccrualMethodCategory(policy.accrualMethod)
  const version = policy.version!

  const handleContinue = useCallback(
    async (data: PolicySettingsFormData) => {
      await baseSubmitHandler(data, async () => {
        await updateTimeOffPolicy({
          request: {
            timeOffPolicyUuid: policyId,
            requestBody: buildUpdateRequestBody(data, version),
          },
        })

        onEvent(componentEvents.TIME_OFF_POLICY_SETTINGS_DONE)
      })
    },
    [baseSubmitHandler, onEvent, policyId, updateTimeOffPolicy, version],
  )

  const handleBack = useCallback(() => {
    onEvent(componentEvents.TIME_OFF_POLICY_SETTINGS_BACK)
  }, [onEvent])

  return (
    <PolicySettingsPresentation
      accrualMethod={accrualCategory}
      onContinue={handleContinue}
      onBack={handleBack}
      defaultValues={deriveDefaultValues(policy)}
    />
  )
}
