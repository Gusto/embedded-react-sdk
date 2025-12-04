import { OverviewPresentation } from './OverviewPresentation'
import { useComponentDictionary } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

interface OverviewProps extends BaseComponentInterface<'Contractor.Payments.Overview'> {
  companyId: string
}

export function Overview(props: OverviewProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ companyId, dictionary, onEvent, children }: OverviewProps) => {
  useComponentDictionary('Contractor.Payments.Overview', dictionary)

  const onSubmit = () => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_SUBMIT)
  }
  const onEdit = () => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_CREATE)
  }
  return (
    <OverviewPresentation
      contractorPaymentGroup={{
        uuid: 'group-1',
        companyUuid: 'company-1',
        checkDate: '2025-09-17',
        debitDate: '2025-09-15',
        status: 'Unfunded' as const,
        totals: {
          amount: '1180',
          debitAmount: '1180',
          wageAmount: '1000',
          reimbursementAmount: '0',
        },
        contractorPayments: [
          {
            uuid: '1',
            contractorUuid: 'armstrong-louis',
            wageType: 'Fixed' as const,
            paymentMethod: 'Direct Deposit' as const,
            hours: undefined,
            wage: '1000',
            bonus: '0',
            reimbursement: '0',
            wageTotal: '1000',
          },
          {
            uuid: '2',
            contractorUuid: 'fitzgerald-ella',
            wageType: 'Hourly' as const,
            hourlyRate: '18',
            paymentMethod: 'Direct Deposit' as const,
            hours: '10',
            wage: undefined,
            bonus: '0',
            reimbursement: '0',
            wageTotal: '180',
          },
        ],
      }}
      paymentSummary={{
        totalAmount: '1180',
        debitAmount: '1180',
        debitAccount: 'Checking Account ending in 4567',
        debitDate: '2025-09-15',
        contractorPayDate: '2025-09-17',
        checkDate: '2025-09-17',
        submitByDate: '2025-09-14',
      }}
      onEdit={onEdit}
      onSubmit={onSubmit}
    />
  )
}
