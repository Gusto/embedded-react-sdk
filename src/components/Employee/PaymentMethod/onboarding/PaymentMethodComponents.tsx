import { BankForm } from './BankForm'
import { ListView } from './ListView'
import { SplitView } from './SplitView'
import { useFlow } from '@/components/Flow/useFlow'
import type { FlowContextInterface } from '@/components/Flow/useFlow'

/** @internal */
export interface PaymentMethodContextInterface extends FlowContextInterface {
  employeeId: string
  isAdmin: boolean
}

/** @internal */
export function ListViewContextual() {
  const { employeeId, isAdmin, onEvent } = useFlow<PaymentMethodContextInterface>()
  return <ListView employeeId={employeeId} isAdmin={isAdmin} onEvent={onEvent} />
}

/** @internal */
export function BankFormContextual() {
  const { employeeId, onEvent } = useFlow<PaymentMethodContextInterface>()
  return <BankForm employeeId={employeeId} onEvent={onEvent} />
}

/** @internal */
export function SplitViewContextual() {
  const { employeeId, onEvent } = useFlow<PaymentMethodContextInterface>()
  return <SplitView employeeId={employeeId} onEvent={onEvent} />
}
