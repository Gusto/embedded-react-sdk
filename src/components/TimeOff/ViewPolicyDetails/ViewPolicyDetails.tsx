import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

export interface ViewPolicyDetailsProps extends BaseComponentInterface {
  policyId: string
}

export function ViewPolicyDetails(props: ViewPolicyDetailsProps) {
  return (
    <BaseComponent {...props}>
      <div>
        <p>View Policy Details (policyId: {props.policyId})</p>
        <button onClick={() => { props.onEvent(componentEvents.TIME_OFF_VIEW_POLICY_EMPLOYEES); }}>
          View Employees Tab
        </button>
        <button onClick={() => { props.onEvent(componentEvents.TIME_OFF_BACK_TO_LIST); }}>
          Back to List
        </button>
      </div>
    </BaseComponent>
  )
}
