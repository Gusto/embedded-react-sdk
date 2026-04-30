import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { AddressForm, type AddressFormValues } from '../../common/AddressForm'
import { useBase } from '@/components/Base/useBase'

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

  const handleSubmit = async (data: AddressFormValues) => {
    await baseSubmitHandler(data, async payload => {
      await onSave?.(payload)
    })
  }

  return (
    <AddressForm
      heading="Edit address"
      description="Update the contractor\u2019s home address."
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
