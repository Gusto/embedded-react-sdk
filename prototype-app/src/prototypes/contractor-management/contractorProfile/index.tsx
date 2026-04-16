import { Suspense, useState } from 'react'
import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

function ContractorProfileContent() {
  const Components = useComponentContext()
  const companyId = String(import.meta.env.VITE_COMPANY_ID || '')

  const { data } = useContractorsListSuspense({ companyUuid: companyId })
  const contractor = data.contractors?.[0]

  const [selectedTab, setSelectedTab] = useState('basic-details')

  if (!contractor) {
    return <Components.Text>No contractors found for this company.</Components.Text>
  }

  const tabs = [
    {
      id: 'basic-details',
      label: `Details`,
      content: (
        <Flex flexDirection="column" gap={24}>
          <Components.Box
            header={
              <Flex justifyContent="space-between" alignItems="center" gap={4}>
                <Components.Heading as="h3" styledAs="h4">
                  Basic details
                </Components.Heading>
                <Components.Button variant="secondary">Edit</Components.Button>
              </Flex>
            }
          >
            Content
          </Components.Box>
          <Flex flexDirection="column" gap={32}>
            <Components.Box
              header={
                <Flex flexDirection="column" gap={4}>
                  <Components.Heading as="h3" styledAs="h4">
                    Address
                  </Components.Heading>
                </Flex>
              }
            >
              Content
            </Components.Box>
          </Flex>
        </Flex>
      ),
    },
    {
      id: 'not-profile',
      label: `Not Profile`,
      content: (
        <Flex flexDirection="column" gap={32}>
          gwegwwegw
        </Flex>
      ),
    },
  ]
  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h1" styledAs="h2">
          {contractor.firstName} {contractor.lastName}
        </Components.Heading>
        <Components.Text variant="supporting">{contractor.startDate}</Components.Text>
      </Flex>
      <Components.Tabs onSelectionChange={setSelectedTab} tabs={tabs} selectedId={selectedTab} />
    </Flex>
  )
}

export function ContractorProfile() {
  const Components = useComponentContext()

  return (
    <Suspense fallback={<Components.Text>Loading contractor...</Components.Text>}>
      <ContractorProfileContent />
    </Suspense>
  )
}
