import { ContractorOnboardingStatus1 } from '@gusto/embedded-api/models/components/contractor'
import { ContractorList } from './'

export default {
  title: 'Domain/ContractorList',
}

export function ContractorListWithoutExisting() {
  return <ContractorList contractors={[]} totalCount={0} />
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
      totalCount={99}
    />
  )
}
