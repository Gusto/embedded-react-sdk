import { useTranslation } from 'react-i18next'
import { SignatoryCard } from './SignatoryCard'
import { SignatoryEditScreen } from './SignatoryEditScreen'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

type SignatorySuccessAlertCode = 'signatoryUpdated'

/** @internal */
export type EventPayloads = {
  [componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_REQUESTED]: {
    companyId: string
    signatoryId?: string
  }
}

/** @internal */
export interface SignatoryContextInterface extends FlowContextInterface {
  companyId?: string
  /** Carried from the card's edit request so the editor amends that record rather than creating one. */
  signatoryId?: string
  successAlert?: SignatorySuccessAlertCode | null
}

/** @internal */
export function SignatoryCardContextual() {
  const { companyId, onEvent, successAlert, LoaderComponent } = useFlow<SignatoryContextInterface>()
  const { t } = useTranslation('Company.Management.Signatory')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.COMPANY_MANAGEMENT_SIGNATORY_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <SignatoryCard
        companyId={ensureRequired(companyId)}
        onEvent={onEvent}
        LoaderComponent={LoaderComponent}
      />
    </Flex>
  )
}

/** @internal */
export function SignatoryEditScreenContextual() {
  const { companyId, signatoryId, onEvent, LoaderComponent } = useFlow<SignatoryContextInterface>()
  return (
    <SignatoryEditScreen
      companyId={ensureRequired(companyId)}
      signatoryId={signatoryId}
      onEvent={onEvent}
      LoaderComponent={LoaderComponent}
    />
  )
}
