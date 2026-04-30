import { useCallback } from 'react'
import { useTimeOffPoliciesCreateMutation } from '@gusto/embedded-api/react-query/timeOffPoliciesCreate'
import type { TimeOffPolicyRequest } from '@gusto/embedded-api/models/components/timeoffpolicyrequest'
import { PolicyConfigurationFormPresentation } from './PolicyConfigurationFormPresentation'
import type { PolicyConfigurationFormData } from './PolicyConfigurationFormTypes'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { formatMonthDay } from '@/helpers/dateFormatting'

export interface PolicyConfigurationFormProps extends BaseComponentInterface<'Company.TimeOff.CreateTimeOffPolicy'> {
  companyId: string
  policyType: 'sick' | 'vacation'
  defaultValues?: Partial<PolicyConfigurationFormData>
}

export function PolicyConfigurationForm(props: PolicyConfigurationFormProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function resolveApiAccrualMethod(
  data: PolicyConfigurationFormData,
): TimeOffPolicyRequest['accrualMethod'] {
  switch (data.accrualMethod) {
    case 'unlimited':
      return 'unlimited'

    case 'per_hour_paid': {
      const paid = data.allPaidHours ?? false
      const overtime = data.includeOvertime ?? false

      if (paid && overtime) return 'per_hour_paid'
      if (paid && !overtime) return 'per_hour_paid_no_overtime'
      if (!paid && overtime) return 'per_hour_worked'
      return 'per_hour_worked_no_overtime'
    }

    case 'per_calendar_year': {
      if (data.accrualMethodFixed === 'per_pay_period') return 'per_pay_period'

      return data.resetDateType === 'per_anniversary_year'
        ? 'per_anniversary_year'
        : 'per_calendar_year'
    }
  }
}

function buildCreateRequestBody(
  data: PolicyConfigurationFormData,
  policyType: 'sick' | 'vacation',
): TimeOffPolicyRequest {
  const accrualMethod = resolveApiAccrualMethod(data)

  const base: TimeOffPolicyRequest = { name: data.name, policyType, accrualMethod }

  if (accrualMethod === 'unlimited') {
    return { ...base, complete: true }
  }

  const isHourly =
    accrualMethod === 'per_hour_paid' ||
    accrualMethod === 'per_hour_paid_no_overtime' ||
    accrualMethod === 'per_hour_worked' ||
    accrualMethod === 'per_hour_worked_no_overtime'

  const policyResetDate =
    data.resetDateType === 'per_calendar_year'
      ? formatMonthDay(data.resetMonth, data.resetDay)
      : undefined

  if (isHourly) {
    return {
      ...base,
      accrualRate: data.accrualRate != null ? String(data.accrualRate) : undefined,
      accrualRateUnit: data.accrualRateUnit != null ? String(data.accrualRateUnit) : undefined,
      policyResetDate,
    }
  }

  return {
    ...base,
    accrualRate: data.accrualRate != null ? String(data.accrualRate) : undefined,
    policyResetDate,
  }
}

function Root({ companyId, policyType, defaultValues }: PolicyConfigurationFormProps) {
  const { onEvent, baseSubmitHandler } = useBase()

  const { mutateAsync: createTimeOffPolicy } = useTimeOffPoliciesCreateMutation()

  const handleContinue = useCallback(
    async (data: PolicyConfigurationFormData) => {
      await baseSubmitHandler(data, async () => {
        const requestBody = buildCreateRequestBody(data, policyType)

        const response = await createTimeOffPolicy({
          request: {
            companyUuid: companyId,
            timeOffPolicyRequest: requestBody,
          },
        })

        onEvent(componentEvents.TIME_OFF_POLICY_DETAILS_DONE, {
          policyId: response.timeOffPolicy!.uuid,
          accrualMethod: requestBody.accrualMethod,
        })
      })
    },
    [baseSubmitHandler, companyId, createTimeOffPolicy, onEvent, policyType],
  )

  const handleCancel = useCallback(() => {
    onEvent(componentEvents.CANCEL)
  }, [onEvent])

  return (
    <PolicyConfigurationFormPresentation
      onContinue={handleContinue}
      onCancel={handleCancel}
      defaultValues={defaultValues}
    />
  )
}
