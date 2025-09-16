import { useState } from 'react'
import type { ContractorDataStrict } from '../types'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex, Grid, ActionsLayout } from '@/components/Common'

type ContractorData = ContractorDataStrict

interface ContractorPaymentEditModalProps {
  contractor: ContractorData
  onSave: (contractor: ContractorData) => void
  onCancel: () => void
}

export const ContractorPaymentEditModal = ({
  contractor,
  onSave,
  onCancel,
}: ContractorPaymentEditModalProps) => {
  const { Button, Text, Heading, Card, RadioGroup, NumberInput } = useComponentContext()

  const [editedContractor, setEditedContractor] = useState<ContractorData>({
    ...contractor,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const calculateTotal = () => {
    const wageAmount =
      editedContractor.wageType === 'Hourly'
        ? editedContractor.hours * (editedContractor.hourlyRate || 0)
        : editedContractor.wage
    return wageAmount + editedContractor.bonus + editedContractor.reimbursement
  }

  const handleFieldChange = (field: keyof ContractorData, value: number | string) => {
    setEditedContractor(prev => ({
      ...prev,
      [field]: value,
      total: calculateTotal(),
    }))
  }

  const handleSave = () => {
    onSave({
      ...editedContractor,
      total: calculateTotal(),
    })
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
          <Heading as="h2">Edit {contractor.name}&apos;s pay</Heading>
          <Text>
            Edit contractor&apos;s hours, additional earnings, and reimbursements. Inputs not
            applicable to this contractor are disabled. Please click &quot;OK&quot; to apply the
            change.
          </Text>
        </Flex>

        {/* Hours Section - Only show for Hourly wage type */}
        {editedContractor.wageType === 'Hourly' && (
          <Flex flexDirection="column" gap={16}>
            <Heading as="h3">Hours</Heading>
            <NumberInput
              name="hours"
              value={editedContractor.hours}
              onChange={(value: number) => {
                handleFieldChange('hours', value || 0)
              }}
              isRequired
              label="Hours"
              adornmentEnd="hrs"
            />
          </Flex>
        )}

        {/* Fixed Pay Section - Only show for Fixed wage type */}
        {editedContractor.wageType === 'Fixed' && (
          <Flex flexDirection="column" gap={16}>
            <Heading as="h3">Fixed pay</Heading>
            <NumberInput
              name="wage"
              value={editedContractor.wage}
              onChange={(value: number) => {
                handleFieldChange('wage', value || 0)
              }}
              isRequired
              label="Wage"
              format="currency"
            />
          </Flex>
        )}

        {/* Additional Earnings Section */}
        <Flex flexDirection="column" gap={16}>
          <Heading as="h3">Additional earnings</Heading>
          <Grid gridTemplateColumns={{ base: '1fr', small: [200, 200] }} gap={16}>
            <NumberInput
              name="bonus"
              value={editedContractor.bonus}
              onChange={(value: number) => {
                handleFieldChange('bonus', value || 0)
              }}
              label="Bonus"
              format="currency"
            />
            <NumberInput
              name="reimbursement"
              value={editedContractor.reimbursement}
              onChange={(value: number) => {
                handleFieldChange('reimbursement', value || 0)
              }}
              label="Reimbursement"
              format="currency"
            />
          </Grid>
        </Flex>

        {/* Payment Method Section */}
        <Flex flexDirection="column" gap={16}>
          <RadioGroup
            value={editedContractor.paymentMethod}
            onChange={value => {
              handleFieldChange('paymentMethod', value)
            }}
            options={paymentMethodOptions}
            label="Payment Method"
          />
        </Flex>

        <Flex justifyContent="space-between" alignItems="center">
          <Text>
            <strong>Total pay: {formatCurrency(calculateTotal())}</strong>
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
