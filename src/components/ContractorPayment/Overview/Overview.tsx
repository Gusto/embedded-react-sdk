import { OverviewPresentation } from './OverviewPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'

interface ContractorPaymentOverviewProps
  extends BaseComponentInterface<'ContractorPayment.ContractorPaymentOverview'> {
  companyId: string
  paymentGroupId: string
}

export function Overview(props: ContractorPaymentOverviewProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({
  onEvent,
  companyId,
  paymentGroupId,
  dictionary,
}: ContractorPaymentOverviewProps) => {
  useComponentDictionary('ContractorPayment.ContractorPaymentOverview', dictionary)
  useI18n('ContractorPayment.ContractorPaymentOverview')

  // const { LoadingIndicator } = useBase()

  const paymentSummary = {
    totalAmount: 1180,
    debitAmount: 1180,
    debitAccount: 'XXXX3800',
    debitDate: 'Sep 15, 2025',
    contractorPayDate: 'Sep 17, 2025',
    checkDate: '09/17/2025',
    submitByDate: 'Sep 15, 2025',
  }

  const contractors = [
    {
      id: '1',
      name: 'Armstrong, Louis',
      wageType: 'Fixed' as const,
      paymentMethod: 'Direct Deposit' as const,
      hours: 0,
      wage: 1000,
      bonus: 0,
      reimbursement: 0,
      total: 1000,
    },
    {
      id: '2',
      name: 'Fitzgerald, Ella',
      wageType: 'Hourly' as const,
      hourlyRate: 18,
      paymentMethod: 'Direct Deposit' as const,
      hours: 10,
      wage: 0,
      bonus: 0,
      reimbursement: 0,
      total: 180,
    },
  ]

  const onEdit = () => {
    onEvent(componentEvents.PAYMENT_BACK)
  }

  const onSubmit = () => {
    onEvent(componentEvents.PAYMENT_SUBMITTED)
  }

  // const wrappedOnEvent: OnEventType<string, unknown> = (event, payload) => {
  //   onEvent(event as EventType, payload)
  // }

  return (
    <OverviewPresentation
      paymentSummary={paymentSummary}
      contractors={contractors}
      onEdit={onEdit}
      onSubmit={onSubmit}
    />
  )
}
