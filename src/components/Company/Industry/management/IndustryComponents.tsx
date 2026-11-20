import { useTranslation } from 'react-i18next'
import { IndustryCard } from './IndustryCard'
import { IndustryEditScreen } from './IndustryEditScreen'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

type IndustrySuccessAlertCode = 'industryUpdated'

/** @internal */
export interface IndustryContextInterface extends FlowContextInterface {
  companyId?: string
  successAlert?: IndustrySuccessAlertCode | null
}

/** @internal */
export function IndustryCardContextual() {
  const { companyId, onEvent, successAlert, LoaderComponent } = useFlow<IndustryContextInterface>()
  const { t } = useTranslation('Company.Management.Industry')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.COMPANY_MANAGEMENT_INDUSTRY_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <IndustryCard
        companyId={ensureRequired(companyId)}
        onEvent={onEvent}
        LoaderComponent={LoaderComponent}
      />
    </Flex>
  )
}

/** @internal */
export function IndustryEditScreenContextual() {
  const { companyId, onEvent, LoaderComponent } = useFlow<IndustryContextInterface>()
  return (
    <IndustryEditScreen
      companyId={ensureRequired(companyId)}
      onEvent={onEvent}
      LoaderComponent={LoaderComponent}
    />
  )
}
