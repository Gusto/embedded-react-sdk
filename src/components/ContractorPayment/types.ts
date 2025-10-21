import type { PostV1CompaniesCompanyIdContractorPaymentsRequestBody } from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpayments'

export interface ContractorData {
  id: string
  name: string
  wageType: 'Fixed' | 'Hourly' | ''
  hourlyRate?: number
  paymentMethod: PostV1CompaniesCompanyIdContractorPaymentsRequestBody['paymentMethod'] | ''
  hours: number | ''
  wage: number
  bonus: number
  reimbursement: number
  total: number
  isTotalRow?: boolean
}

export type ContractorDataStrict = Omit<ContractorData, 'hours' | 'wageType' | 'paymentMethod'> & {
  wageType: 'Fixed' | 'Hourly'
  paymentMethod: PostV1CompaniesCompanyIdContractorPaymentsRequestBody['paymentMethod']
  hours: number
}
