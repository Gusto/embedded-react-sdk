import { useState } from 'react'
import type { ContractorPaymentForGroup } from '../types'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex, Grid, ActionsLayout } from '@/components/Common'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'

interface PaymentEditProps {
  contractor: ContractorPaymentForGroup
  onSave: (contractor: ContractorPaymentForGroup) => void
  onCancel: () => void
}

export const PaymentEdit = ({ contractor, onSave, onCancel }: PaymentEditProps) => {
  const { Button, Text, Heading, Card, NumberInput, RadioGroup } = useComponentContext()
  const { locale } = useLocale()

  const [editedContractor, setEditedContractor] = useState<ContractorPaymentForGroup>({
    ...contractor,
  })

  const handleFieldChange = (field: keyof ContractorPaymentForGroup, value: number | string) => {
    setEditedContractor((prev: ContractorPaymentForGroup) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    onSave(editedContractor)
  }

  const paymentMethodOptions = [
    { value: 'Check', label: 'Check' },
    { value: 'Direct Deposit', label: 'Direct deposit' },
    { value: 'Historical Payment', label: 'Historical payment' },
  ]

  return (
    <Card>
      <Flex flexDirection="column" gap={32}>
        <Flex flexDirection="column" gap={16}>
          <Heading as="h2">Edit contractor pay</Heading>
          <Text>
            Edit contractor&apos;s hours, additional earnings, and reimbursements. Inputs not
            applicable to this contractor are disabled. Please click &quot;OK&quot; to apply the
            change.
          </Text>
        </Flex>

        {editedContractor.wageType === 'Hourly' && (
          <Flex flexDirection="column" gap={16}>
            <Heading as="h3">Hours</Heading>
            <NumberInput
              name="hours"
              value={editedContractor.hours ? parseFloat(editedContractor.hours) : 0}
              onChange={(value: number) => {
                handleFieldChange('hours', value ? value.toString() : '0')
              }}
              isRequired
              label="Hours"
              adornmentEnd="hrs"
            />
          </Flex>
        )}

        {editedContractor.wageType === 'Fixed' && (
          <Flex flexDirection="column" gap={16}>
            <Heading as="h3">Fixed pay</Heading>
            <NumberInput
              name="wage"
              value={editedContractor.wage ? parseFloat(editedContractor.wage) : 0}
              onChange={(value: number) => {
                handleFieldChange('wage', value ? value.toString() : '0')
              }}
              isRequired
              label="Wage"
              format="currency"
            />
          </Flex>
        )}

        <Flex flexDirection="column" gap={16}>
          <Heading as="h3">Additional earnings</Heading>
          <Grid gridTemplateColumns={{ base: '1fr', small: [200, 200] }} gap={16}>
            <NumberInput
              name="bonus"
              value={editedContractor.bonus ? parseFloat(editedContractor.bonus) : 0}
              onChange={(value: number) => {
                handleFieldChange('bonus', value ? value.toString() : '0')
              }}
              label="Bonus"
              format="currency"
            />
            <NumberInput
              name="reimbursement"
              value={
                editedContractor.reimbursement ? parseFloat(editedContractor.reimbursement) : 0
              }
              onChange={(value: number) => {
                handleFieldChange('reimbursement', value ? value.toString() : '0')
              }}
              label="Reimbursement"
              format="currency"
            />
          </Grid>
        </Flex>

        <Flex flexDirection="column" gap={16}>
          <RadioGroup
            value={editedContractor.paymentMethod || 'Direct Deposit'}
            onChange={(value: string) => {
              handleFieldChange('paymentMethod', value)
            }}
            options={paymentMethodOptions}
            label="Payment Method"
          />
        </Flex>

        <Flex justifyContent="space-between" alignItems="center">
          <Text>
            <strong>
              Total pay:{' '}
              {formatNumberAsCurrency(
                contractor.wageTotal ? parseFloat(contractor.wageTotal) : 0,
                locale,
              )}
            </strong>
          </Text>
          <ActionsLayout>
            <Button onClick={onCancel} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary">
              OK
            </Button>
          </ActionsLayout>
        </Flex>
      </Flex>
    </Card>
  )
}
