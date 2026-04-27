import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function ContractorPay({
  contractor,
  onEdit,
}: {
  contractor: Contractor
  onEdit?: () => void
}) {
  const Components = useComponentContext()

  const items = [
    {
      term: <Components.Text weight="medium">Type</Components.Text>,
      description: <Components.Text>{contractor.wageType ?? '–'}</Components.Text>,
    },
    ...(contractor.wageType === 'Hourly'
      ? [
          {
            term: <Components.Text weight="medium">Wage</Components.Text>,
            description: <Components.Text>${contractor.hourlyRate}/hr</Components.Text>,
          },
        ]
      : []),
  ]

  return (
    <Components.Box
      header={
        <Flex justifyContent="space-between" alignItems="center" gap={4}>
          <Components.Heading as="h3" styledAs="h4">
            Compensation
          </Components.Heading>
          <Components.Button variant="secondary" onClick={onEdit}>
            Edit
          </Components.Button>
        </Flex>
      }
    >
      <Components.DescriptionList items={items} />
    </Components.Box>
  )
}
