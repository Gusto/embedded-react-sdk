import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

export interface ViewPolicyEmployeesProps extends BaseComponentInterface {
  policyId: string
}

export function ViewPolicyEmployees(props: ViewPolicyEmployeesProps) {
  return (
    <BaseComponent {...props}>
      <div>
        <p>View Policy Employees (policyId: {props.policyId})</p>
        <button onClick={() => { props.onEvent(componentEvents.TIME_OFF_VIEW_POLICY_DETAILS); }}>
          Policy Details Tab
        </button>
        <button onClick={() => { props.onEvent(componentEvents.TIME_OFF_BACK_TO_LIST); }}>
          Back to List
        </button>
      </div>
    </BaseComponent>
  )
}
