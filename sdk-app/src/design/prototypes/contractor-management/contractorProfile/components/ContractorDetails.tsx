import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function ContractorDetails({
  contractor,
  onEdit,
}: {
  contractor: Contractor
  onEdit?: () => void
}) {
  const Components = useComponentContext()

  return (
    <Components.Box
      header={
        <Flex justifyContent="space-between" alignItems="center" gap={4}>
          <Components.Heading as="h3" styledAs="h4">
            Basic details
          </Components.Heading>
          <Components.Button variant="secondary" onClick={onEdit}>
            Edit
          </Components.Button>
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
  )
}
