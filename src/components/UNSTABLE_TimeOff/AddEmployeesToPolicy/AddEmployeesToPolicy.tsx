import { SelectEmployeesTimeOff } from '../TimeOffManagement/SelectEmployees/SelectEmployeesTimeOff'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'

export interface AddEmployeesToPolicyProps extends BaseComponentInterface {
  companyId: string
  policyId: string
}

export function AddEmployeesToPolicy(props: AddEmployeesToPolicyProps) {
  return (
    <BaseComponent {...props}>
      <SelectEmployeesTimeOff
        companyId={props.companyId}
        policyId={props.policyId}
        mode="standalone"
      />
    </BaseComponent>
  )
}
