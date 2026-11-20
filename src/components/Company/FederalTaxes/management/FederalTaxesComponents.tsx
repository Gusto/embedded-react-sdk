import { useTranslation } from 'react-i18next'
import { FederalTaxesCard } from './FederalTaxesCard'
import { FederalTaxesEditScreen } from './FederalTaxesEditScreen'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

type FederalTaxesSuccessAlertCode = 'federalTaxesUpdated'

/** @internal */
export interface FederalTaxesContextInterface extends FlowContextInterface {
  companyId?: string
  successAlert?: FederalTaxesSuccessAlertCode | null
}

/** @internal */
export function FederalTaxesCardContextual() {
  const { companyId, onEvent, successAlert, LoaderComponent } =
    useFlow<FederalTaxesContextInterface>()
  const { t } = useTranslation('Company.Management.FederalTaxes')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <FederalTaxesCard
        companyId={ensureRequired(companyId)}
        onEvent={onEvent}
        LoaderComponent={LoaderComponent}
      />
    </Flex>
  )
}

/** @internal */
export function FederalTaxesEditScreenContextual() {
  const { companyId, onEvent, LoaderComponent } = useFlow<FederalTaxesContextInterface>()
  return (
    <FederalTaxesEditScreen
      companyId={ensureRequired(companyId)}
      onEvent={onEvent}
      LoaderComponent={LoaderComponent}
    />
  )
}
