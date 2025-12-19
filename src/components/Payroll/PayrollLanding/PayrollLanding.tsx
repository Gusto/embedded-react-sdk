import { useMemo } from 'react'
import { createMachine } from 'robot3'
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
        }),
      ),
    [companyId, withReimbursements],
  )

  return <Flow onEvent={onEvent} machine={machine} />
}
