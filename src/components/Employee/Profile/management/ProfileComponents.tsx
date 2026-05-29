import { EditProfile } from './EditProfile'
import { ProfileCard } from './ProfileCard'
import type { ProfileCardSuccessAlertCode } from './ProfileCard'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

export type ProfileSuccessAlertCode = ProfileCardSuccessAlertCode

export interface ProfileContextInterface extends FlowContextInterface {
  employeeId?: string
  successAlert?: ProfileSuccessAlertCode | null
}

export function CardContextual() {
  const { employeeId, onEvent, successAlert } = useFlow<ProfileContextInterface>()
  return (
    <ProfileCard
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
      successAlert={successAlert ?? null}
      onDismissAlert={() => {
        onEvent(componentEvents.EMPLOYEE_DISMISS, null)
      }}
    />
  )
}

export function EditProfileContextual() {
  const { employeeId, onEvent } = useFlow<ProfileContextInterface>()
  return <EditProfile employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}
