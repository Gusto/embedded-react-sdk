import { useEmployeeAddressesGet } from '@gusto/embedded-api-v-2026-02-01/react-query/employeeAddressesGet'
import { useHomeAddressForm } from './useHomeAddressForm'
import type { UseHomeAddressFormProps, UseHomeAddressFormResult } from './useHomeAddressForm'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'

/**
 * Options for {@link useCurrentHomeAddressForm}.
 *
 * @remarks
 * Same shape as {@link UseHomeAddressFormProps} minus `homeAddressUuid` —
 * the hook resolves the current home address itself.
 *
 * @public
 */
export type UseCurrentHomeAddressFormProps = Omit<UseHomeAddressFormProps, 'homeAddressUuid'>

/**
 * Convenience wrapper around {@link useHomeAddressForm} that auto-resolves the employee's current home address.
 *
 * @remarks
 * Lists the employee's home addresses and selects the active one (or the
 * first when none are active) as the row to edit. When the employee has no
 * home address on file the hook operates in create mode. The returned
 * shape is identical to {@link useHomeAddressForm}, so the same `Fields`,
 * `actions.onSubmit`, and `errorHandling` apply.
 *
 * @param props - See {@link UseCurrentHomeAddressFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseHomeAddressFormReady} once ready.
 * @public
 *
 * @example
 * ```tsx
 * import { useCurrentHomeAddressForm } from '@gusto/embedded-react-sdk'
 *
 * function HomeAddressEditor({ employeeId }: { employeeId: string }) {
 *   const homeAddress = useCurrentHomeAddressForm({ employeeId })
 *
 *   if (homeAddress.isLoading) return <div>Loading...</div>
 *
 *   const { Fields } = homeAddress.form
 *   return (
 *     <form onSubmit={e => { e.preventDefault(); void homeAddress.actions.onSubmit() }}>
 *       <Fields.Street1 label="Street" />
 *       <Fields.City label="City" />
 *       <Fields.State label="State" />
 *       <Fields.Zip label="ZIP" />
 *       <button type="submit">Save</button>
 *     </form>
 *   )
 * }
 * ```
 */
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
