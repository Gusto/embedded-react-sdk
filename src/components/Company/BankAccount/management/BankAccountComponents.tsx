import { useTranslation } from 'react-i18next'
import { BankAccountCard } from './BankAccountCard'
import { BankAccountEditScreen } from './BankAccountEditScreen'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

type BankAccountSuccessAlertCode = 'bankAccountUpdated'

/** @internal */
export interface BankAccountBlockContextInterface extends FlowContextInterface {
  companyId?: string
  successAlert?: BankAccountSuccessAlertCode | null
  /**
   * Set while the user is still inside the bank account sub-flow, and promoted to
   * `successAlert` only once they leave it — adding an account and verifying it are separate
   * steps of one visit, so neither should eject them.
   */
  pendingAlert?: BankAccountSuccessAlertCode | null
}

/** @internal */
export function BankAccountCardContextual() {
  const { companyId, onEvent, successAlert, LoaderComponent } =
    useFlow<BankAccountBlockContextInterface>()
  const { t } = useTranslation('Company.Management.BankAccount')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <BankAccountCard
        companyId={ensureRequired(companyId)}
        onEvent={onEvent}
        LoaderComponent={LoaderComponent}
      />
    </Flex>
  )
}

/** @internal */
export function BankAccountEditScreenContextual() {
  const { companyId, onEvent } = useFlow<BankAccountBlockContextInterface>()
  return <BankAccountEditScreen companyId={ensureRequired(companyId)} onEvent={onEvent} />
}
