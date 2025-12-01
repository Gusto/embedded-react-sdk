import { useWatch } from 'react-hook-form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex, Grid, ActionsLayout, NumberInputField, RadioGroupField } from '@/components/Common'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'

interface PaymentEditProps {
  onSave: () => void
  onCancel: () => void
}

export const PaymentEdit = ({ onSave, onCancel }: PaymentEditProps) => {
  const { Button, Text, Heading, Card } = useComponentContext()
  const { locale } = useLocale()

  const wageType = useWatch({ name: 'wageType' })
  const wageTotal = useWatch({ name: 'wageTotal' })

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

        {wageType === 'Hourly' && (
          <Flex flexDirection="column" gap={16}>
            <Heading as="h3">Hours</Heading>
            <NumberInputField name="hours" isRequired label="Hours" adornmentEnd="hrs" />
          </Flex>
        )}

        {wageType === 'Fixed' && (
          <Flex flexDirection="column" gap={16}>
            <Heading as="h3">Fixed pay</Heading>
            <NumberInputField name="wage" isRequired label="Wage" format="currency" />
          </Flex>
        )}

        <Flex flexDirection="column" gap={16}>
          <Heading as="h3">Additional earnings</Heading>
          <Grid gridTemplateColumns={{ base: '1fr', small: [200, 200] }} gap={16}>
            <NumberInputField name="bonus" label="Bonus" format="currency" />
            <NumberInputField name="reimbursement" label="Reimbursement" format="currency" />
          </Grid>
        </Flex>

        <Flex flexDirection="column" gap={16}>
          <RadioGroupField
            name="paymentMethod"
            options={paymentMethodOptions}
            label="Payment Method"
          />
        </Flex>

        <Flex justifyContent="space-between" alignItems="center">
          <Text>
            <strong>
              Total pay: {formatNumberAsCurrency(parseFloat(wageTotal || '0'), locale)}
            </strong>
          </Text>
          <ActionsLayout>
            <Button onClick={onCancel} variant="secondary">
              Cancel
            </Button>
            <Button onClick={onSave} variant="primary">
              OK
            </Button>
          </ActionsLayout>
        </Flex>
      </Flex>
    </Card>
  )
}
