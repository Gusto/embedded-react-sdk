import { useHolidayPayPoliciesGet } from '@gusto/embedded-api/react-query/holidayPayPoliciesGet'
import { PolicyTypeSelectorPresentation } from './PolicyTypeSelectorPresentation'
import type { PolicyType } from './PolicyTypeSelectorTypes'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'

export interface PolicyTypeSelectorProps extends BaseComponentInterface<'Company.TimeOff.SelectPolicyType'> {
  companyId: string
  defaultPolicyType?: PolicyType
}

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
