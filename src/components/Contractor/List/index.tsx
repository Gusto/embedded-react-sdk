import {
  ContractorOnboardingStatus1 as OnboardingStatus,
  type Contractor,
} from '@gusto/embedded-api/models/components/contractor'
import { DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { firstLastName } from '@/helpers/formattedStrings'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type ContractorListDisplay = Pick<Contractor, 'onboardingStatus' | 'firstName' | 'lastName'>

export interface HeadProps {
  count: number
  onAdd: () => void
}
export function Head({ count, onAdd }: HeadProps) {
  const { Badge, Button, Heading } = useComponentContext()

  return (
    <Flex>
      <Heading as="h2">Contractors</Heading>
      <Badge>{count}</Badge>
      <Button variant="secondary" onClick={onAdd}>
        Add another contractor
      </Button>
    </Flex>
  )
}

export interface EmptyDataContractorsListProps {
  onAdd: () => void
}
export function EmptyDataContractorsList({ onAdd }: EmptyDataContractorsListProps) {
  const { Button } = useComponentContext()

  return (
    <EmptyData>
      {`You haven't added any contractors yet`}
      Add contractors to get them setup for payroll.
      <Button onClick={onAdd}>Add a contractor</Button>
    </EmptyData>
  )
}

export function ContractorList() {
  const { Badge } = useComponentContext()
  const contractors = [
    {
      firstName: 'Sean',
      lastName: 'Scally',
      onboardingStatus: OnboardingStatus.AdminOnboardingReview,
    },
  ]

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
    data: contractors,
    itemMenu: () => (
      <HamburgerMenu
        items={[{ label: 'Edit', icon: <PencilSvg aria-hidden />, onClick: () => {} }]}
        triggerLabel={'Edit'}
        isLoading={false}
      />
    ),
    emptyState: () => <EmptyDataContractorsList onAdd={() => {}} />,
  })

  return (
    <>
      <Head count={contractors.length} onAdd={() => {}} />
      <DataView label="Contractor List" {...dataViewProps} />
    </>
  )
}
