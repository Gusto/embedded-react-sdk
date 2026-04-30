import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { ProfileDetailsForm, type ProfileDetailsFormValues } from '../../common/ProfileDetailsForm'
import { useBase } from '@/components/Base/useBase'
import { CONTRACTOR_TYPE } from '@/shared/constants'

interface ContractorDetailsFormProps {
  contractor: Contractor
  isPending?: boolean
  onCancel?: () => void
  onSave?: (data: ProfileDetailsFormValues) => void | Promise<void>
}

export function ContractorDetailsForm({
  contractor,
  isPending,
  onCancel,
  onSave,
}: ContractorDetailsFormProps) {
  const { baseSubmitHandler } = useBase()
  const isBusiness = contractor.type === CONTRACTOR_TYPE.BUSINESS

  const handleSubmit = async (data: ProfileDetailsFormValues) => {
    await baseSubmitHandler(data, async payload => {
      await onSave?.(payload)
    })
  }

  return (
    <ProfileDetailsForm
      contractor={contractor}
      heading="Edit basic details"
      description={
        isBusiness
          ? 'Update the contractor\u2019s business information.'
          : 'Update the contractor\u2019s personal information.'
      }
      isPending={isPending}
      showStartDate
      showEmail
      onCancel={onCancel}
      onSubmit={handleSubmit}
    />
  )
}
