import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { taxPaymentsMachine } from './taxPaymentsStateMachine'
import {
  TaxPaymentsListContextual,
  type TaxPaymentsFlowContextInterface,
  type TaxPaymentsFlowProps,
} from './TaxPaymentsFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'

/**
 * Hub for reviewing a company's tax payments and the payroll tax liabilities behind each one.
 *
 * @remarks
 * Requires the `taxPayments` flag in {@link UnstableFeatures}. Starts on the tax payments list,
 * where the user can search, filter by jurisdiction or status, and jump to overdue payments.
 * Selecting a payment opens its detail view; the back button returns to the list.
 *
 * Events emitted by the blocks bubble up through the single `onEvent` handler.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `payroll/taxPayments/view` | Fired when the user selects a tax payment to view | `{ taxPaymentId: string }` |
 * | `payroll/taxPayments/back` | Fired when the user returns from a tax payment to the list | — |
 *
 * @components
 * - {@link TaxPaymentsList}
 * - {@link TaxPaymentDetail}
 *
 * @param props - See {@link TaxPaymentsFlowProps}.
 * @returns The tax payments hub.
 * @alpha
 *
 * @example
 * ```tsx title="App.tsx"
 * import { GustoProvider, Payroll } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <GustoProvider config={{ baseUrl: '/api/gusto/' }} unstableFeatures={{ taxPayments: true }}>
 *       <Payroll.TaxPaymentsFlow
 *         companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *         onEvent={() => {}}
 *       />
 *     </GustoProvider>
 *   )
 * }
 * ```
 */
export const TaxPaymentsFlow = ({ companyId, onEvent }: TaxPaymentsFlowProps) => {
  useUnstableFeature('taxPayments', { throwIfDisabled: true })

  const taxPaymentsFlow = useMemo(
    () =>
      createMachine(
        'list',
        taxPaymentsMachine,
        (initialContext: TaxPaymentsFlowContextInterface) => ({
          ...initialContext,
          component: TaxPaymentsListContextual,
          companyId,
        }),
      ),
    [companyId],
  )

  return <Flow machine={taxPaymentsFlow} onEvent={onEvent} />
}
