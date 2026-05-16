import { useTimeOffPoliciesGetSuspense } from '@gusto/embedded-api/react-query/timeOffPoliciesGet'
import { useTimeOffPoliciesUpdateMutation } from '@gusto/embedded-api/react-query/timeOffPoliciesUpdate'
import type { PutV1TimeOffPoliciesTimeOffPolicyUuidRequestBody } from '@gusto/embedded-api/models/operations/putv1timeoffpoliciestimeoffpolicyuuid'
import type { TimeOffPolicy } from '@gusto/embedded-api/models/components/timeoffpolicy'
import { UnprocessableEntityError } from '@gusto/embedded-api/models/errors/unprocessableentityerror'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { PolicySettingsPresentation } from './PolicySettingsPresentation'
import type { PolicySettingsFormData, PolicySettingsAccrualMethod } from './PolicySettingsTypes'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { SDKInternalError } from '@/types/sdkError'
import { componentEvents } from '@/shared/constants'
import { useI18n } from '@/i18n'

export interface PolicySettingsProps extends BaseComponentInterface {
  policyId: string
  mode?: 'create' | 'edit'
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

const ALL_AT_ONCE_ACCRUAL_METHODS = ['per_anniversary_year', 'per_calendar_year']

function deriveAccrualMethodCategory(apiAccrualMethod: string): PolicySettingsAccrualMethod {
  if (HOURLY_ACCRUAL_METHODS.includes(apiAccrualMethod)) return 'hours_worked'
  if (ALL_AT_ONCE_ACCRUAL_METHODS.includes(apiAccrualMethod)) return 'fixed_all_at_once'
  return 'fixed_per_pay_period'
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
  accrualCategory: PolicySettingsAccrualMethod,
): PutV1TimeOffPoliciesTimeOffPolicyUuidRequestBody {
  const isAllAtOnce = accrualCategory === 'fixed_all_at_once'

  return {
    maxAccrualHoursPerYear:
      !isAllAtOnce && data.accrualMaximumEnabled && data.accrualMaximum != null
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
      !isAllAtOnce && data.waitingPeriodEnabled && data.waitingPeriod != null
        ? data.waitingPeriod
        : null,
    paidOutOnTermination: data.paidOutOnTermination,
    version,
  }
}

function Root({ policyId, mode }: PolicySettingsProps) {
  useI18n('Company.TimeOff.CreateTimeOffPolicy')
  const { t } = useTranslation('Company.TimeOff.CreateTimeOffPolicy')
  const { onEvent, baseSubmitHandler } = useBase()
  const queryClient = useQueryClient()

  const { data: policyResponse } = useTimeOffPoliciesGetSuspense({
    timeOffPolicyUuid: policyId,
  })

  const { mutateAsync: updateTimeOffPolicy, isPending } = useTimeOffPoliciesUpdateMutation()

  const policy = policyResponse.timeOffPolicy
  if (!policy) throw new Error('Unexpected response: missing timeOffPolicy')

  const accrualCategory = deriveAccrualMethodCategory(policy.accrualMethod)
  const version = policy.version ?? ''

  const handleContinue = async (data: PolicySettingsFormData) => {
    await baseSubmitHandler(data, async () => {
      try {
        const { timeOffPolicy } = await updateTimeOffPolicy({
          request: {
            timeOffPolicyUuid: policyId,
            requestBody: buildUpdateRequestBody(data, version, accrualCategory),
          },
        })

        void queryClient.invalidateQueries({
          queryKey: ['@gusto/embedded-api', 'timeOffPolicies', 'get'],
        })
        onEvent(componentEvents.TIME_OFF_POLICY_SETTINGS_DONE, timeOffPolicy)
      } catch (err) {
        if (err instanceof UnprocessableEntityError) {
          if (err.errors.some(e => e.message === 'LIMIT_VIOLATION_MAX_HOURS')) {
            throw new SDKInternalError(
              t('policySettings.errors.balanceExceedsMaximum'),
              'api_error',
            )
          }
          const uniqueMessages = [...new Set(err.errors.map(e => e.message).filter(Boolean))]
          throw new SDKInternalError(
            t('errors.updatePolicySettingsFailed', {
              details: uniqueMessages.join('. '),
            }),
            'api_error',
          )
        }
        throw err
      }
    })
  }

  const handleBack = () => {
    onEvent(componentEvents.TIME_OFF_POLICY_SETTINGS_BACK)
  }

  return (
    <PolicySettingsPresentation
      accrualMethod={accrualCategory}
      onContinue={handleContinue}
      onBack={handleBack}
      defaultValues={deriveDefaultValues(policy)}
      mode={mode}
      editingPolicyName={mode === 'edit' ? policy.name : undefined}
      isPending={isPending}
    />
  )
}
