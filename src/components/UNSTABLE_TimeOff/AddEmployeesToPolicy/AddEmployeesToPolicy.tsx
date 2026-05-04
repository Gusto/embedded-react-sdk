import { SelectEmployeesTimeOff } from '../TimeOffManagement/SelectEmployees/SelectEmployeesTimeOff'
import type { CreatableTimeOffPolicyType } from '../TimeOffFlow/timeOffPolicyTypes'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'

export interface AddEmployeesToPolicyProps extends BaseComponentInterface {
  companyId: string
  policyId: string
  policyType: CreatableTimeOffPolicyType
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
