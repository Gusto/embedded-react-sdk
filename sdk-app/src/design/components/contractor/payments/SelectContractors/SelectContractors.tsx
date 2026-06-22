import type { ContractorOption } from '../types'
import { ActionsLayout, EmptyData, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface SelectContractorsProps {
  contractors: ContractorOption[]
  paidDate: string
  selectedContractorIds: string[]
  onPaidDateChange: (date: string) => void
  onToggleContractor: (contractorId: string) => void
  onContinue: () => void
  onCancel?: () => void
}

export function SelectContractors({
  contractors,
  paidDate,
  selectedContractorIds,
  onPaidDateChange,
  onToggleContractor,
  onContinue,
  onCancel,
}: SelectContractorsProps) {
  const Components = useComponentContext()

  const canContinue = Boolean(paidDate) && selectedContractorIds.length > 0
  const today = new Date().toISOString().slice(0, 10)

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h2">Record a historical payment</Components.Heading>
        <Components.Text variant="supporting">
          Log a contractor payment that already happened outside Gusto. Pick a paid date and the
          contractors you paid.
        </Components.Text>
      </Flex>

      <div style={{ maxWidth: 280 }}>
        <Components.TextInput
          type="date"
          label="Paid date"
          isRequired
          value={paidDate}
          onChange={onPaidDateChange}
          max={today}
        />
      </div>

      <Flex flexDirection="column" gap={16}>
        <Components.Heading as="h3">Contractors</Components.Heading>
        {contractors.length === 0 ? (
          <EmptyData
            title="No active contractors"
            description="Activate at least one contractor before recording a historical payment."
          />
        ) : (
          <Flex flexDirection="column" gap={12}>
            {contractors.map(contractor => {
              const isSelected = selectedContractorIds.includes(contractor.id)
              const wageLabel =
                contractor.wageType === 'Hourly' && contractor.hourlyRate
                  ? `Hourly · $${contractor.hourlyRate}/hr`
                  : contractor.wageType
              return (
                <Flex
                  key={contractor.id}
                  flexDirection="row"
                  gap={12}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Components.Checkbox
                    label={contractor.name}
                    value={isSelected}
                    onChange={() => { onToggleContractor(contractor.id); }}
                  />
                  <Components.Text variant="supporting">{wageLabel}</Components.Text>
                </Flex>
              )
            })}
          </Flex>
        )}
      </Flex>

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
