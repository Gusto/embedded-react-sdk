import type { Contractor } from '@gusto/embedded-api-v-2026-02-01/models/components/contractor'
import {
  ProfileDetailsForm,
  type ProfileDetailsFormValues,
} from '../../shared/ProfileDetailsForm/ProfileDetailsForm'
import { contractorName } from '../../shared/contractorName'
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
      description={`Update ${contractorName(contractor)}’s ${isBusiness ? 'business' : 'personal'} information.`}
      isPending={isPending}
      showStartDate
      showEmail
      onCancel={onCancel}
      onSubmit={handleSubmit}
    />
  )
}
