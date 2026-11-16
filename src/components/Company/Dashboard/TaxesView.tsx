import { Flex } from '@/components/Common/Flex/Flex'
import { FederalTaxesCard } from '@/components/Company/FederalTaxes/management/FederalTaxesCard'
import { StateTaxesCard } from '@/components/Company/StateTaxes/management/StateTaxesCard'
import { TaxPaymentsCard } from '@/components/Company/TaxPayments/management/TaxPaymentsCard'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
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
 * Renders the company's tax cards stacked vertically: the company's own tax
 * setup first, federal above state, then what it currently owes. Each card is a
 * self-fetching surface that owns its own data fetch and event emission; this
 * container only forwards `companyId` and `onEvent`.
 *
 * The Tax payments card is omitted unless the `taxPayments` unstable feature
 * flag is on, because the screen its Manage button routes to —
 * `CompanyManagement.TaxPaymentsFlow` — throws without that flag. Omitting the
 * card keeps the route unreachable rather than letting it lead somewhere that
 * throws.
 *
 * @param props - See {@link TaxesViewProps}.
 * @returns The stacked card layout for the Taxes tab.
 * @internal
 */
export function TaxesView({ companyId, onEvent, LoaderComponent }: TaxesViewProps) {
  const canReviewTaxPayments = useUnstableFeature('taxPayments')

  return (
    <Flex flexDirection="column" gap={24}>
      <FederalTaxesCard companyId={companyId} onEvent={onEvent} LoaderComponent={LoaderComponent} />
      <StateTaxesCard companyId={companyId} onEvent={onEvent} LoaderComponent={LoaderComponent} />
      {canReviewTaxPayments && (
        <TaxPaymentsCard
          companyId={companyId}
          onEvent={onEvent}
          LoaderComponent={LoaderComponent}
        />
      )}
    </Flex>
  )
}
