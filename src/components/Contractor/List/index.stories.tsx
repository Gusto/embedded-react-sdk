import { action } from '@ladle/react'
import { ContractorOnboardingStatus1 } from '@gusto/embedded-api/models/components/contractor'
import { ContractorList } from './'

export default {
  title: 'Domain/Contractor/List',
}

export function ContractorListWithoutExisting() {
  return (
    <ContractorList
      contractors={[]}
      handleAdd={action('add')}
      handleEdit={action('edit')}
      totalCount={0}
    />
  )
}

export function ContractorListWithExisting() {
  return (
    <ContractorList
      contractors={[
        {
          firstName: 'Sean',
          lastName: 'Demo',
          onboardingStatus: ContractorOnboardingStatus1.AdminOnboardingReview,
        },
      ]}
      handleAdd={action('add')}
      handleEdit={action('edit')}
      totalCount={99}
    />
  )
}
