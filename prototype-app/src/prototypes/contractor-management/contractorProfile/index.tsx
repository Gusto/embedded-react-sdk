import { useState } from 'react'
import { contractorData } from '../contractorData'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function ContractorProfile() {
  const Components = useComponentContext()
  const contractor = contractorData[0]
  const [selectedTab, setSelectedTab] = useState('basic-details')

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
          {contractor.first_name} {contractor.last_name}
        </Components.Heading>
        <Components.Text variant="supporting">{contractor.start_date}</Components.Text>
      </Flex>
      <Components.Tabs onSelectionChange={setSelectedTab} tabs={tabs} selectedId={selectedTab} />
    </Flex>
  )
}
