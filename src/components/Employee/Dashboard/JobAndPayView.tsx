import { CompensationCard } from '@/components/Employee/Compensation/management/CompensationCard'
import { Flex } from '@/components/Common/Flex/Flex'
import { PaymentMethodCard } from '@/components/Employee/PaymentMethod/management'
import { DeductionsCard } from '@/components/Employee/Deductions/management/DeductionsCard'
import { PaystubsCard } from '@/components/Employee/Paystubs/management/PaystubsCard'
import { type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

export interface JobAndPayViewProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

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
