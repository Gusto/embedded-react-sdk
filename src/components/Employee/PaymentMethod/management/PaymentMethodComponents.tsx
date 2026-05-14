import { BankForm } from '../onboarding/BankForm'
import { SplitView } from '../onboarding/SplitView'
import { ListView } from './ListView'
import { useFlow } from '@/components/Flow/useFlow'
import type { FlowContextInterface } from '@/components/Flow/useFlow'

export interface PaymentMethodContextInterface extends FlowContextInterface {
  employeeId: string
  isAdmin: boolean
}

export function ListViewContextual() {
  const { employeeId, onEvent } = useFlow<PaymentMethodContextInterface>()
  return <ListView employeeId={employeeId} onEvent={onEvent} />
}

export function BankFormContextual() {
  const { employeeId, onEvent } = useFlow<PaymentMethodContextInterface>()
  return <BankForm employeeId={employeeId} onEvent={onEvent} />
}

export function SplitViewContextual() {
  const { employeeId, onEvent } = useFlow<PaymentMethodContextInterface>()
  return <SplitView employeeId={employeeId} onEvent={onEvent} />
}
