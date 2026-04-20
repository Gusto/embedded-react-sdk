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
            <Components.DescriptionList
              items={[
                {
                  term: <Components.Text weight="medium">Legal name</Components.Text>,
                  description: (
                    <Components.Text>
                      {contractor.firstName} {contractor.lastName}
                    </Components.Text>
                  ),
                },
                {
                  term: <Components.Text weight="medium">Start date</Components.Text>,
                  description: <Components.Text>{contractor.startDate}</Components.Text>,
                },
                {
                  term: <Components.Text weight="medium">Social security number</Components.Text>,
                  description: (
                    <Components.Text>{contractor.hasSsn ? 'XXX-XX-XXXX' : '–'}</Components.Text>
                  ),
                },
                {
                  term: <Components.Text weight="medium">Email address</Components.Text>,
                  description: <Components.Text>{contractor.email}</Components.Text>,
                },
              ]}
            />
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
              {contractor.address ? (
                <Flex flexDirection="column" gap={0}>
                  <Components.Text weight="medium">{contractor.address.street1}</Components.Text>
                  {contractor.address.street2 && (
                    <Components.Text>{contractor.address.street2}</Components.Text>
                  )}
                  <Components.Text>
                    {contractor.address.city}, {contractor.address.state} {contractor.address.zip}
                  </Components.Text>
                </Flex>
              ) : (
                <Components.Text>–</Components.Text>
              )}
            </Components.Box>
          </Flex>
        </Flex>
      ),
    },
    {
      id: 'pay',
      label: `Pay`,
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
        <Components.Text variant="supporting">Contractor</Components.Text>
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
