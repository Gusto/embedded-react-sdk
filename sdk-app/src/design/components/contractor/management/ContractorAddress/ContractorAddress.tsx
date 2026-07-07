import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface ContractorAddressProps {
  contractor: Contractor
  onEdit?: () => void
}

export function ContractorAddress({ contractor, onEdit }: ContractorAddressProps) {
  const Components = useComponentContext()

  return (
    <Components.Box
      header={
        <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
          <Components.Heading as="h3" styledAs="h4">
            Address
          </Components.Heading>
          {onEdit && (
            <Components.Button variant="secondary" onClick={onEdit}>
              Edit
            </Components.Button>
          )}
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
