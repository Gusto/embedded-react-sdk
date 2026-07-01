import { type Signatory } from '@gusto/embedded-api-v-2026-02-01/models/components/signatory'
import { createCompoundContext } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'

/**
 * Initial values for the {@link CreateSignatory} form fields. At least one field must be provided.
 *
 * @public
 */
export type CreateSignatoryDefaultValues = RequireAtLeastOne<
  Pick<Signatory, 'firstName' | 'lastName' | 'email' | 'title' | 'phone' | 'birthday'> &
    Pick<
      NonNullable<Signatory['homeAddress']>,
      'street1' | 'street2' | 'city' | 'state' | 'zip'
    > & {
      ssn?: string
    }
>
type CreateSignatoryContextType = {
  isPending: boolean
  currentSignatory?: Signatory
}

const [useCreateSignatory, CreateSignatoryProvider] =
  createCompoundContext<CreateSignatoryContextType>('CreateSignatoryContext')

export {
  /** @internal */
  useCreateSignatory,
  /** @internal */
  CreateSignatoryProvider,
}
