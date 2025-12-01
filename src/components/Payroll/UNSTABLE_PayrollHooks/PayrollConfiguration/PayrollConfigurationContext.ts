import { createContext } from 'react'
import type { PayrollShow } from '@gusto/embedded-api/models/components/payrollshow'

export interface PayrollConfigurationContextValue {
  payrollData: {
    payrollShow?: PayrollShow | null
  }
}

export const PayrollConfigurationContext = createContext<
  PayrollConfigurationContextValue | undefined
>(undefined)
