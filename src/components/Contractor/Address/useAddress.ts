import type { Contractor, ContractorType } from '@gusto/embedded-api/models/components/contractor'
import type { ContractorAddress } from '@gusto/embedded-api/models/components/contractoraddress'
import { z } from 'zod'
import { createCompoundContext } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'

export interface AddressContextType {
  contractor?: Contractor
  contractorType?: ContractorType
  address?: ContractorAddress
  isPending: boolean
}

export type AddressDefaultValues = RequireAtLeastOne<
  Pick<ContractorAddress, 'street1' | 'street2' | 'city' | 'state' | 'zip'>
>

export const AddressFormSchema = z.object({
  street1: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
})

export type AddressFormValues = z.infer<typeof AddressFormSchema>

const [useAddress, AddressProvider] = createCompoundContext<AddressContextType>(
  'ContractorAddressContext',
)

export { useAddress, AddressProvider }
