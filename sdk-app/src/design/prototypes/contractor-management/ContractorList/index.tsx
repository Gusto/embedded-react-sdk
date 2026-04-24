import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useContractorsList } from '@gusto/embedded-api/react-query/contractorsList'
import type { EntityIds } from '../../../../useEntities'
import { SkeletonDataView } from './SkeletonDataView'
import { EmptyData, Flex } from '@/components/Common'
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

function contractorName(contractor: Contractor) {
  return contractor.type === CONTRACTOR_TYPE.BUSINESS
    ? contractor.businessName
    : firstLastName({
        first_name: contractor.firstName,
        last_name: contractor.lastName,
      })
}

function contractorMenu(actions: { label: string; onClick: () => void }[]) {
  return function ContractorMenu() {
    return <HamburgerMenu items={actions} triggerLabel="Actions" />
  }
}

function ActiveContractorsTable({
  contractors,
  isFetching,
}: {
  contractors: Contractor[]
  isFetching: boolean
}) {
  return (
    <SkeletonDataView
      label="Active contractors"
      data={contractors}
      isFetching={isFetching}
      columns={[
        {
          title: 'Name',
          render: contractor => contractorName(contractor),
          skeletonWidth: 120,
        },
        {
          title: 'Type',
          render: contractor => contractor.type ?? '–',
          skeletonWidth: 80,
        },
        {
          title: 'Rate',
          render: contractor => formatRate(contractor),
          skeletonWidth: 100,
        },
      ]}
      itemMenu={contractorMenu([
        { label: 'View details', onClick: () => {} },
        { label: 'Dismiss contractor', onClick: () => {} },
      ])}
      emptyState={() => <EmptyData title="No active contractors found." />}
    />
  )
}

function OnboardingContractorsTable({
  contractors,
  isFetching,
}: {
  contractors: Contractor[]
  isFetching: boolean
}) {
  return (
    <SkeletonDataView
      label="Onboarding contractors"
      data={contractors}
      isFetching={isFetching}
      columns={[
        {
          title: 'Name',
          render: contractor => contractorName(contractor),
          skeletonWidth: 120,
        },
        {
          title: 'Type',
          render: contractor => contractor.type ?? '–',
          skeletonWidth: 80,
        },
        {
          title: 'Onboarding status',
          render: contractor => (
            <ContractorOnboardingStatusBadge
              onboarded={contractor.onboarded}
              onboardingStatus={contractor.onboardingStatus}
            />
          ),
          skeletonWidth: 90,
        },
      ]}
      itemMenu={contractorMenu([{ label: 'View details', onClick: () => {} }])}
      emptyState={() => <EmptyData title="No contractors currently onboarding." />}
    />
  )
}

function DismissedContractorsTable({
  contractors,
  isFetching,
}: {
  contractors: Contractor[]
  isFetching: boolean
}) {
  return (
    <SkeletonDataView
      label="Dismissed contractors"
      data={contractors}
      isFetching={isFetching}
      columns={[
        {
          title: 'Name',
          render: contractor => contractorName(contractor),
          skeletonWidth: 120,
        },
        {
          title: 'Type',
          render: contractor => contractor.type ?? '–',
          skeletonWidth: 80,
        },
        {
          title: 'Dismissal date',
          render: contractor => contractor.dismissalDate ?? '–',
          skeletonWidth: 80,
        },
      ]}
      itemMenu={contractorMenu([{ label: 'View details', onClick: () => {} }])}
      emptyState={() => <EmptyData title="No dismissed contractors found." />}
    />
  )
}

function ContractorListContent() {
  const Components = useComponentContext()
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const companyId = entities.companyId
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

  const { data, isFetching } = useContractorsList(queryParams)
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
        return <ActiveContractorsTable contractors={contractors} isFetching={isFetching} />
      case 'onboarding':
        return <OnboardingContractorsTable contractors={contractors} isFetching={isFetching} />
      case 'dismissed':
        return <DismissedContractorsTable contractors={contractors} isFetching={isFetching} />
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
        {renderTable()}
      </Flex>
    </Flex>
  )
}

export default function ContractorList() {
  return <ContractorListContent />
}
