import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePaySchedulesCreateMutation } from '@gusto/embedded-api/react-query/paySchedulesCreate'
import { usePaySchedulesUpdateMutation } from '@gusto/embedded-api/react-query/paySchedulesUpdate'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import { usePaySchedulesGetPreview } from '@gusto/embedded-api/react-query/paySchedulesGetPreview'
import type { PayScheduleFrequency } from '@gusto/embedded-api/models/components/payschedulefrequency'
import type { Frequency as PayScheduleCreateFrequency } from '@gusto/embedded-api/models/components/payschedulecreaterequest'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import type { PaySchedulePreviewPayPeriod } from '@gusto/embedded-api/models/components/payschedulepreviewpayperiod'
import { ActionsLayout, Flex, Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface PayScheduleFormProps {
  companyId: string
  payScheduleId?: string
  onSaved: () => void
  onCancel: () => void
}

const FREQUENCY_VALUES = ['Every week', 'Every other week', 'Twice per month', 'Monthly'] as const
type Frequency = (typeof FREQUENCY_VALUES)[number]

const FREQUENCY_OPTIONS = FREQUENCY_VALUES.map(v => ({ value: v, label: v }))

const TWICE_PER_MONTH_OPTIONS = [
  { value: '1st15th', label: '15th and Last day of the month' },
  { value: 'custom', label: 'Custom' },
]

const schema = z
  .object({
    customName: z.string().min(1, 'Name is required'),
    frequency: z.enum(FREQUENCY_VALUES),
    customTwicePerMonth: z.enum(['1st15th', 'custom']).optional(),
    anchorPayDate: z.date({ error: 'First pay date is required' }),
    anchorEndOfPayPeriod: z.date({ error: 'First pay period end date is required' }),
    day1: z.number().nullable().optional(),
    day2: z.number().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const needsDay1 =
      data.frequency === 'Monthly' ||
      (data.frequency === 'Twice per month' && data.customTwicePerMonth === 'custom')
    const needsDay2 = data.frequency === 'Twice per month' && data.customTwicePerMonth === 'custom'

    if (needsDay1) {
      if (data.day1 == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['day1'],
          message: 'First pay day of the month is required',
        })
      } else if (data.day1 < 1 || data.day1 > 31) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['day1'],
          message: 'Must be between 1 and 31',
        })
      }
    }
    if (needsDay2) {
      if (data.day2 == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['day2'],
          message: 'Last pay day of the month is required',
        })
      } else if (data.day2 < 1 || data.day2 > 31) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['day2'],
          message: 'Must be between 1 and 31',
        })
      }
    }
  })

type FormData = z.infer<typeof schema>

function toRfcDate(input: Date): RFCDate {
  const year = input.getFullYear()
  const month = String(input.getMonth() + 1).padStart(2, '0')
  const day = String(input.getDate()).padStart(2, '0')
  return new RFCDate(`${year}-${month}-${day}`)
}

function fromRfcDate(input: string | undefined): Date | null {
  if (!input) return null
  const [year, month, day] = input.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function toLocalDate(rfc: { toString(): string }): Date {
  const [year, month, day] = rfc.toString().split('-').map(Number)
  return new Date(year!, month! - 1, day!)
}

function deriveCustomTwicePerMonth(
  frequency: string,
  day1: number | null | undefined,
  day2: number | null | undefined,
): '1st15th' | 'custom' | undefined {
  if (frequency !== 'Twice per month') return undefined
  if (day1 === 15 && day2 === 31) return '1st15th'
  return 'custom'
}

export function PayScheduleForm({
  companyId,
  payScheduleId,
  onSaved,
  onCancel,
}: PayScheduleFormProps) {
  const Components = useComponentContext()
  const isEdit = Boolean(payScheduleId)

  const existingQuery = usePaySchedulesGet(
    { companyId, payScheduleId: payScheduleId ?? '' },
    { enabled: isEdit },
  )
  const existing = isEdit ? existingQuery.data?.payScheduleShow : undefined

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as unknown as any,
    defaultValues: {
      customName: '',
      frequency: 'Every other week',
      customTwicePerMonth: undefined,
      anchorPayDate: undefined as unknown as Date,
      anchorEndOfPayPeriod: undefined as unknown as Date,
      day1: null,
      day2: null,
    },
  })

  useEffect(() => {
    if (existing) {
      const existingDay1 = existing.day1 ?? null
      const existingDay2 = existing.day2 ?? null
      reset({
        customName: existing.customName ?? '',
        frequency: (existing.frequency ?? 'Every other week') as Frequency,
        customTwicePerMonth: deriveCustomTwicePerMonth(
          existing.frequency ?? '',
          existingDay1,
          existingDay2,
        ),
        anchorPayDate: fromRfcDate(existing.anchorPayDate?.toString()) as unknown as Date,
        anchorEndOfPayPeriod: fromRfcDate(
          existing.anchorEndOfPayPeriod?.toString(),
        ) as unknown as Date,
        day1: existingDay1,
        day2: existingDay2,
      })
    }
  }, [existing, reset])

  const frequency = watch('frequency')
  const customTwicePerMonth = watch('customTwicePerMonth')
  const anchorPayDate = watch('anchorPayDate')
  const anchorEndOfPayPeriod = watch('anchorEndOfPayPeriod')
  const day1 = watch('day1')
  const day2 = watch('day2')

  const showCustomTwicePerMonth = frequency === 'Twice per month'
  const showDay1 =
    frequency === 'Monthly' || (frequency === 'Twice per month' && customTwicePerMonth === 'custom')
  const showDay2 = frequency === 'Twice per month' && customTwicePerMonth === 'custom'

  useEffect(() => {
    if (frequency === 'Twice per month' && customTwicePerMonth === '1st15th') {
      setValue('day1', 15)
      setValue('day2', 31)
    }
  }, [frequency, customTwicePerMonth, setValue])

  const rfcAnchorPay = anchorPayDate instanceof Date ? toRfcDate(anchorPayDate) : null
  const rfcAnchorEnd = anchorEndOfPayPeriod instanceof Date ? toRfcDate(anchorEndOfPayPeriod) : null
  const previewEnabled = Boolean(rfcAnchorPay && rfcAnchorEnd)

  const previewQuery = usePaySchedulesGetPreview(
    {
      companyId,
      frequency: frequency as PayScheduleFrequency,
      ...(rfcAnchorPay && { anchorPayDate: rfcAnchorPay }),
      ...(rfcAnchorEnd && { anchorEndOfPayPeriod: rfcAnchorEnd }),
      day1: day1 ?? undefined,
      day2: day2 ?? undefined,
    } as Parameters<typeof usePaySchedulesGetPreview>[0],
    { enabled: previewEnabled },
  )

  const payPeriods: PaySchedulePreviewPayPeriod[] | undefined =
    previewQuery.data?.paySchedulePreview?.payPeriods
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0)

  const { mutateAsync: createPaySchedule, isPending: isCreating } = usePaySchedulesCreateMutation()
  const { mutateAsync: updatePaySchedule, isPending: isUpdating } = usePaySchedulesUpdateMutation()
  const isPending = isCreating || isUpdating || isSubmitting

  const onSubmit = handleSubmit(async (data: FormData) => {
    const anchorPayDate = toRfcDate(data.anchorPayDate)
    const anchorEndOfPayPeriod = toRfcDate(data.anchorEndOfPayPeriod)
    const day1 = showDay1 ? (data.day1 ?? undefined) : undefined
    const day2 = showDay2 ? (data.day2 ?? undefined) : undefined

    if (isEdit && existing) {
      await updatePaySchedule({
        request: {
          companyId,
          payScheduleId: existing.uuid,
          payScheduleUpdateRequest: {
            version: existing.version,
            customName: data.customName,
            frequency: data.frequency,
            anchorPayDate,
            anchorEndOfPayPeriod,
            day1,
            day2,
          },
        },
      })
    } else {
      await createPaySchedule({
        request: {
          companyId,
          payScheduleCreateRequest: {
            customName: data.customName,
            frequency: data.frequency as PayScheduleCreateFrequency,
            anchorPayDate,
            anchorEndOfPayPeriod,
            day1,
            day2,
          },
        },
      })
    }
    onSaved()
  })

  const selectedPeriod = payPeriods?.[selectedPeriodIndex]

  return (
    <Flex flexDirection="column" gap={24} alignItems="stretch">
      <Components.Heading as="h2">
        {isEdit ? 'Edit pay schedule' : 'Add pay schedule'}
      </Components.Heading>
      <Grid gap={32} gridTemplateColumns={{ base: '1fr', small: '1fr 1fr' }}>
        <Flex flexDirection="column" gap={20} alignItems="stretch">
          <Controller
            control={control}
            name="customName"
            render={({ field, fieldState }) => (
              <Components.TextInput
                label="Name"
                placeholder="Bi-weekly"
                isRequired
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                isInvalid={Boolean(fieldState.error)}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="frequency"
            render={({ field, fieldState }) => (
              <Components.Select
                label="Frequency"
                placeholder="Select frequency"
                isRequired
                options={FREQUENCY_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                isInvalid={Boolean(fieldState.error)}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          {showCustomTwicePerMonth && (
            <Controller
              control={control}
              name="customTwicePerMonth"
              render={({ field, fieldState }) => (
                <Components.Select
                  label="Frequency options"
                  description="Select the pay days for the month."
                  placeholder="Select pay days"
                  options={TWICE_PER_MONTH_OPTIONS}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  isInvalid={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          )}
          <Controller
            control={control}
            name="anchorPayDate"
            render={({ field, fieldState }) => (
              <Components.DatePicker
                label="First pay date"
                isRequired
                value={field.value instanceof Date ? field.value : null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                isInvalid={Boolean(fieldState.error)}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="anchorEndOfPayPeriod"
            render={({ field, fieldState }) => (
              <Components.DatePicker
                label="First pay period end date"
                description="The last date of the first pay period; can be the same as the first pay date."
                isRequired
                value={field.value instanceof Date ? field.value : null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                isInvalid={Boolean(fieldState.error)}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          {showDay1 && (
            <Controller
              control={control}
              name="day1"
              render={({ field, fieldState }) => (
                <Components.NumberInput
                  label="First pay day of the month"
                  isRequired
                  value={field.value ?? undefined}
                  onChange={value => {
                    field.onChange(value)
                  }}
                  onBlur={field.onBlur}
                  min={1}
                  max={31}
                  isInvalid={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          )}
          {showDay2 && (
            <Controller
              control={control}
              name="day2"
              render={({ field, fieldState }) => (
                <Components.NumberInput
                  label="Last pay day of the month"
                  isRequired
                  value={field.value ?? undefined}
                  onChange={value => {
                    field.onChange(value)
                  }}
                  onBlur={field.onBlur}
                  min={1}
                  max={31}
                  isInvalid={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          )}
        </Flex>
        <Flex flexDirection="column" gap={16} alignItems="center" justifyContent="center">
          {payPeriods && selectedPeriod ? (
            <Flex flexDirection="column" gap={12} alignItems="stretch">
              <Components.Select
                label="Preview"
                placeholder=""
                isRequired
                options={payPeriods.map((period, index) => ({
                  value: String(index),
                  label: `${period.startDate.toString()} — ${period.endDate.toString()}`,
                }))}
                value={String(selectedPeriodIndex)}
                onChange={value => {
                  setSelectedPeriodIndex(Number(value))
                }}
              />
              <Components.CalendarPreview
                key={selectedPeriodIndex}
                dateRange={{
                  start: toLocalDate(selectedPeriod.startDate),
                  end: toLocalDate(selectedPeriod.endDate),
                  label: 'Pay period',
                }}
                highlightDates={[
                  {
                    date: toLocalDate(selectedPeriod.checkDate),
                    highlightColor: 'primary',
                    label: 'Payday',
                  },
                  {
                    date: toLocalDate(selectedPeriod.runPayrollBy),
                    highlightColor: 'secondary',
                    label: 'Run payroll by',
                  },
                ]}
              />
            </Flex>
          ) : (
            <Components.Alert status="info" label="Pay schedule preview">
              <Components.Text>
                Complete all the required fields on the left to see a preview of your pay schedule.
              </Components.Text>
            </Components.Alert>
          )}
        </Flex>
      </Grid>
      <ActionsLayout>
        <Components.Button variant="secondary" onClick={onCancel}>
          Cancel
        </Components.Button>
        <Components.Button
          onClick={() => {
            void onSubmit()
          }}
          isLoading={isPending}
        >
          Save
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
