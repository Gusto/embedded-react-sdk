import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { PayClassification, Shift } from './types'
import { formatDayWithWeekday, formatHours, formatTimeZoneAbbreviation } from './formatters'
import {
  NO_RULE,
  calculateWorkedHours,
  shiftFormSchema,
  toShiftFormValues,
  type ShiftFormValues,
} from './shiftForm'
import {
  ActionsLayout,
  Flex,
  Grid,
  NumberInputField,
  SelectField,
  TextInputField,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const CLASSIFIED_OPTIONS: Array<{ value: PayClassification; label: string }> = [
  { value: 'Regular', label: 'Regular' },
  { value: 'Overtime', label: 'Overtime' },
  { value: 'Double overtime', label: 'Double overtime' },
]

export interface ShiftEditFormProps {
  shift: Shift
  employeeName: string
  serverErrors?: string[]
  isSubmitting?: boolean
  onSubmit: (values: ShiftFormValues) => void
  onCancel: () => void
}

export function ShiftEditForm({
  shift,
  employeeName,
  serverErrors,
  isSubmitting,
  onSubmit,
  onCancel,
}: ShiftEditFormProps) {
  const Components = useComponentContext()
  const rules = shift.breakPolicy?.rules ?? []
  const isUnclassified = shift.entries.some(entry => entry.classification === 'Unclassified')

  const formMethods = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: toShiftFormValues(shift),
  })
  const breaks = useFieldArray({ control: formMethods.control, name: 'breaks' })
  const entries = useFieldArray({ control: formMethods.control, name: 'entries' })

  const values = formMethods.watch()
  const workedHours = calculateWorkedHours(values, rules)
  const entriesError =
    formMethods.formState.errors.entries?.root?.message ??
    formMethods.formState.errors.entries?.message

  const ruleOptions = [
    { value: NO_RULE, label: 'Not set' },
    ...rules.map(rule => ({
      value: rule.id ?? rule.breakType,
      label: `${rule.breakType === 'meal' ? 'Meal' : 'Rest'} (${rule.isPaid ? 'paid' : 'unpaid'})`,
    })),
  ]
  const zone = formatTimeZoneAbbreviation(shift.startTime, shift.timeZone)

  return (
    <FormProvider {...formMethods}>
      <Flex flexDirection="column" gap={24} alignItems="stretch">
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h2">Edit shift</Components.Heading>
          <Components.Text variant="supporting">
            {`${employeeName} · ${formatDayWithWeekday(shift.date)} · Times in ${zone}`}
          </Components.Text>
        </Flex>

        {shift.status === 'approved' ? (
          <Components.Alert status="info" label="This shift is approved">
            <Components.Text>
              Saving changes keeps it approved. Return it to pending if the employee needs to
              confirm the new hours.
            </Components.Text>
          </Components.Alert>
        ) : null}

        {serverErrors && serverErrors.length > 0 ? (
          <Components.Alert status="error" label="This shift couldn’t be saved">
            <Flex flexDirection="column" gap={4}>
              {serverErrors.map(message => (
                <Components.Text key={message}>{message}</Components.Text>
              ))}
            </Flex>
          </Components.Alert>
        ) : null}

        <Components.Box withPadding header={<Components.Heading as="h3">Shift</Components.Heading>}>
          <Grid gap={16} gridTemplateColumns={{ base: '1fr', small: '1fr 1fr' }}>
            <TextInputField name="clockIn" label="Clock in" type="time" isRequired />
            {values.isOngoing ? (
              <Flex flexDirection="column" gap={4}>
                <Components.Text weight="medium">Clock out</Components.Text>
                <Components.Text variant="supporting">Shift in progress</Components.Text>
              </Flex>
            ) : (
              <TextInputField
                name="clockOut"
                label="Clock out"
                type="time"
                isRequired
                description="Times earlier than clock-in count as the next day."
              />
            )}
          </Grid>
        </Components.Box>

        <Components.Box
          withPadding
          header={
            <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
              <Components.Heading as="h3">Breaks</Components.Heading>
              <Components.Button
                variant="secondary"
                onClick={() => {
                  breaks.append({ ruleId: NO_RULE, start: '', end: '' })
                }}
              >
                Add break
              </Components.Button>
            </Flex>
          }
        >
          {breaks.fields.length === 0 ? (
            <Components.Text variant="supporting">
              No breaks recorded for this shift.
            </Components.Text>
          ) : (
            <Flex flexDirection="column" gap={16} alignItems="stretch">
              {breaks.fields.map((field, index) => (
                <Grid
                  key={field.id}
                  gap={16}
                  gridTemplateColumns={{ base: '1fr', small: '1.2fr 1fr 1fr auto' }}
                  alignItems="end"
                >
                  <SelectField
                    name={`breaks.${index}.ruleId`}
                    label="Break type"
                    placeholder="Select a break type"
                    options={ruleOptions}
                    description={rules.length === 0 ? 'No break policy is assigned.' : undefined}
                  />
                  <TextInputField
                    name={`breaks.${index}.start`}
                    label="Start"
                    type="time"
                    isRequired
                  />
                  <TextInputField name={`breaks.${index}.end`} label="End" type="time" />
                  <Components.Button
                    variant="tertiary"
                    onClick={() => {
                      breaks.remove(index)
                    }}
                  >
                    Remove
                  </Components.Button>
                </Grid>
              ))}
            </Flex>
          )}
        </Components.Box>

        <Components.Box
          withPadding
          header={
            <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
              <Flex flexDirection="column" gap={2}>
                <Components.Heading as="h3">Hours</Components.Heading>
                <Components.Text variant="supporting" size="sm">
                  {workedHours !== null
                    ? `Shift minus unpaid breaks: ${formatHours(workedHours)}`
                    : 'Hours are calculated once the shift ends.'}
                </Components.Text>
              </Flex>
              {!isUnclassified ? (
                <Components.Button
                  variant="secondary"
                  onClick={() => {
                    entries.append({ classification: 'Regular', hours: 0 })
                  }}
                >
                  Add hours
                </Components.Button>
              ) : null}
            </Flex>
          }
        >
          <Flex flexDirection="column" gap={16} alignItems="stretch">
            {entriesError ? (
              <Components.Alert status="error" label={entriesError} disableScrollIntoView />
            ) : null}
            {entries.fields.map((field, index) => (
              <Grid
                key={field.id}
                gap={16}
                gridTemplateColumns={{ base: '1fr', small: '1fr 1fr auto' }}
                alignItems="end"
              >
                {isUnclassified ? (
                  <Flex flexDirection="column" gap={4}>
                    <Components.Text weight="medium">Hours worked</Components.Text>
                    <Components.Text size="sm" variant="supporting">
                      Classified as regular or overtime when synced to payroll
                    </Components.Text>
                  </Flex>
                ) : (
                  <SelectField
                    name={`entries.${index}.classification`}
                    label="Type"
                    placeholder="Select a type"
                    options={CLASSIFIED_OPTIONS}
                  />
                )}
                <NumberInputField
                  name={`entries.${index}.hours`}
                  label="Hours"
                  isRequired
                  min={0}
                  maximumFractionDigits={3}
                />
                {isUnclassified && workedHours !== null ? (
                  <Components.Button
                    variant="tertiary"
                    onClick={() => {
                      formMethods.setValue(
                        `entries.${index}.hours`,
                        Math.round(workedHours * 1000) / 1000,
                        { shouldValidate: true },
                      )
                    }}
                  >
                    Use calculated hours
                  </Components.Button>
                ) : !isUnclassified && entries.fields.length > 1 ? (
                  <Components.Button
                    variant="tertiary"
                    onClick={() => {
                      entries.remove(index)
                    }}
                  >
                    Remove
                  </Components.Button>
                ) : null}
              </Grid>
            ))}
          </Flex>
        </Components.Box>

        <ActionsLayout>
          <Components.Button variant="secondary" onClick={onCancel} isDisabled={isSubmitting}>
            Cancel
          </Components.Button>
          <Components.Button
            isLoading={isSubmitting}
            onClick={() => {
              void formMethods.handleSubmit(onSubmit)()
            }}
          >
            Save shift
          </Components.Button>
        </ActionsLayout>
      </Flex>
    </FormProvider>
  )
}
