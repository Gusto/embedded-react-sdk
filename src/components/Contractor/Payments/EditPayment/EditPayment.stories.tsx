import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { FormWrapper } from '../../../../../.ladle/helpers/FormWrapper'
import { EditPaymentPresentation } from './EditPaymentPresentation'

export default {
  title: 'Domain/Contractor/Payments/Edit Payment',
} satisfies StoryDefault

export const EditPaymentFixedWage: Story = () => {
  const defaultValues = {
    uuid: '1',
    contractorUuid: 'armstrong-louis',
    wageType: 'Fixed',
    paymentMethod: 'Direct Deposit',
    hours: undefined,
    wage: '1000',
    bonus: '0',
    reimbursement: '0',
    wageTotal: '1000',
  }

  return (
    <FormWrapper defaultValues={defaultValues}>
      <EditPaymentPresentation onSave={action('onSave')} onCancel={action('onCancel')} />
    </FormWrapper>
  )
}

EditPaymentFixedWage.meta = {
  description:
    'Edit modal for fixed wage contractor - allows editing fixed pay, bonus, reimbursements, and payment method',
}

export const EditPaymentHourlyWage: Story = () => {
  const defaultValues = {
    uuid: '2',
    contractorUuid: 'fitzgerald-ella',
    wageType: 'Hourly',
    hourlyRate: '18',
    paymentMethod: 'Check',
    hours: '16',
    wage: undefined,
    bonus: '350',
    reimbursement: '0',
    wageTotal: '638',
  }

  return (
    <FormWrapper defaultValues={defaultValues}>
      <EditPaymentPresentation onSave={action('onSave')} onCancel={action('onCancel')} />
    </FormWrapper>
  )
}

EditPaymentHourlyWage.meta = {
  description:
    'Edit modal for hourly wage contractor - allows editing hours, bonus, reimbursements, and payment method',
}
