import { useEffect } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Employee } from '@gusto/embedded-api-v-2025-11-15/models/components/employee'
import type { Location } from '@gusto/embedded-api-v-2025-11-15/models/components/location'
import type { Rehire } from '@gusto/embedded-api-v-2025-11-15/models/components/rehire'
import { Flex } from '@/components/Common/Flex'
import { Form } from '@/components/Common/Form'
import { Grid } from '@/components/Common/Grid/Grid'
import { DatePickerField } from '@/components/Common/Fields/DatePickerField'
import { SelectField } from '@/components/Common/Fields/SelectField'
import { RadioGroupField } from '@/components/Common/Fields/RadioGroupField'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { formatDateToStringDate } from '@/helpers/dateFormatting'

const RehireEmployeeSchema = z.object({
  effectiveDate: z.date(),
  workLocationUuid: z.string().min(1, 'Select a work address'),
  fileNewHireReport: z.enum(['yes', 'no']),
})

type RehireEmployeeFormData = z.infer<typeof RehireEmployeeSchema>

export interface RehireEmployeeFormValues {
  effectiveDate: string
  workLocationUuid: string
  fileNewHireReport: boolean
}

export interface RehireEmployeeFormProps {
  employee: Pick<Employee, 'firstName' | 'lastName' | 'uuid'>
  workLocations: Location[]
  isPending?: boolean
  defaultWorkLocationUuid?: string
  existingRehire?: Pick<
    Rehire,
    'effectiveDate' | 'workLocationUuid' | 'fileNewHireReport' | 'version'
  > | null
  submitError?: string | null
  onDismissSubmitError?: () => void
  effectiveDateError?: string | null
  onDismissEffectiveDateError?: () => void
  onCancel?: () => void
  onSubmit: (values: RehireEmployeeFormValues) => Promise<void> | void
}

function locationLabel(location: Location): string {
  const lines = [location.street1, location.city, location.state, location.zip].filter(Boolean)
  return lines.join(', ')
}

function employeeName(employee: Pick<Employee, 'firstName' | 'lastName'>): string {
  return [employee.firstName, employee.lastName].filter(Boolean).join(' ') || 'employee'
}

export function RehireEmployeeForm({
  employee,
  workLocations,
  isPending,
  defaultWorkLocationUuid,
  existingRehire,
  submitError,
  onDismissSubmitError,
  effectiveDateError,
  onDismissEffectiveDateError,
  onCancel,
  onSubmit,
}: RehireEmployeeFormProps) {
  const Components = useComponentContext()

  const isEditing = !!existingRehire

  const initialEffectiveDate = existingRehire?.effectiveDate
    ? new Date(`${existingRehire.effectiveDate}T00:00:00`)
    : new Date()

  const initialWorkLocationUuid =
    existingRehire?.workLocationUuid ?? defaultWorkLocationUuid ?? workLocations[0]?.uuid ?? ''

  const initialFileNewHireReport: 'yes' | 'no' =
    existingRehire?.fileNewHireReport === false ? 'no' : 'yes'

  const formMethods = useForm<RehireEmployeeFormData>({
    resolver: zodResolver(RehireEmployeeSchema),
    defaultValues: {
      effectiveDate: initialEffectiveDate,
      workLocationUuid: initialWorkLocationUuid,
      fileNewHireReport: initialFileNewHireReport,
    },
  })

  useEffect(() => {
    if (effectiveDateError) {
      formMethods.setError('effectiveDate', { type: 'server', message: effectiveDateError })
    } else {
      formMethods.clearErrors('effectiveDate')
    }
  }, [effectiveDateError, formMethods])

  const watchedEffectiveDate = useWatch({ control: formMethods.control, name: 'effectiveDate' })
  useEffect(() => {
    if (effectiveDateError) {
      onDismissEffectiveDateError?.()
    }
  }, [watchedEffectiveDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const workLocationOptions = workLocations.map(location => ({
    label: locationLabel(location),
    value: location.uuid,
  }))

  const handleSubmit = formMethods.handleSubmit(async data => {
    await onSubmit({
      effectiveDate: formatDateToStringDate(data.effectiveDate) || '',
      workLocationUuid: data.workLocationUuid,
      fileNewHireReport: data.fileNewHireReport === 'yes',
    })
  })

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={handleSubmit}>
        <Grid gridTemplateColumns="1fr" gap={24}>
          {submitError && (
            <Components.Alert label={submitError} status="error" onDismiss={onDismissSubmitError} />
          )}

          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">
              {isEditing
                ? `Edit rehire for ${employeeName(employee)}`
                : `Rehire ${employeeName(employee)}`}
            </Components.Heading>
            <Components.Text variant="supporting">
              {isEditing
                ? 'Update the return to work date or work address for this scheduled rehire.'
                : 'Schedule a return to work date and confirm where this employee will work.'}
            </Components.Text>
          </Flex>

          <DatePickerField
            name="effectiveDate"
            label="Start date"
            description="The day the employee returns to work."
            isRequired
          />

          <SelectField
            name="workLocationUuid"
            label="Work address"
            description="The address where this employee will report to work."
            options={workLocationOptions}
            isRequired
          />

          <RadioGroupField
            name="fileNewHireReport"
            label="File a new hire report"
            description="Required in most states when rehiring after a separation of 60 days or more."
            isRequired
            options={[
              { label: 'Yes, file a new hire report', value: 'yes' },
              { label: 'No, do not file', value: 'no' },
            ]}
          />

          <Flex gap={12} justifyContent="flex-end">
            {onCancel && (
              <Components.Button variant="secondary" onClick={onCancel} isDisabled={isPending}>
                Cancel
              </Components.Button>
            )}
            <Components.Button type="submit" variant="primary" isDisabled={isPending}>
              {isPending
                ? isEditing
                  ? 'Saving...'
                  : 'Scheduling rehire...'
                : isEditing
                  ? 'Save rehire'
                  : 'Schedule rehire'}
            </Components.Button>
          </Flex>
        </Grid>
      </Form>
    </FormProvider>
  )
}
