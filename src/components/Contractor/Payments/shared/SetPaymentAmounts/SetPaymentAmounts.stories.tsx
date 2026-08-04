import { useForm } from 'react-hook-form'
import { fn } from 'storybook/test'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { PostV1CompaniesCompanyIdContractorPaymentGroupsContractorPayments as ContractorPayments } from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import type { UsePaymentAmountsEditorReturn } from '../usePaymentAmountsEditor'
import { SetPaymentAmounts, type SetPaymentAmountsDictionary } from './SetPaymentAmounts'
import type { EditContractorPaymentFormValues } from './EditContractorPaymentFormSchema'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

export default {
  title: 'Domain/Contractor/Payments/SetPaymentAmounts',
}

const dictionary: SetPaymentAmountsDictionary = {
  hoursAndPaymentsLabel: 'Hours and payments',
  contractorTableHeaders: {
    contractor: 'Contractor',
    wageType: 'Wage',
    paymentMethod: 'Payment method',
    hours: 'Hours',
    wage: 'Fixed amount',
    bonus: 'Bonus',
    reimbursement: 'Reimbursement',
    total: 'Total',
  },
  emptyTableTitle: 'No contractors available for payment',
  emptyTableDescription:
    'There are no active contractors with completed onboarding. Add and onboard contractors before creating payments.',
  na: 'N/A',
  totalsLabel: 'Totals',
  editContractor: 'Edit contractor payment',
  perHour: '/hr',
  editContractorPayment: {
    title: 'Edit contractor pay',
    subtitle:
      'Edit contractor\'s hours, additional earnings, and reimbursements. Inputs not applicable to this contractor are disabled. Please click "Done" to apply the change.',
    hoursLabel: 'Hours',
    hoursAdornment: 'hrs',
    hoursPayDescription: (rate, total) => `${rate}/hr × hours = ${total}`,
    wageLabel: 'Fixed amount',
    bonusLabel: 'Bonus',
    reimbursementLabel: 'Reimbursement',
    paymentMethodLabel: 'Payment Method',
    cancelCta: 'Cancel',
    saveCta: 'Done',
    paymentMethods: {
      check: 'Check',
      directDeposit: 'Direct deposit',
      historicalPayment: 'Historical payment',
    },
    errors: {
      directDepositNotAvailable:
        'Direct Deposit is not available for contractors set up for Check payments',
      unsupportedPaymentMethod:
        'This payment method is not supported. Please select Check or Direct Deposit.',
    },
  },
}

const mockContractors: Contractor[] = [
  {
    uuid: 'contractor-1',
    firstName: 'John',
    lastName: 'Doe',
    type: 'Individual',
    wageType: 'Hourly',
    hourlyRate: '50.00',
    paymentMethod: 'Direct Deposit',
    isActive: true,
    onboardingStatus: 'onboarding_completed',
  },
  {
    uuid: 'contractor-2',
    firstName: 'Jane',
    lastName: 'Smith',
    type: 'Individual',
    wageType: 'Fixed',
    isActive: true,
    paymentMethod: 'Check',
    onboardingStatus: 'onboarding_completed',
  },
]

const mockContractorPayments: ContractorPayments[] = [
  {
    contractorUuid: 'contractor-1',
    paymentMethod: 'Direct Deposit',
    wage: '0',
    hours: '40',
    bonus: '100',
    reimbursement: '50',
  },
  {
    contractorUuid: 'contractor-2',
    paymentMethod: 'Check',
    wage: '2500',
    hours: '0',
    bonus: '0',
    reimbursement: '75',
  },
]

function StoryWrapper({
  contractors,
  contractorPayments,
}: {
  contractors: Contractor[]
  contractorPayments: ContractorPayments[]
}) {
  const totals = contractorPayments.reduce(
    (acc, payment) => {
      const contractor = contractors.find(c => c.uuid === payment.contractorUuid)
      const isHourly = contractor?.wageType === 'Hourly'
      const hours = Number(payment.hours || '0')
      const wage = Number(payment.wage || '0')
      const bonus = Number(payment.bonus || '0')
      const reimbursement = Number(payment.reimbursement || '0')
      const hourlyAmount = isHourly ? hours * Number(contractor.hourlyRate || '0') : 0
      const fixedWage = isHourly ? 0 : wage

      return {
        wage: acc.wage + fixedWage,
        bonus: acc.bonus + bonus,
        reimbursement: acc.reimbursement + reimbursement,
        total: acc.total + hourlyAmount + fixedWage + bonus + reimbursement,
      }
    },
    { wage: 0, bonus: 0, reimbursement: 0, total: 0 },
  )

  const formMethods = useForm<EditContractorPaymentFormValues>({
    defaultValues: { wageType: 'Hourly', paymentMethod: 'Check', contractorUuid: '' },
  })
  const editModal: UsePaymentAmountsEditorReturn['editModal'] = {
    isOpen: false,
    formMethods,
    open: fn().mockName('editModal.open'),
    close: fn().mockName('editModal.close'),
    submit: fn().mockName('editModal.submit'),
  }

  return (
    <GustoTestProvider>
      <SetPaymentAmounts
        contractors={contractors}
        contractorPayments={contractorPayments}
        totals={totals}
        allowedPaymentMethods={['Check', 'Direct Deposit']}
        editModal={editModal}
        dictionary={dictionary}
      />
    </GustoTestProvider>
  )
}

export const WithContractors = () => (
  <StoryWrapper contractors={mockContractors} contractorPayments={mockContractorPayments} />
)

export const EmptyState = () => <StoryWrapper contractors={[]} contractorPayments={[]} />

export const FixedHistoricalPaymentMethod = () => {
  const historicalPayments = mockContractorPayments.map(payment => ({
    ...payment,
    paymentMethod: 'Historical Payment' as const,
  }))

  const formMethods = useForm<EditContractorPaymentFormValues>({
    defaultValues: { wageType: 'Hourly', paymentMethod: 'Historical Payment', contractorUuid: '' },
  })
  const editModal: UsePaymentAmountsEditorReturn['editModal'] = {
    isOpen: false,
    formMethods,
    open: fn().mockName('editModal.open'),
    close: fn().mockName('editModal.close'),
    submit: fn().mockName('editModal.submit'),
  }
  const totals = { wage: 2500, bonus: 100, reimbursement: 125, total: 4725 }

  return (
    <GustoTestProvider>
      <SetPaymentAmounts
        contractors={mockContractors}
        contractorPayments={historicalPayments}
        totals={totals}
        allowedPaymentMethods={['Historical Payment']}
        editModal={editModal}
        dictionary={dictionary}
      />
    </GustoTestProvider>
  )
}
