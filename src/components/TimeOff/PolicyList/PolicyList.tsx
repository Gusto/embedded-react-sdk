import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

export interface PolicyListProps extends BaseComponentInterface {
  companyId: string
}

export function PolicyList(props: PolicyListProps) {
  return (
    <BaseComponent {...props}>
      <div>
        <p>Policy List (companyId: {props.companyId})</p>
        <button onClick={() => { props.onEvent(componentEvents.TIME_OFF_CREATE_POLICY); }}>
          Create Policy
        </button>
        <button
          onClick={() =>
            { props.onEvent(componentEvents.TIME_OFF_VIEW_POLICY, {
              policyId: 'mock-policy-id',
              policyType: 'vacation',
            }); }
          }
        >
          View Vacation Policy
        </button>
        <button
          onClick={() =>
            { props.onEvent(componentEvents.TIME_OFF_VIEW_POLICY, {
              policyId: 'mock-policy-id',
              policyType: 'holiday',
            }); }
          }
        >
          View Holiday Policy
        </button>
      </div>
    </BaseComponent>
  )
}
