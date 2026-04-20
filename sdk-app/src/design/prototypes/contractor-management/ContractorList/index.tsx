import { Suspense, useState } from 'react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import { ContractorOnboardingStatusBadge } from '@/components/Common/OnboardingStatusBadge'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { CONTRACTOR_TYPE } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'

function formatRate(contractor: Contractor) {
  if (contractor.wageType === 'Hourly' && contractor.hourlyRate) {
    return `Hourly — $${contractor.hourlyRate}/hr`
  }
  return contractor.wageType ?? '–'
}

function ActiveContractorsTable({ contractors }: { contractors: Contractor[] }) {
  const dataViewProps = useDataView<Contractor>({
    data: contractors,
    columns: [
      {
        title: 'Name',
        render: contractor => contractorName(contractor),
      },
      {
        title: 'Type',
        render: contractor => contractor.type ?? '–',
      },
      {
        title: 'Rate',
        render: contractor => formatRate(contractor),
      },
    ],
    itemMenu: () => (
      <HamburgerMenu
        items={[
          {
            label: 'View details',
            onClick: () => {},
          },
          {
            label: 'Dismiss contractor',
            onClick: () => {},
          },
        ]}
        triggerLabel="Actions"
      />
    ),
    emptyState: () => <EmptyData title="No active contractors found." />,
  })

  return <DataView label="Active contractors" {...dataViewProps} />
}

function contractorName(contractor: Contractor) {
  return contractor.type === CONTRACTOR_TYPE.BUSINESS
    ? contractor.businessName
    : firstLastName({
        first_name: contractor.firstName,
        last_name: contractor.lastName,
      })
}

function OnboardingContractorsTable({ contractors }: { contractors: Contractor[] }) {
  const dataViewProps = useDataView<Contractor>({
    data: contractors,
    columns: [
      {
        title: 'Name',
        render: contractor => contractorName(contractor),
      },
      {
        title: 'Type',
        render: contractor => contractor.type ?? '–',
      },
      {
        title: 'Onboarding status',
        render: contractor => (
          <ContractorOnboardingStatusBadge
            onboarded={contractor.onboarded}
            onboardingStatus={contractor.onboardingStatus}
          />
        ),
      },
    ],
    itemMenu: () => (
      <HamburgerMenu
        items={[
          {
            label: 'View details',
            onClick: () => {},
          },
        ]}
        triggerLabel="Actions"
      />
    ),
    emptyState: () => <EmptyData title="No contractors currently onboarding." />,
  })

  return <DataView label="Onboarding contractors" {...dataViewProps} />
}

function DismissedContractorsTable({ contractors }: { contractors: Contractor[] }) {
  const dataViewProps = useDataView<Contractor>({
    data: contractors,
    columns: [
      {
        title: 'Name',
        render: contractor => contractorName(contractor),
      },
      {
        title: 'Type',
        render: contractor => contractor.type ?? '–',
      },
      {
        title: 'Dismissal date',
        render: contractor => contractor.dismissalDate ?? '–',
      },
    ],
    itemMenu: () => (
      <HamburgerMenu
        items={[
          {
            label: 'View details',
            onClick: () => {},
          },
        ]}
        triggerLabel="Actions"
      />
    ),
    emptyState: () => <EmptyData title="No dismissed contractors found." />,
  })

  return <DataView label="Dismissed contractors" {...dataViewProps} />
}

function ContractorListContent() {
  const Components = useComponentContext()
  const companyId = String(import.meta.env.VITE_COMPANY_ID || '')
  const [selectedTab, setSelectedTab] = useState('active')

  const { data: activeData } = useContractorsListSuspense({
    companyUuid: companyId,
    onboardedActive: true,
  })

  const { data: onboardingData } = useContractorsListSuspense({
    companyUuid: companyId,
    onboardedActive: false,
  })

  const { data: dismissedData } = useContractorsListSuspense({
    companyUuid: companyId,
    terminatedToday: true,
  })

  const totalContractors =
    (activeData.contractors?.length ?? 0) +
    (onboardingData.contractors?.length ?? 0) +
    (dismissedData.contractors?.length ?? 0)

  const tabs = [
    {
      id: 'active',
      label: 'Active',
      content: <ActiveContractorsTable contractors={activeData.contractors ?? []} />,
    },
    {
      id: 'onboarding',
      label: 'Onboarding',
      content: <OnboardingContractorsTable contractors={onboardingData.contractors ?? []} />,
    },
    {
      id: 'dismissed',
      label: 'Dismissed',
      content: <DismissedContractorsTable contractors={dismissedData.contractors ?? []} />,
    },
  ]

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex justifyContent="space-between" alignItems="center">
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h1" styledAs="h2">
            Contractors
          </Components.Heading>
          <Components.Text variant="supporting">{totalContractors} contractors</Components.Text>
        </Flex>

        <Components.Button variant="primary" onClick={() => {}}>
          Add contractor
        </Components.Button>
      </Flex>
      <Components.Tabs onSelectionChange={setSelectedTab} tabs={tabs} selectedId={selectedTab} />
    </Flex>
  )
}

export default function ContractorList() {
  const Components = useComponentContext()

  return (
    <Suspense fallback={<Components.Text>Loading contractors...</Components.Text>}>
      <ContractorListContent />
    </Suspense>
  )
}
