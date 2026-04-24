import { useMemo, useState } from 'react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useContractorsList } from '@gusto/embedded-api/react-query/contractorsList'
import { DataView, EmptyData, Flex, Loading, useDataView } from '@/components/Common'
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
  const Components = useComponentContext()
  const dataViewProps = useDataView<Contractor>({
    data: contractors,
    columns: [
      {
        title: 'Name',
        render: contractor => <Components.Text>{contractorName(contractor)}</Components.Text>,
      },
      {
        title: 'Type',
        render: contractor => <Components.Text>{contractor.type ?? '–'}</Components.Text>,
      },
      {
        title: 'Rate',
        render: contractor => <Components.Text>{formatRate(contractor)}</Components.Text>,
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

  const queryParams = useMemo(() => {
    switch (selectedTab) {
      case 'active':
        return { companyUuid: companyId, onboardedActive: true }
      case 'onboarding':
        return { companyUuid: companyId, onboardedActive: false }
      case 'dismissed':
        return { companyUuid: companyId, terminatedToday: true }
      default:
        return { companyUuid: companyId, onboardedActive: true }
    }
  }, [companyId, selectedTab])

  const { data, isPending } = useContractorsList(queryParams)
  const contractors = data?.contractors ?? []

  const tabs = [
    {
      id: 'active',
      label: 'Active',
      content: null,
    },
    {
      id: 'onboarding',
      label: 'Onboarding',
      content: null,
    },
    {
      id: 'dismissed',
      label: 'Dismissed',
      content: null,
    },
  ]

  const renderTable = () => {
    switch (selectedTab) {
      case 'active':
        return <ActiveContractorsTable contractors={contractors} />
      case 'onboarding':
        return <OnboardingContractorsTable contractors={contractors} />
      case 'dismissed':
        return <DismissedContractorsTable contractors={contractors} />
    }
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex justifyContent="space-between" alignItems="center">
        <Components.Heading as="h1" styledAs="h2">
          Contractors
        </Components.Heading>
        <Components.Button variant="primary" onClick={() => {}}>
          Add contractor
        </Components.Button>
      </Flex>
      <Flex flexDirection="column" gap={0}>
        <Components.Tabs onSelectionChange={setSelectedTab} tabs={tabs} selectedId={selectedTab} />
        {isPending ? <Loading /> : renderTable()}
      </Flex>
    </Flex>
  )
}

export default function ContractorList() {
  return <ContractorListContent />
}
