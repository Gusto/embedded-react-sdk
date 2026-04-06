import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { firstLastName } from '@/helpers/formattedStrings'

export const getContractorDisplayName = (contractor?: Contractor): string => {
  if (!contractor) {
    return ''
  }
  if (contractor.type === 'Individual') {
    return firstLastName({ first_name: contractor.firstName, last_name: contractor.lastName })
  } else {
    return contractor.businessName || ''
  }
}

export const calculateDefaultHistoricalDate = (): string => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0] || ''
}

export const getMaxHistoricalDate = (): string => {
  const today = new Date()
  return today.toISOString().split('T')[0] || ''
}

export const getMinHistoricalDate = (): string => {
  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
  return twoYearsAgo.toISOString().split('T')[0] || ''
}
