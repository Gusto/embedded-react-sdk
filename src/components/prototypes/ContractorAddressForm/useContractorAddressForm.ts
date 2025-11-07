import type { Contractor, ContractorType } from '@gusto/embedded-api/models/components/contractor'
import type { ContractorAddress } from '@gusto/embedded-api/models/components/contractoraddress'
import { z } from 'zod'
import type { PutV1ContractorsContractorUuidAddressResponse } from '@gusto/embedded-api/models/operations/putv1contractorscontractoruuidaddress'
import type {
  Street1FieldProps,
  Street2FieldProps,
  CityFieldProps,
  StateFieldProps,
  ZipFieldProps,
} from './ContractorAddressFormFields'
import { createCompoundContext } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'

// TODO:
// It's annoying to have to import so much from this file but we need it
// currently to avoid circular dependencies and to keep hot reloading. Look
// into a way to improve the ergnomics of the dev UX here.

export const ContractorAddressFormValidationError = {
  STREET1_REQUIRED: 'STREET1_REQUIRED',
  CITY_REQUIRED: 'CITY_REQUIRED',
  STATE_REQUIRED: 'STATE_REQUIRED',
  ZIP_REQUIRED: 'ZIP_REQUIRED',
} as const

export const ContractorAddressFormSchema = z.object({
  street1: z
    .string({ required_error: ContractorAddressFormValidationError.STREET1_REQUIRED })
    .min(1, ContractorAddressFormValidationError.STREET1_REQUIRED),
  street2: z.string().optional(),
  city: z
    .string({ required_error: ContractorAddressFormValidationError.CITY_REQUIRED })
    .min(1, ContractorAddressFormValidationError.CITY_REQUIRED),
  state: z
    .string({ required_error: ContractorAddressFormValidationError.STATE_REQUIRED })
    .min(1, ContractorAddressFormValidationError.STATE_REQUIRED),
  zip: z
    .string({ required_error: ContractorAddressFormValidationError.ZIP_REQUIRED })
    .min(1, ContractorAddressFormValidationError.ZIP_REQUIRED),
})

export type ContractorAddressFormValues = z.infer<typeof ContractorAddressFormSchema>

export type ContractorAddressFormDefaultValues = RequireAtLeastOne<
  Pick<ContractorAddress, 'street1' | 'street2' | 'city' | 'state' | 'zip'>
>

export interface ContractorAddressFormContextType {
  contractor?: Contractor
  contractorType?: ContractorType
  address?: ContractorAddress
  isUpdating: boolean
  onSubmit: () => Promise<{
    updatedContractorAddressResponse: PutV1ContractorsContractorUuidAddressResponse | undefined
  }>
  Fields: {
    Street1: React.ComponentType<Street1FieldProps>
    Street2: React.ComponentType<Street2FieldProps>
    City: React.ComponentType<CityFieldProps>
    State: React.ComponentType<StateFieldProps>
    Zip: React.ComponentType<ZipFieldProps>
  }
}

const [useContractorAddressForm, ContractorAddressFormPropsProvider] =
  createCompoundContext<ContractorAddressFormContextType>('ContractorAddressContext')

export { useContractorAddressForm, ContractorAddressFormPropsProvider }
