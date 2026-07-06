import { useCallback } from 'react'
import { useTimeOffPoliciesCreateMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/timeOffPoliciesCreate'
import { useTimeOffPoliciesUpdateMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/timeOffPoliciesUpdate'
import { useTimeOffPoliciesGetSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/timeOffPoliciesGet'
import type { TimeOffPolicyRequest } from '@gusto/embedded-api-v-2026-02-01/models/components/timeoffpolicyrequest'
import type { TimeOffPolicy } from '@gusto/embedded-api-v-2026-02-01/models/components/timeoffpolicy'
import type { PutV1TimeOffPoliciesTimeOffPolicyUuidRequestBody } from '@gusto/embedded-api-v-2026-02-01/models/operations/putv1timeoffpoliciestimeoffpolicyuuid'
import { useQueryClient } from '@tanstack/react-query'
import { PolicyConfigurationFormPresentation } from './PolicyConfigurationFormPresentation'
import type { PolicyConfigurationFormData } from './PolicyConfigurationFormTypes'
import { API_QUERY_NAMESPACE } from '@/contexts/ApiProvider/apiVersion'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { formatMonthDay } from '@/helpers/dateFormatting'

/**
 * Props for {@link PolicyConfigurationForm}.
 *
 * @public
 */
export interface PolicyConfigurationFormProps extends BaseComponentInterface<'Company.TimeOff.CreateTimeOffPolicy'> {
  /** Company that owns the policy being created or edited. */
  companyId: string
  /** Type of policy being configured. */
  policyType: 'sick' | 'vacation'
  /** When set, the form loads the existing policy and submits an update. */
  policyId?: string
  /** Pre-populated values to merge into the form's defaults. */
  defaultValues?: Partial<PolicyConfigurationFormData>
}

/**
 * Form for creating or editing the details of a sick or vacation time off policy — its name and accrual configuration.
 *
 * @remarks
 * Omit `policyId` to create a new policy; pass `policyId` to edit an existing
 * one. In edit mode, the form fetches the policy via Suspense and merges the
 * derived defaults with any `defaultValues` you supply (your overrides win).
 * When editing a policy whose configuration is already complete, the accrual
 * method selector is restricted to the matching category (unlimited vs.
 * accrual-based).
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `timeOff/policyDetails/done` | Fired after the policy is successfully created or updated | `{ policyId: string, accrualMethod: string }` |
 * | `CANCEL` | Fired when the user clicks the cancel button | — |
 *
 * @param props - See {@link PolicyConfigurationFormProps}.
 * @returns The rendered policy configuration form.
 * @public
 */
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

const HOURLY_API_METHODS = [
  'per_hour_paid',
  'per_hour_paid_no_overtime',
  'per_hour_worked',
  'per_hour_worked_no_overtime',
]

function deriveFormDefaults(policy: TimeOffPolicy): Partial<PolicyConfigurationFormData> {
  const defaults: Partial<PolicyConfigurationFormData> = { name: policy.name }
  const apiMethod = policy.accrualMethod

  if (apiMethod === 'unlimited') {
    defaults.accrualMethod = 'unlimited'
  } else if (HOURLY_API_METHODS.includes(apiMethod)) {
    defaults.accrualMethod = 'per_hour_paid'
    defaults.allPaidHours =
      apiMethod === 'per_hour_paid' || apiMethod === 'per_hour_paid_no_overtime'
    defaults.includeOvertime = apiMethod === 'per_hour_paid' || apiMethod === 'per_hour_worked'

    if (policy.accrualRate != null) defaults.accrualRate = Number(policy.accrualRate)
    if (policy.accrualRateUnit != null) defaults.accrualRateUnit = Number(policy.accrualRateUnit)

    if (policy.policyResetDate) {
      defaults.resetDateType = 'per_calendar_year'
    }
  } else {
    defaults.accrualMethod = 'per_calendar_year'

    if (apiMethod === 'per_pay_period') {
      defaults.accrualMethodFixed = 'per_pay_period'
      defaults.resetDateType = policy.policyResetDate ? 'per_calendar_year' : 'per_anniversary_year'
    } else {
      defaults.accrualMethodFixed = 'all_at_once'
      defaults.resetDateType =
        apiMethod === 'per_anniversary_year' ? 'per_anniversary_year' : 'per_calendar_year'
    }

    if (policy.accrualRate != null) defaults.accrualRate = Number(policy.accrualRate)
  }

  if (policy.policyResetDate) {
    const [month, day] = policy.policyResetDate.split('-').map(Number)
    if (month) defaults.resetMonth = month
    if (day) defaults.resetDay = day
  }

  return defaults
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
      : null

  if (isHourly) {
    return {
      ...base,
      accrualRate: data.accrualRate != null ? String(data.accrualRate) : undefined,
      accrualRateUnit: data.accrualRateUnit != null ? String(data.accrualRateUnit) : undefined,
      policyResetDate,
      complete: false,
    }
  }

  return {
    ...base,
    accrualRate: data.accrualRate != null ? String(data.accrualRate) : undefined,
    accrualRateUnit: null,
    policyResetDate,
    complete: false,
  }
}

function buildUpdateRequestBody(
  data: PolicyConfigurationFormData,
  policyType: 'sick' | 'vacation',
  version: string,
): PutV1TimeOffPoliciesTimeOffPolicyUuidRequestBody {
  const accrualMethod = resolveApiAccrualMethod(data)

  const base: PutV1TimeOffPoliciesTimeOffPolicyUuidRequestBody = {
    name: data.name,
    policyType,
    accrualMethod,
    version,
  }

  if (accrualMethod === 'unlimited') {
    return {
      ...base,
      accrualRate: null,
      accrualRateUnit: null,
      policyResetDate: null,
    }
  }

  const isHourly =
    accrualMethod === 'per_hour_paid' ||
    accrualMethod === 'per_hour_paid_no_overtime' ||
    accrualMethod === 'per_hour_worked' ||
    accrualMethod === 'per_hour_worked_no_overtime'

  const policyResetDate =
    data.resetDateType === 'per_calendar_year'
      ? formatMonthDay(data.resetMonth, data.resetDay)
      : null

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
    accrualRateUnit: null,
    policyResetDate,
  }
}

function Root({ companyId, policyType, defaultValues, policyId }: PolicyConfigurationFormProps) {
  if (policyId) {
    return (
      <EditRoot
        companyId={companyId}
        policyType={policyType}
        policyId={policyId}
        defaultValues={defaultValues}
      />
    )
  }
  return <CreateRoot companyId={companyId} policyType={policyType} defaultValues={defaultValues} />
}

interface CreateRootProps {
  companyId: string
  policyType: 'sick' | 'vacation'
  defaultValues?: Partial<PolicyConfigurationFormData>
}

function CreateRoot({ companyId, policyType, defaultValues }: CreateRootProps) {
  const { onEvent, baseSubmitHandler } = useBase()

  const { mutateAsync: createTimeOffPolicy, isPending } = useTimeOffPoliciesCreateMutation()

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
      isPending={isPending}
    />
  )
}

interface EditRootProps {
  companyId: string
  policyType: 'sick' | 'vacation'
  policyId: string
  defaultValues?: Partial<PolicyConfigurationFormData>
}

function EditRoot({ companyId, policyType, policyId, defaultValues }: EditRootProps) {
  const { onEvent, baseSubmitHandler } = useBase()
  const queryClient = useQueryClient()

  const { data: policyResponse } = useTimeOffPoliciesGetSuspense({
    timeOffPolicyUuid: policyId,
  })

  const { mutateAsync: updateTimeOffPolicy, isPending } = useTimeOffPoliciesUpdateMutation()

  const policy = policyResponse.timeOffPolicy
  if (!policy) throw new Error('Unexpected response: missing timeOffPolicy')

  const version = policy.version ?? ''
  const fetchedDefaults = deriveFormDefaults(policy)
  const mergedDefaults = { ...fetchedDefaults, ...defaultValues }

  const lockedAccrualCategory = policy.complete
    ? fetchedDefaults.accrualMethod === 'unlimited'
      ? ('unlimited' as const)
      : ('accrual_based' as const)
    : undefined

  const handleContinue = useCallback(
    async (data: PolicyConfigurationFormData) => {
      await baseSubmitHandler(data, async () => {
        const requestBody = buildUpdateRequestBody(data, policyType, version)

        await updateTimeOffPolicy({
          request: {
            timeOffPolicyUuid: policyId,
            requestBody,
          },
        })

        void queryClient.invalidateQueries({
          queryKey: [API_QUERY_NAMESPACE, 'timeOffPolicies', 'get'],
        })

        onEvent(componentEvents.TIME_OFF_POLICY_DETAILS_DONE, {
          policyId,
          accrualMethod: requestBody.accrualMethod,
        })
      })
    },
    [baseSubmitHandler, policyId, policyType, version, updateTimeOffPolicy, queryClient, onEvent],
  )

  const handleCancel = useCallback(() => {
    onEvent(componentEvents.CANCEL)
  }, [onEvent])

  return (
    <PolicyConfigurationFormPresentation
      onContinue={handleContinue}
      onCancel={handleCancel}
      defaultValues={mergedDefaults}
      editingPolicyName={policy.name}
      isPending={isPending}
      lockedAccrualCategory={lockedAccrualCategory}
    />
  )
}
