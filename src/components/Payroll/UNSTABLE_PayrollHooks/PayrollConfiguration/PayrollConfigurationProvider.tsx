import { Suspense, type ReactNode } from 'react'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import {
  PayrollConfigurationContext,
  type PayrollConfigurationContextValue,
} from './PayrollConfigurationContext'
import { BaseBoundaries, type BaseBoundariesProps } from '@/components/Base/Base'
import { useLoadingIndicator } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'
import type { LoadingIndicatorContextProps } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'

export interface PayrollConfigurationProviderProps extends BaseBoundariesProps {
  companyId: string
  payrollId: string
  children: ReactNode
  LoaderComponent?: LoadingIndicatorContextProps['LoadingIndicator']
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
  LoaderComponent: LoaderComponentFromProps,
  onErrorBoundaryError,
}: PayrollConfigurationProviderProps) {
  const { LoadingIndicator: LoaderComponentFromContext } = useLoadingIndicator()
  const LoaderComponent = LoaderComponentFromProps ?? LoaderComponentFromContext

  return (
    <BaseBoundaries
      FallbackComponent={FallbackComponent}
      onErrorBoundaryError={onErrorBoundaryError}
    >
      <Suspense fallback={<LoaderComponent />}>
        <PayrollConfigurationProvider companyId={companyId} payrollId={payrollId}>
          {children}
        </PayrollConfigurationProvider>
      </Suspense>
    </BaseBoundaries>
  )
}

export { ComposedPayrollConfigurationProvider as PayrollConfigurationProvider }
