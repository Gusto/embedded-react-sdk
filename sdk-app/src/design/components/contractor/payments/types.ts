export type WageType = 'Hourly' | 'Fixed'
export type ContractorType = 'Individual' | 'Business'

export interface ContractorOption {
  id: string
  name: string
  type: ContractorType
  wageType: WageType
  hourlyRate?: string
}

export interface HistoricalContractorPayment {
  contractorId: string
  hours: string
  wage: string
  bonus: string
  reimbursement: string
}

export function computePaymentTotal(
  payment: HistoricalContractorPayment,
  contractor: ContractorOption,
): number {
  const wages =
    contractor.wageType === 'Hourly'
      ? Number(payment.hours || '0') * Number(contractor.hourlyRate || '0')
      : Number(payment.wage || '0')
  return wages + Number(payment.bonus || '0') + Number(payment.reimbursement || '0')
}

export function emptyPaymentFor(contractor: ContractorOption): HistoricalContractorPayment {
  return {
    contractorId: contractor.id,
    hours: '',
    wage: '',
    bonus: '',
    reimbursement: '',
  }
}
