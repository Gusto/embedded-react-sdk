import { CompensationCard } from '@/components/Employee/Compensation/management/CompensationCard'
import { Flex } from '@/components/Common/Flex/Flex'
import { PaymentMethodCard } from '@/components/Employee/PaymentMethod/management'
import { DeductionsCard } from '@/components/Employee/Deductions/management/DeductionsCard'
import { PaystubsCard } from '@/components/Employee/Paystubs/management/PaystubsCard'
import { type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

/**
 * Props for {@link JobAndPayView}.
 *
 * @internal
 */
export interface JobAndPayViewProps {
  /** The associated employee identifier. */
  employeeId: string
  /** Event handler invoked when the inner Compensation, Payment method, Deductions, and Paystubs cards emit events. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Layout container for the Job and pay tab of the employee dashboard.
 *
 * @remarks
 * Renders the Compensation, Payment method, Deductions, and Paystubs cards
 * stacked vertically. Each card is a self-fetching surface that owns its own
 * data fetch and event emission; this container only forwards `employeeId`
 * and `onEvent`.
 *
 * @param props - See {@link JobAndPayViewProps}.
 * @returns The stacked card layout for the Job and pay tab.
 * @internal
 */
export function JobAndPayView({ employeeId, onEvent }: JobAndPayViewProps) {
  return (
    <Flex flexDirection="column" gap={24}>
      <CompensationCard employeeId={employeeId} onEvent={onEvent} />
      <PaymentMethodCard employeeId={employeeId} onEvent={onEvent} />
      <DeductionsCard employeeId={employeeId} onEvent={onEvent} />
      <PaystubsCard employeeId={employeeId} onEvent={onEvent} />
    </Flex>
  )
}
