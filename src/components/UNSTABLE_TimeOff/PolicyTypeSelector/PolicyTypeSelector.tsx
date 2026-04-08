import { SelectPolicyTypePresentation } from '../TimeOffManagement/SelectPolicyType/SelectPolicyTypePresentation'
import type { SelectPolicyType } from '../TimeOffManagement/SelectPolicyType/SelectPolicyTypeTypes'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'

export interface PolicyTypeSelectorProps extends BaseComponentInterface {
  companyId: string
}

export function PolicyTypeSelector(props: PolicyTypeSelectorProps) {
  return (
    <BaseComponent {...props}>
      <Root />
    </BaseComponent>
  )
}

function Root() {
  const { onEvent } = useBase()

  const handleContinue = (policyType: SelectPolicyType) => {
    onEvent(componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, {
      policyType,
    })
  }

  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }

  return <SelectPolicyTypePresentation onContinue={handleContinue} onCancel={handleCancel} />
}
