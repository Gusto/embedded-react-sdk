import { Suspense, type ReactNode, type JSX, type ErrorInfo } from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import {
  PayrollConfigurationContext,
  type PayrollConfigurationContextValue,
} from './PayrollConfigurationContext'
import { BaseBoundaries } from '@/components/Base/Base'
import { useLoadingIndicator } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'
import type { LoadingIndicatorContextProps } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'

export interface PayrollConfigurationProviderProps {
  companyId: string
  payrollId: string
  children: ReactNode
  FallbackComponent?: (props: FallbackProps) => JSX.Element
  LoaderComponent?: LoadingIndicatorContextProps['LoadingIndicator']
  onErrorBoundaryError?: (error: unknown, info: ErrorInfo) => void
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
  LoaderComponent: LoadingIndicatorFromProps,
  onErrorBoundaryError,
}: PayrollConfigurationProviderProps) {
  const { LoadingIndicator: LoadingIndicatorFromContext } = useLoadingIndicator()
  const LoaderComponent = LoadingIndicatorFromProps ?? LoadingIndicatorFromContext

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
