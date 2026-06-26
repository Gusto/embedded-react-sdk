import { useHolidayPayPoliciesGet } from '@gusto/embedded-api-v-2025-11-15/react-query/holidayPayPoliciesGet'
import { PolicyTypeSelectorPresentation } from './PolicyTypeSelectorPresentation'
import type { PolicyType } from './PolicyTypeSelectorTypes'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'

/**
 * Props for {@link PolicyTypeSelector}.
 *
 * @public
 */
export interface PolicyTypeSelectorProps extends BaseComponentInterface<'Company.TimeOff.SelectPolicyType'> {
  /** The associated company identifier. */
  companyId: string
  /** Pre-selected policy type rendered when the form mounts. */
  defaultPolicyType?: PolicyType
}

/**
 * Selection screen for choosing which kind of time-off policy to create — sick, vacation, or holiday.
 *
 * @remarks
 * The holiday option is omitted when the company already has a holiday pay policy, since a company
 * can only have one.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `timeOff/policyTypeSelected` | The user confirms a selection | `{ policyType: {@link PolicyType} }` |
 * | `CANCEL` | The user cancels | — |
 *
 * @param props - See {@link PolicyTypeSelectorProps}.
 * @returns The rendered policy type selection screen.
 * @public
 */
export function PolicyTypeSelector(props: PolicyTypeSelectorProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ companyId, defaultPolicyType }: PolicyTypeSelectorProps) {
  const { onEvent } = useBase()

  const holidayQuery = useHolidayPayPoliciesGet({ companyUuid: companyId })
  const holidayPolicyExists = Boolean(holidayQuery.data?.holidayPayPolicy)

  const handleContinue = (policyType: PolicyType) => {
    onEvent(componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, {
      policyType,
    })
  }

  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }

  return (
    <PolicyTypeSelectorPresentation
      onContinue={handleContinue}
      onCancel={handleCancel}
      defaultPolicyType={defaultPolicyType}
      holidayPolicyExists={holidayPolicyExists}
    />
  )
}
