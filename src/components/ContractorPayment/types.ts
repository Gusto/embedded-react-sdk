export interface ContractorData {
  id: string
  name: string
  wageType: 'Fixed' | 'Hourly' | ''
  hourlyRate?: number
  paymentMethod: 'Direct Deposit' | 'Check' | 'Historical Payment' | ''
  hours: number | ''
  wage: number
  bonus: number
  reimbursement: number
  total: number
  isTotalRow?: boolean
}

export interface ContractorDataStrict {
  id: string
  name: string
  wageType: 'Fixed' | 'Hourly'
  hourlyRate?: number
  paymentMethod: 'Direct Deposit' | 'Check' | 'Historical Payment'
  hours: number
  wage: number
  bonus: number
  reimbursement: number
  total: number
}
