import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useWorkAddressForm } from './useWorkAddressForm'
import type { UseWorkAddressFormProps, UseWorkAddressFormResult } from './useWorkAddressForm'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'

/**
 * Options for {@link useCurrentWorkAddressForm}.
 *
 * @remarks
 * Same shape as {@link UseWorkAddressFormProps} minus `workAddressUuid` —
 * the hook resolves the current work address itself.
 *
 * @public
 */
export type UseCurrentWorkAddressFormProps = Omit<UseWorkAddressFormProps, 'workAddressUuid'>

/**
 * Convenience wrapper around {@link useWorkAddressForm} that auto-resolves the employee's current work address.
 *
 * @remarks
 * Lists the employee's work addresses and selects the active one (or the
 * first when none are active) as the row to edit. When the employee has no
 * work address on file the hook operates in create mode. The returned shape
 * is identical to {@link useWorkAddressForm}, so the same `Fields`,
 * `actions.onSubmit`, and `errorHandling` apply.
 *
 * @param props - See {@link UseCurrentWorkAddressFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseWorkAddressFormReady} once ready.
 * @public
 *
 * @example
 * ```tsx
 * import { useCurrentWorkAddressForm } from '@gusto/embedded-react-sdk'
 *
 * function WorkAddressEditor({ employeeId, companyId }: { employeeId: string; companyId: string }) {
 *   const workAddress = useCurrentWorkAddressForm({ employeeId, companyId })
 *
 *   if (workAddress.isLoading) return <div>Loading...</div>
 *
 *   const { Fields } = workAddress.form
 *   return (
 *     <form onSubmit={e => { e.preventDefault(); void workAddress.actions.onSubmit() }}>
 *       <Fields.Location label="Work location" />
 *       <button type="submit">Save</button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useCurrentWorkAddressForm(
  props: UseCurrentWorkAddressFormProps,
): UseWorkAddressFormResult {
  const { employeeId, ...rest } = props

  const listQuery = useEmployeeAddressesGetWorkAddresses({ employeeId }, { enabled: !!employeeId })

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
