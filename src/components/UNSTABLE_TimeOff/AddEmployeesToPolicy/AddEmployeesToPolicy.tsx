import { SelectEmployeesTimeOff } from '../TimeOffManagement/SelectEmployees/SelectEmployeesTimeOff'
import type { SelectableTimeOffPolicyType } from '../TimeOffFlow/TimeOffFlowComponents'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'

export interface AddEmployeesToPolicyProps extends BaseComponentInterface {
  companyId: string
  policyId: string
  policyType: SelectableTimeOffPolicyType
}

export function AddEmployeesToPolicy(props: AddEmployeesToPolicyProps) {
  return (
    <BaseComponent {...props}>
      <SelectEmployeesTimeOff
        companyId={props.companyId}
        policyId={props.policyId}
        policyType={props.policyType}
        mode="standalone"
      />
    </BaseComponent>
  )
}
