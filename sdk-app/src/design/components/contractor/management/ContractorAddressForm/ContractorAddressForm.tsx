import type { Contractor } from '@gusto/embedded-api-v-2026-02-01/models/components/contractor'
import { AddressForm, type AddressFormValues } from '../../shared/AddressForm/AddressForm'
import { contractorName } from '../../shared/contractorName'
import { useBase } from '@/components/Base/useBase'
import { CONTRACTOR_TYPE } from '@/shared/constants'

interface ContractorAddressFormProps {
  contractor: Contractor
  isPending?: boolean
  onCancel?: () => void
  onSave?: (data: AddressFormValues) => void | Promise<void>
}

export function ContractorAddressForm({
  contractor,
  isPending,
  onCancel,
  onSave,
}: ContractorAddressFormProps) {
  const { baseSubmitHandler } = useBase()
  const isBusiness = contractor.type === CONTRACTOR_TYPE.BUSINESS

  const handleSubmit = async (data: AddressFormValues) => {
    await baseSubmitHandler(data, async payload => {
      await onSave?.(payload)
    })
  }

  return (
    <AddressForm
      heading="Edit address"
      description={`Update ${contractorName(contractor)}’s ${isBusiness ? 'business' : 'home'} address.`}
      defaultValues={{
        street1: contractor.address?.street1 ?? '',
        street2: contractor.address?.street2 ?? '',
        city: contractor.address?.city ?? '',
        state: contractor.address?.state ?? '',
        zip: contractor.address?.zip ?? '',
      }}
      isPending={isPending}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  )
}
