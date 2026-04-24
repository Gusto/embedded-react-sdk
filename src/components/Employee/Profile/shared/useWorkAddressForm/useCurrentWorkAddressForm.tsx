import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useWorkAddressForm } from './useWorkAddressForm'
import type { UseWorkAddressFormProps, UseWorkAddressFormResult } from './useWorkAddressForm'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'

export type UseCurrentWorkAddressFormProps = Omit<UseWorkAddressFormProps, 'workAddressUuid'>

export function useCurrentWorkAddressForm(
  props: UseCurrentWorkAddressFormProps,
): UseWorkAddressFormResult {
  const { employeeId, ...rest } = props

  const listQuery = useEmployeeAddressesGetWorkAddresses(
    { employeeId: employeeId ?? '' },
    { enabled: !!employeeId },
  )

  const workAddresses = listQuery.data?.employeeWorkAddressesList
  const currentWorkAddress = workAddresses?.find(w => w.active) ?? workAddresses?.[0]

  const base = useWorkAddressForm({
    ...rest,
    employeeId,
    workAddressUuid: currentWorkAddress?.uuid,
  })

  const listInitiallyBlocking = listQuery.isLoading && !listQuery.data

  if (listInitiallyBlocking) {
    return {
      isLoading: true as const,
      errorHandling: composeErrorHandler([listQuery]),
    }
  }

  if (base.isLoading) {
    return {
      ...base,
      errorHandling: composeErrorHandler([listQuery, { errorHandling: base.errorHandling }]),
    }
  }

  return {
    ...base,
    errorHandling: composeErrorHandler([listQuery, { errorHandling: base.errorHandling }]),
  }
}
