import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function ContractorAddress({ contractor }: { contractor: Contractor }) {
  const Components = useComponentContext()

  return (
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
  )
}
