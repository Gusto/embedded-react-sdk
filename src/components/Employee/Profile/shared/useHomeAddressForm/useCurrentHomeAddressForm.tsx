import { useEmployeeAddressesGet } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { useHomeAddressForm } from './useHomeAddressForm'
import type { UseHomeAddressFormProps, UseHomeAddressFormResult } from './useHomeAddressForm'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'

export type UseCurrentHomeAddressFormProps = Omit<UseHomeAddressFormProps, 'homeAddressUuid'>

export function useCurrentHomeAddressForm(
  props: UseCurrentHomeAddressFormProps,
): UseHomeAddressFormResult {
  const { employeeId, ...rest } = props

  const listQuery = useEmployeeAddressesGet({ employeeId }, { enabled: !!employeeId })

  const homeAddresses = listQuery.data?.employeeAddressList
  const currentHomeAddress = homeAddresses?.find(a => a.active) ?? homeAddresses?.[0]

  const base = useHomeAddressForm({
    ...rest,
    employeeId,
    homeAddressUuid: currentHomeAddress?.uuid,
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
