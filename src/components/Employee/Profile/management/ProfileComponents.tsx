import { useTranslation } from 'react-i18next'
import { ProfileEditForm } from './ProfileEditForm'
import { ProfileCard } from './ProfileCard'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

export type ProfileSuccessAlertCode = 'profileUpdated'

export interface ProfileContextInterface extends FlowContextInterface {
  employeeId?: string
  successAlert?: ProfileSuccessAlertCode | null
}

export function CardContextual() {
  const { employeeId, onEvent, successAlert } = useFlow<ProfileContextInterface>()
  const { t } = useTranslation('Employee.Profile.Management')
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.EMPLOYEE_PROFILE_MANAGEMENT_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <ProfileCard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
    </Flex>
  )
}

export function ProfileEditFormContextual() {
  const { employeeId, onEvent } = useFlow<ProfileContextInterface>()
  return <ProfileEditForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}
