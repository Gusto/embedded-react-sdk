import type { ConfirmWireDetailsComponentType } from '../ConfirmWireDetails/ConfirmWireDetails'
import type { PayrollLandingFlowProps } from './PayrollLandingFlowComponents'
import { usePayrollLanding } from './usePayrollLanding'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useComponentDictionary } from '@/i18n'

interface PayrollLandingProps extends BaseComponentInterface<'Payroll.PayrollLanding'> {
  companyId: string
  withReimbursements?: boolean
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
  showPayrollCancelledAlert?: boolean
}

export function PayrollLanding(props: PayrollLandingProps) {
  return (
    <BaseComponent {...props}>
      <PayrollLandingFlow {...props} />
    </BaseComponent>
  )
}

export function PayrollLandingFlow({
  companyId,
  onEvent,
  dictionary,
  withReimbursements = true,
  ConfirmWireDetailsComponent,
  showPayrollCancelledAlert,
}: PayrollLandingFlowProps) {
  useComponentDictionary('Payroll.PayrollLanding', dictionary)

  const {
    meta: { machine },
  } = usePayrollLanding({
    companyId,
    withReimbursements,
    ConfirmWireDetailsComponent,
    showPayrollCancelledAlert,
  })

  return <Flow onEvent={onEvent} machine={machine} />
}
