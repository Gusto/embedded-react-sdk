import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { CONTRACTOR_TYPE } from '@/shared/constants'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const sameYear = date.getFullYear() === now.getFullYear()
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const day = date.getDate()
  return sameYear ? `${month} ${day}` : `${month} ${day}, ${date.getFullYear()}`
}

export function ContractorDetails({
  contractor,
  onEdit,
}: {
  contractor: Contractor
  onEdit?: () => void
}) {
  const Components = useComponentContext()
  const isBusiness = contractor.type === CONTRACTOR_TYPE.BUSINESS

  const items = isBusiness
    ? [
        {
          term: <Components.Text weight="medium">Business name</Components.Text>,
          description: <Components.Text>{contractor.businessName || '–'}</Components.Text>,
        },
        {
          term: <Components.Text weight="medium">EIN</Components.Text>,
          description: <Components.Text>{contractor.hasEin ? 'XX-XXXXXXX' : '–'}</Components.Text>,
        },
        {
          term: <Components.Text weight="medium">Start date</Components.Text>,
          description: (
            <Components.Text>
              {contractor.startDate ? formatDate(contractor.startDate) : '–'}
            </Components.Text>
          ),
        },
        {
          term: <Components.Text weight="medium">Email address</Components.Text>,
          description: <Components.Text>{contractor.email || '–'}</Components.Text>,
        },
      ]
    : [
        {
          term: <Components.Text weight="medium">Legal name</Components.Text>,
          description: (
            <Components.Text>
              {[contractor.firstName, contractor.middleInitial, contractor.lastName]
                .filter(Boolean)
                .join(' ')}
            </Components.Text>
          ),
        },
        {
          term: <Components.Text weight="medium">Start date</Components.Text>,
          description: (
            <Components.Text>
              {contractor.startDate ? formatDate(contractor.startDate) : '–'}
            </Components.Text>
          ),
        },
        {
          term: <Components.Text weight="medium">Social security number</Components.Text>,
          description: <Components.Text>{contractor.hasSsn ? 'XXX-XX-XXXX' : '–'}</Components.Text>,
        },
        {
          term: <Components.Text weight="medium">Email address</Components.Text>,
          description: <Components.Text>{contractor.email || '–'}</Components.Text>,
        },
      ]

  return (
    <Components.Box
      header={
        <Flex justifyContent="space-between" alignItems="center" gap={4}>
          <Components.Heading as="h3" styledAs="h4">
            Basic details
          </Components.Heading>
          {onEdit && (
            <Components.Button variant="secondary" onClick={onEdit}>
              Edit
            </Components.Button>
          )}
        </Flex>
      }
    >
      <Components.DescriptionList items={items} />
    </Components.Box>
  )
}
