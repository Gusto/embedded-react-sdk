import { useTranslation } from 'react-i18next'
import { FederalTaxesCard } from './FederalTaxesCard'
import { FederalTaxesEditForm } from './FederalTaxesEditForm'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

export type FederalTaxesSuccessAlertCode = 'federalTaxesUpdated'

export interface FederalTaxesContextInterface extends FlowContextInterface {
  employeeId?: string
  successAlert?: FederalTaxesSuccessAlertCode | null
}

export function FederalTaxesCardContextual() {
  const { employeeId, onEvent, successAlert } = useFlow<FederalTaxesContextInterface>()
  const { t } = useTranslation('Employee.Management.FederalTaxes')
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <FederalTaxesCard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
    </Flex>
  )
}

export function FederalTaxesEditFormContextual() {
  const { employeeId, onEvent } = useFlow<FederalTaxesContextInterface>()
  return <FederalTaxesEditForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}
