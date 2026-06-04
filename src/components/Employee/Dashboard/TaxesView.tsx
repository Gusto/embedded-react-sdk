import { Flex } from '@/components/Common/Flex/Flex'
import { FederalTaxesCard } from '@/components/Employee/FederalTaxes/management/FederalTaxesCard'
import { StateTaxesCard } from '@/components/Employee/StateTaxes/management/StateTaxesCard'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

export interface TaxesViewProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

export type TaxesViewWithDataProps = TaxesViewProps

/**
 * Tab-mounted container for the Taxes tab. Both the Federal taxes and State
 * taxes surfaces are now standalone, self-fetching cards rendered as siblings;
 * this view owns no data fetching or edit-screen orchestration of its own.
 */
export function TaxesViewWithData(props: TaxesViewWithDataProps) {
  return <TaxesView {...props} />
}

export function TaxesView({ employeeId, onEvent }: TaxesViewProps) {
  return (
    <Flex flexDirection="column" gap={24}>
      <FederalTaxesCard employeeId={employeeId} onEvent={onEvent} />
      <StateTaxesCard employeeId={employeeId} onEvent={onEvent} />
    </Flex>
  )
}
