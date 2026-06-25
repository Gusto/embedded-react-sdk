import type { ContractorOption } from '../types'
import { ActionsLayout, DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

function parseIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null
  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface SelectContractorsProps {
  contractors: ContractorOption[]
  paidDate: string
  selectedContractorIds: string[]
  onPaidDateChange: (date: string) => void
  onToggleContractor: (contractorId: string) => void
  onSelectAllContractors: (checked: boolean, visibleContractors: ContractorOption[]) => void
  onContinue: () => void
  onCancel?: () => void
}

export function SelectContractors({
  contractors,
  paidDate,
  selectedContractorIds,
  onPaidDateChange,
  onToggleContractor,
  onSelectAllContractors,
  onContinue,
  onCancel,
}: SelectContractorsProps) {
  const Components = useComponentContext()

  const canContinue = Boolean(paidDate) && selectedContractorIds.length > 0
  const today = new Date()
  const paidDateValue = paidDate ? parseIsoDate(paidDate) : null

  const dataViewProps = useDataView<ContractorOption>({
    data: contractors,
    columns: [
      {
        key: 'name',
        title: 'Contractor',
        render: contractor => (
          <>
            {contractor.name}
            <Components.Text variant="supporting" size="sm">
              {contractor.type}
            </Components.Text>
          </>
        ),
      },
      {
        key: 'wage',
        title: 'Wage',
        render: contractor =>
          contractor.wageType === 'Hourly' && contractor.hourlyRate
            ? `Hourly · $${contractor.hourlyRate}/hr`
            : contractor.wageType,
      },
    ],
    selectionMode: 'multiple',
    onSelect: (contractor, _checked) => {
      onToggleContractor(contractor.id)
    },
    onSelectAll: onSelectAllContractors,
    getIsItemSelected: contractor => selectedContractorIds.includes(contractor.id),
    emptyState: () => (
      <EmptyData
        title="No active contractors"
        description="Activate at least one contractor before recording a historical payment."
      />
    ),
  })

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h2">Record a historical payment</Components.Heading>
        <Components.Text variant="supporting">
          Log a contractor payment that already happened outside Gusto. Pick a paid date and the
          contractors you paid.
        </Components.Text>
      </Flex>

      <Components.DatePicker
        label="Payment date"
        isRequired
        value={paidDateValue}
        onChange={date => {
          onPaidDateChange(date ? toIsoDate(date) : '')
        }}
        maxDate={today}
      />

      <DataView label="Select contractors" {...dataViewProps} />

      <ActionsLayout>
        {onCancel && (
          <Components.Button variant="secondary" onClick={onCancel}>
            Cancel
          </Components.Button>
        )}
        <Components.Button onClick={onContinue} isDisabled={!canContinue}>
          Continue
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
