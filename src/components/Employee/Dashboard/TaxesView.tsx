import { Flex } from '@/components/Common/Flex/Flex'
import { FederalTaxesCard } from '@/components/Employee/FederalTaxes/management/FederalTaxesCard'
import { StateTaxesCard } from '@/components/Employee/StateTaxes/management/StateTaxesCard'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

/**
 * Props for {@link TaxesView} and {@link TaxesViewWithData}.
 *
 * @internal
 */
export interface TaxesViewProps {
  /** The associated employee identifier. */
  employeeId: string
  /** Event handler invoked when the inner Federal taxes and State taxes cards emit events. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Props for {@link TaxesViewWithData}. Alias of {@link TaxesViewProps}.
 *
 * @internal
 */
export type TaxesViewWithDataProps = TaxesViewProps

/**
 * Layout container for the Taxes tab of the employee dashboard.
 *
 * @remarks
 * Identical to {@link TaxesView} — kept as a separate export for naming
 * symmetry with other dashboard tab containers that historically owned
 * their own data fetching. Both the Federal taxes and State taxes surfaces
 * are now standalone, self-fetching cards rendered as siblings, so this
 * view owns no data fetching or edit-screen orchestration of its own.
 *
 * @param props - See {@link TaxesViewWithDataProps}.
 * @returns The stacked card layout for the Taxes tab.
 * @internal
 */
export function TaxesViewWithData(props: TaxesViewWithDataProps) {
  return <TaxesView {...props} />
}

/**
 * Layout container for the Taxes tab of the employee dashboard.
 *
 * @remarks
 * Renders the Federal taxes and State taxes cards stacked vertically. Each
 * card is a self-fetching surface that owns its own data fetch and event
 * emission; this container only forwards `employeeId` and `onEvent`.
 *
 * @param props - See {@link TaxesViewProps}.
 * @returns The stacked card layout for the Taxes tab.
 * @internal
 */
export function TaxesView({ employeeId, onEvent }: TaxesViewProps) {
  return (
    <Flex flexDirection="column" gap={24}>
      <FederalTaxesCard employeeId={employeeId} onEvent={onEvent} />
      <StateTaxesCard employeeId={employeeId} onEvent={onEvent} />
    </Flex>
  )
}
