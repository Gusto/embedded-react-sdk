import type { ReactNode } from 'react'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import {
  PayrollConfigurationContext,
  type PayrollConfigurationContextValue,
} from './PayrollConfigurationContext'
import { BaseBoundaries, type BaseBoundariesProps } from '@/components/Base/Base'

export interface PayrollConfigurationProviderProps extends BaseBoundariesProps {
  companyId: string
  payrollId: string
  children: ReactNode
}

function PayrollConfigurationProvider({
  companyId,
  payrollId,
  children,
}: PayrollConfigurationProviderProps) {
  const { data: payrollData } = usePayrollsGetSuspense({
    companyId,
    payrollId,
    include: ['taxes', 'benefits', 'deductions'],
  })

  const contextValue: PayrollConfigurationContextValue = {
    payrollData,
  }

  return (
    <PayrollConfigurationContext.Provider value={contextValue}>
      {children}
    </PayrollConfigurationContext.Provider>
  )
}

function ComposedPayrollConfigurationProvider({
  companyId,
  payrollId,
  children,
  FallbackComponent,
  LoaderComponent,
  onErrorBoundaryError,
}: PayrollConfigurationProviderProps) {
  return (
    <BaseBoundaries
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
      onErrorBoundaryError={onErrorBoundaryError}
    >
      <PayrollConfigurationProvider companyId={companyId} payrollId={payrollId}>
        {children}
      </PayrollConfigurationProvider>
    </BaseBoundaries>
  )
}

export { ComposedPayrollConfigurationProvider as PayrollConfigurationProvider }
