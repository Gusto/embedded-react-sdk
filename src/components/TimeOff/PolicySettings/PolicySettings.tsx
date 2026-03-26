import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

export interface PolicySettingsProps extends BaseComponentInterface {
  policyId: string
}

export function PolicySettings(props: PolicySettingsProps) {
  return (
    <BaseComponent {...props}>
      <div>
        <p>Policy Settings (policyId: {props.policyId})</p>
        <button onClick={() => { props.onEvent(componentEvents.TIME_OFF_POLICY_SETTINGS_DONE); }}>
          Done
        </button>
        <button
          onClick={() =>
            { props.onEvent(componentEvents.TIME_OFF_POLICY_SETTINGS_ERROR, {
              alert: { type: 'error', title: 'Failed to update policy settings' },
            }); }
          }
        >
          Simulate Error
        </button>
        <button onClick={() => { props.onEvent(componentEvents.CANCEL); }}>Cancel</button>
      </div>
    </BaseComponent>
  )
}
