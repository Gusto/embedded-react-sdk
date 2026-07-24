import { useTranslation } from 'react-i18next'
import { ProfileEditForm } from './ProfileEditForm'
import { ProfileCard } from './ProfileCard'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

type ProfileSuccessAlertCode = 'profileUpdated'

/** @internal */
export interface ProfileContextInterface extends FlowContextInterface {
  contractorId?: string
  successAlert?: ProfileSuccessAlertCode | null
}

/** @internal */
export function CardContextual() {
  const { contractorId, onEvent, successAlert } = useFlow<ProfileContextInterface>()
  const { t } = useTranslation('Contractor.Management.Profile')
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.CONTRACTOR_MANAGEMENT_PROFILE_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <ProfileCard contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
    </Flex>
  )
}

/** @internal */
export function ProfileEditFormContextual() {
  const { contractorId, onEvent } = useFlow<ProfileContextInterface>()
  return <ProfileEditForm contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}
