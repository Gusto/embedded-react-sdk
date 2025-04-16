import { type Signatory } from '@gusto/embedded-api/models/components/signatory'
import { createCompoundContext } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'

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

export { useCreateSignatory, CreateSignatoryProvider }
