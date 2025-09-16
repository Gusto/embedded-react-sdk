import { useState } from 'react'
import type { ContractorDataStrict } from '../types'
import { CreatePaymentPresentation } from './CreatePaymentPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'

type ContractorData = ContractorDataStrict

interface ContractorPaymentCreatePaymentProps
  extends BaseComponentInterface<'ContractorPayment.ContractorPaymentCreatePayment'> {
  companyId: string
  paymentGroupId?: string
}

export function ContractorPaymentCreatePayment(
  props: ContractorPaymentCreatePaymentProps & BaseComponentInterface,
) {
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
}: ContractorPaymentCreatePaymentProps) => {
  useComponentDictionary('ContractorPayment.ContractorPaymentCreatePayment', dictionary)
  useI18n('ContractorPayment.ContractorPaymentCreatePayment')

  // const { LoadingIndicator } = useBase()

  // Mock contractor data from GWS Flows screens
  const [contractors, setContractors] = useState<ContractorData[]>([
    {
      id: '1',
      name: 'Armstrong, Louis',
      wageType: 'Fixed',
      paymentMethod: 'Direct Deposit',
      hours: 0,
      wage: 1000,
      bonus: 0,
      reimbursement: 0,
      total: 1000,
    },
    {
      id: '2',
      name: 'Fitzgerald, Ella',
      wageType: 'Hourly',
      hourlyRate: 18,
      paymentMethod: 'Direct Deposit',
      hours: 10,
      wage: 0,
      bonus: 0,
      reimbursement: 0,
      total: 180,
    },
  ])

  const [paymentDate, setPaymentDate] = useState('2025-09-17')
  const [editingContractor, setEditingContractor] = useState<ContractorData | null>(null)

  const onBack = () => {
    onEvent(componentEvents.PAYMENT_BACK)
  }

  const onSaveAndContinue = () => {
    // In real implementation, this would save the payment configuration
    onEvent(componentEvents.PAYMENT_CONFIGURED, { paymentGroupId: 'payment-group-1' })
  }

  const onEditContractor = (contractor: ContractorData) => {
    setEditingContractor(contractor)
  }

  const onSaveContractor = (updatedContractor: ContractorData) => {
    setContractors(prev => prev.map(c => (c.id === updatedContractor.id ? updatedContractor : c)))
    setEditingContractor(null)
  }

  const onCancelEdit = () => {
    setEditingContractor(null)
  }

  // const wrappedOnEvent: OnEventType<string, unknown> = (event, payload) => {
  //   onEvent(event as EventType, payload)
  // }

  const totalWages = contractors.reduce((sum, c) => sum + c.wage + c.hours * (c.hourlyRate || 0), 0)
  const totalBonus = contractors.reduce((sum, c) => sum + c.bonus, 0)
  const totalReimbursement = contractors.reduce((sum, c) => sum + c.reimbursement, 0)
  const grandTotal = totalWages + totalBonus + totalReimbursement

  return (
    <CreatePaymentPresentation
      contractors={contractors}
      paymentDate={paymentDate}
      onPaymentDateChange={setPaymentDate}
      onBack={onBack}
      onSaveAndContinue={onSaveAndContinue}
      onEditContractor={onEditContractor}
      editingContractor={editingContractor}
      onSaveContractor={onSaveContractor}
      onCancelEdit={onCancelEdit}
      totals={{
        wages: totalWages,
        bonus: totalBonus,
        reimbursement: totalReimbursement,
        total: grandTotal,
      }}
    />
  )
}
