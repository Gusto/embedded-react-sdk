import { useMemo } from 'react'
import { createMachine } from 'robot3'
import type { ConfirmWireDetailsComponentType } from '../ConfirmWireDetails/ConfirmWireDetails'
import { payrollLandingMachine } from './payrollLandingStateMachine'
import {
  PayrollLandingTabsContextual,
  type PayrollLandingFlowContextInterface,
  type PayrollLandingFlowProps,
} from './PayrollLandingFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useComponentDictionary } from '@/i18n'

interface PayrollLandingProps extends BaseComponentInterface<'Payroll.PayrollLanding'> {
  companyId: string
  withReimbursements?: boolean
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
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
}: PayrollLandingFlowProps) {
  useComponentDictionary('Payroll.PayrollLanding', dictionary)

  const machine = useMemo(
    () =>
      createMachine(
        'tabs',
        payrollLandingMachine,
        (initialContext: PayrollLandingFlowContextInterface) => ({
          ...initialContext,
          component: PayrollLandingTabsContextual,
          companyId,
          selectedTab: 'run-payroll',
          withReimbursements,
          ConfirmWireDetailsComponent,
        }),
      ),
    [companyId, withReimbursements, ConfirmWireDetailsComponent],
  )

  return <Flow onEvent={onEvent} machine={machine} />
}
