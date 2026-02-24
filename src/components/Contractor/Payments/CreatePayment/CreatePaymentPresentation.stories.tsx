import { useState } from 'react'
import { fn } from 'storybook/test'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { ContractorPayments } from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import { CreatePaymentPresentation } from './CreatePaymentPresentation'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

export default {
  title: 'Domain/Contractor/Payments/CreatePayment',
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
  {
    uuid: 'contractor-3',
    businessName: 'Acme Consulting LLC',
    type: 'Business',
    wageType: 'Fixed',
    isActive: true,
    paymentMethod: 'Direct Deposit',
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
  {
    contractorUuid: 'contractor-3',
    paymentMethod: 'Direct Deposit',
    wage: '5000',
    hours: '0',
    bonus: '500',
    reimbursement: '0',
  },
]

function StoryWrapper({
  contractors,
  contractorPayments,
}: {
  contractors: Contractor[]
  contractorPayments: ContractorPayments[]
}) {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0] || '')

  const totals = contractorPayments.reduce<{
    wage: number
    bonus: number
    reimbursement: number
    total: number
  }>(
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

  return (
    <GustoTestProvider>
      <CreatePaymentPresentation
        contractors={contractors}
        contractorPayments={contractorPayments}
        paymentDate={paymentDate}
        onPaymentDateChange={setPaymentDate}
        onSaveAndContinue={fn().mockName('onSaveAndContinue')}
        onEditContractor={fn().mockName('onEditContractor')}
        totals={totals}
        alerts={{}}
        isLoading={false}
      />
    </GustoTestProvider>
  )
}

export const WithContractors = () => (
  <StoryWrapper contractors={mockContractors} contractorPayments={mockContractorPayments} />
)

export const EmptyState = () => <StoryWrapper contractors={[]} contractorPayments={[]} />
