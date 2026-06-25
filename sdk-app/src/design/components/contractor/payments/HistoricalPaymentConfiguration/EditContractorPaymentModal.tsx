import { useId } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type { ContractorOption, HistoricalContractorPayment } from '../types'
import { ActionsLayout, Flex, Grid, NumberInputField } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface EditContractorPaymentModalProps {
  isOpen: boolean
  contractor: ContractorOption | null
  initialPayment: HistoricalContractorPayment | null
  onClose: () => void
  onSave: (payment: HistoricalContractorPayment) => void
}

interface EditFormValues {
  hours: number
  wage: number
  bonus: number
  reimbursement: number
}

function toFormValues(payment: HistoricalContractorPayment | null): EditFormValues {
  return {
    hours: Number(payment?.hours || '0'),
    wage: Number(payment?.wage || '0'),
    bonus: Number(payment?.bonus || '0'),
    reimbursement: Number(payment?.reimbursement || '0'),
  }
}

export function EditContractorPaymentModal({
  isOpen,
  contractor,
  initialPayment,
  onClose,
  onSave,
}: EditContractorPaymentModalProps) {
  const formId = useId()
  const Components = useComponentContext()

  const formMethods = useForm<EditFormValues>({
    values: toFormValues(initialPayment),
  })

  const wageType = contractor?.wageType ?? 'Fixed'
  const hourlyRate = Number(contractor?.hourlyRate || '0')

  const handleSubmit = (values: EditFormValues) => {
    if (!contractor) return
    onSave({
      contractorId: contractor.id,
      hours: wageType === 'Hourly' ? String(values.hours) : '0',
      wage: wageType === 'Fixed' ? String(values.wage) : '0',
      bonus: wageType === 'Hourly' ? String(values.bonus) : '0',
      reimbursement: String(values.reimbursement),
    })
    onClose()
  }

  return (
    <Components.Modal
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <ActionsLayout>
          <Components.Button variant="secondary" onClick={onClose}>
            Cancel
          </Components.Button>
          <Components.Button
            variant="primary"
            type="submit"
            form={formId}
            onClick={() => formMethods.handleSubmit(handleSubmit)}
          >
            Save
          </Components.Button>
        </ActionsLayout>
      }
    >
      <FormProvider {...formMethods}>
        <Form id={formId} onSubmit={formMethods.handleSubmit(handleSubmit)}>
          <Flex flexDirection="column" gap={32}>
            <Flex flexDirection="column" gap={4}>
              <Components.Heading as="h2">Edit contractor payment</Components.Heading>
              <Components.Text variant="supporting">
                Update {contractor?.name ?? 'this contractor'}&apos;s historical payment details.
              </Components.Text>
              <RunningTotal wageType={wageType} hourlyRate={hourlyRate} />
            </Flex>

            {wageType === 'Hourly' && (
              <Flex flexDirection="column" gap={16}>
                <Components.Heading as="h3">Hours worked</Components.Heading>
                <NumberInputField
                  min={0}
                  name="hours"
                  isRequired
                  label="Hours"
                  adornmentEnd="hrs"
                />
              </Flex>
            )}

            {wageType === 'Fixed' && (
              <Flex flexDirection="column" gap={16}>
                <Components.Heading as="h3">Fixed pay</Components.Heading>
                <NumberInputField min={0} name="wage" isRequired label="Wage" format="currency" />
              </Flex>
            )}

            <Flex flexDirection="column" gap={16}>
              <Components.Heading as="h3">Additional earnings</Components.Heading>
              <Grid gridTemplateColumns={{ base: '1fr', small: [200, 200] }} gap={16}>
                {wageType === 'Hourly' && (
                  <NumberInputField min={0} name="bonus" label="Bonus" format="currency" />
                )}
                <NumberInputField
                  min={0}
                  name="reimbursement"
                  label="Reimbursement"
                  format="currency"
                />
              </Grid>
            </Flex>
          </Flex>
        </Form>
      </FormProvider>
    </Components.Modal>
  )
}

function RunningTotal({
  wageType,
  hourlyRate,
}: {
  wageType: 'Hourly' | 'Fixed'
  hourlyRate: number
}) {
  const Components = useComponentContext()
  const { hours, wage, bonus, reimbursement } = useWatch<EditFormValues>() as EditFormValues
  const total =
    (wageType === 'Fixed' ? wage : hours * hourlyRate) +
    (wageType === 'Hourly' ? bonus : 0) +
    reimbursement
  return <Components.Text weight="bold">Total pay: {formatCurrency(total)}</Components.Text>
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}
