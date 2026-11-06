import { Flex } from '@/components/Common/Flex/Flex'
import { FederalTaxesCard } from '@/components/Company/FederalTaxes/management/FederalTaxesCard'
import { StateTaxesCard } from '@/components/Company/StateTaxes/management/StateTaxesCard'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link TaxesView}.
 *
 * @internal
 */
export interface TaxesViewProps {
  /** The associated company identifier. */
  companyId: string
  /** Event handler invoked when the inner cards emit events. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator forwarded to each card. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Layout container for the Taxes tab of the company settings dashboard.
 *
 * @remarks
 * Renders the company's tax cards stacked vertically, federal above state. Each
 * card is a self-fetching surface that owns its own data fetch and event
 * emission; this container only forwards `companyId` and `onEvent`.
 *
 * @param props - See {@link TaxesViewProps}.
 * @returns The stacked card layout for the Taxes tab.
 * @internal
 */
export function TaxesView({ companyId, onEvent, LoaderComponent }: TaxesViewProps) {
  return (
    <Flex flexDirection="column" gap={24}>
      <FederalTaxesCard companyId={companyId} onEvent={onEvent} LoaderComponent={LoaderComponent} />
      <StateTaxesCard companyId={companyId} onEvent={onEvent} LoaderComponent={LoaderComponent} />
    </Flex>
  )
}
