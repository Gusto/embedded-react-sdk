/* eslint-disable no-console */
import { useState } from 'react'
import { SelectContractors } from '../../../components/contractor/payments/SelectContractors/SelectContractors'
import { HistoricalPaymentConfiguration } from '../../../components/contractor/payments/HistoricalPaymentConfiguration/HistoricalPaymentConfiguration'
import type {
  ContractorOption,
  HistoricalContractorPayment,
} from '../../../components/contractor/payments/types'

interface SelectContractorsHarnessProps {
  initialContractors: ContractorOption[]
  initialDate?: string
}

export function SelectContractorsHarness({
  initialContractors,
  initialDate = '',
}: SelectContractorsHarnessProps) {
  const [paidDate, setPaidDate] = useState(initialDate)
  const [selected, setSelected] = useState<string[]>([])
  return (
    <SelectContractors
      contractors={initialContractors}
      paidDate={paidDate}
      selectedContractorIds={selected}
      onPaidDateChange={setPaidDate}
      onToggleContractor={id => {
        setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
      }}
      onSelectAllContractors={(checked, visibleContractors) => {
        const visibleIds = visibleContractors.map(c => c.id)
        setSelected(prev =>
          checked
            ? Array.from(new Set([...prev, ...visibleIds]))
            : prev.filter(id => !visibleIds.includes(id)),
        )
      }}
      onContinue={() => {
        console.log('continue', { paidDate, selected })
      }}
    />
  )
}

interface ConfigurationHarnessProps {
  contractors: ContractorOption[]
  initialPayments: HistoricalContractorPayment[]
}

export function ConfigurationHarness({ contractors, initialPayments }: ConfigurationHarnessProps) {
  const [payments, setPayments] = useState(initialPayments)
  return (
    <HistoricalPaymentConfiguration
      contractors={contractors}
      payments={payments}
      onUpdatePayment={updated => {
        setPayments(prev => prev.map(p => (p.contractorId === updated.contractorId ? updated : p)))
      }}
      onContinue={() => {
        console.log('continue to review')
      }}
    />
  )
}
