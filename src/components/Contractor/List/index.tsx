import { type Contractor } from '@gusto/embedded-api/models/components/contractor'
import { DataView, useDataView } from '@/components/Common'
import { firstLastName } from '@/helpers/formattedStrings'
import { Badge } from '@/components/Common/UI/Badge/Badge'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import PencilSvg from '@/assets/icons/pencil.svg?react'

export type ContractorListDisplay = Pick<Contractor, 'onboardingStatus' | 'firstName' | 'lastName'>

export function ContractorList() {
  const dataViewProps = useDataView<ContractorListDisplay>({
    columns: [
      {
        title: 'Name',
        render: contractor =>
          firstLastName({ first_name: contractor.firstName, last_name: contractor.lastName }),
      },
      {
        title: 'Status',
        render: contractor => <Badge>{contractor.onboardingStatus}</Badge>,
      },
    ],
    data: [
      {
        firstName: 'Sean',
        lastName: 'Scally',
        onboardingStatus: 'admin_onboarding_review',
      },
    ],
    itemMenu: () => (
      <HamburgerMenu
        items={[{ label: 'Edit', icon: <PencilSvg aria-hidden />, onClick: () => {} }]}
        triggerLabel={'Edit'}
        isLoading={false}
      />
    ),
  })

  return (
    <>
      <DataView label="Contractor List" {...dataViewProps} />
    </>
  )
}
