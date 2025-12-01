import { useContext } from 'react'
import {
  PayrollConfigurationContext,
  type PayrollConfigurationContextValue,
} from './PayrollConfigurationContext'

export function usePayrollConfiguration(): PayrollConfigurationContextValue {
  const context = useContext(PayrollConfigurationContext)
  if (context === undefined) {
    throw new Error('usePayrollConfiguration must be used within a PayrollConfigurationProvider')
  }
  return context
}
