import { SelectPolicyTypePresentation } from './SelectPolicyTypePresentation'
import type { SelectPolicyType as SelectPolicyTypeValue } from './SelectPolicyTypeTypes'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'

export interface SelectPolicyTypeProps extends BaseComponentInterface<'Company.TimeOff.SelectPolicyType'> {
  companyId: string
  defaultPolicyType?: SelectPolicyTypeValue
}

export function SelectPolicyType(props: SelectPolicyTypeProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ defaultPolicyType }: SelectPolicyTypeProps) {
  const { onEvent } = useBase()

  const handleContinue = (policyType: SelectPolicyTypeValue) => {
    onEvent(componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, { policyType })
  }

  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }

  return (
    <SelectPolicyTypePresentation
      onContinue={handleContinue}
      onCancel={handleCancel}
      defaultPolicyType={defaultPolicyType}
    />
  )
}
