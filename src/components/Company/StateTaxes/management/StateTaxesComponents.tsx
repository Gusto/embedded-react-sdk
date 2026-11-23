import { useTranslation } from 'react-i18next'
import { StateTaxesCard } from './StateTaxesCard'
import { StateTaxesEditScreen } from './StateTaxesEditScreen'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

type StateTaxesSuccessAlertCode = 'stateTaxesUpdated'

/** @internal */
export interface StateTaxesBlockContextInterface extends FlowContextInterface {
  companyId?: string
  successAlert?: StateTaxesSuccessAlertCode | null
  /**
   * Set while the user is still inside the state taxes surface, and promoted to `successAlert`
   * only once they leave it — a company often updates several states in one visit.
   */
  pendingAlert?: StateTaxesSuccessAlertCode | null
}

/** @internal */
export function StateTaxesCardContextual() {
  const { companyId, onEvent, successAlert, LoaderComponent } =
    useFlow<StateTaxesBlockContextInterface>()
  const { t } = useTranslation('Company.Management.StateTaxes')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <StateTaxesCard
        companyId={ensureRequired(companyId)}
        onEvent={onEvent}
        LoaderComponent={LoaderComponent}
      />
    </Flex>
  )
}

/** @internal */
export function StateTaxesEditScreenContextual() {
  const { companyId, onEvent } = useFlow<StateTaxesBlockContextInterface>()
  return <StateTaxesEditScreen companyId={ensureRequired(companyId)} onEvent={onEvent} />
}
