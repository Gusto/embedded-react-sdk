import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { OvertimePolicy } from './types'
import { formatEmployeeCount } from './formatters'
import {
  ActionsLayout,
  CheckboxField,
  Flex,
  NumberInputField,
  TextInputField,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const optionalNumber = z.preprocess(
  value => (typeof value === 'number' && !Number.isNaN(value) ? value : undefined),
  z.number().int('Use a whole number').optional(),
)

const schema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(255, 'Use 255 characters or fewer'),
    weeklyThreshold: z.preprocess(
      value => (typeof value === 'number' && !Number.isNaN(value) ? value : undefined),
      z
        .number({ error: 'Weekly overtime threshold is required' })
        .int('Use a whole number')
        .min(10, 'Must be between 10 and 168 hours')
        .max(168, 'Must be between 10 and 168 hours'),
    ),
    hasDailyOvertime: z.boolean(),
    dailyThreshold: optionalNumber,
    hasDoubleOvertime: z.boolean(),
    doubleOvertimeThreshold: optionalNumber,
    hasConsecutiveDayOvertime: z.boolean(),
    consecutiveDaysThreshold: optionalNumber,
  })
  .superRefine((data, ctx) => {
    const requireInRange = (
      enabled: boolean,
      value: number | undefined,
      path: string,
      min: number,
      max: number,
      unit: string,
    ) => {
      if (!enabled) return
      if (value === undefined) {
        ctx.addIssue({ code: 'custom', path: [path], message: 'Required' })
      } else if (value < min || value > max) {
        ctx.addIssue({
          code: 'custom',
          path: [path],
          message: `Must be between ${min} and ${max} ${unit}`,
        })
      }
    }
    requireInRange(data.hasDailyOvertime, data.dailyThreshold, 'dailyThreshold', 1, 24, 'hours')
    requireInRange(
      data.hasDoubleOvertime,
      data.doubleOvertimeThreshold,
      'doubleOvertimeThreshold',
      1,
      24,
      'hours',
    )
    requireInRange(
      data.hasConsecutiveDayOvertime,
      data.consecutiveDaysThreshold,
      'consecutiveDaysThreshold',
      1,
      7,
      'days',
    )

    if (data.hasDoubleOvertime && !data.hasDailyOvertime) {
      ctx.addIssue({
        code: 'custom',
        path: ['hasDoubleOvertime'],
        message: 'Double overtime requires a daily overtime threshold',
      })
    }
    if (
      data.hasDoubleOvertime &&
      data.hasDailyOvertime &&
      data.dailyThreshold !== undefined &&
      data.doubleOvertimeThreshold !== undefined &&
      data.doubleOvertimeThreshold <= data.dailyThreshold
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['doubleOvertimeThreshold'],
        message: `Must be more than the daily overtime threshold (${data.dailyThreshold} hours)`,
      })
    }
  })

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export interface OvertimePolicyFormValues {
  name: string
  weeklyThreshold: number
  dailyThreshold: number | null
  doubleOvertimeThreshold: number | null
  consecutiveDaysThreshold: number | null
}

function toDefaults(policy: OvertimePolicy | undefined): FormInput {
  return {
    name: policy?.name ?? '',
    weeklyThreshold: policy?.weeklyThreshold ?? 40,
    hasDailyOvertime: policy ? policy.dailyThreshold !== null : false,
    dailyThreshold: policy?.dailyThreshold ?? 8,
    hasDoubleOvertime: policy ? policy.doubleOvertimeThreshold !== null : false,
    doubleOvertimeThreshold: policy?.doubleOvertimeThreshold ?? 12,
    hasConsecutiveDayOvertime: policy ? policy.consecutiveDaysThreshold !== null : false,
    consecutiveDaysThreshold: policy?.consecutiveDaysThreshold ?? 7,
  }
}

function toValues(data: FormOutput): OvertimePolicyFormValues {
  return {
    name: data.name,
    weeklyThreshold: data.weeklyThreshold,
    dailyThreshold: data.hasDailyOvertime ? (data.dailyThreshold ?? null) : null,
    doubleOvertimeThreshold:
      data.hasDailyOvertime && data.hasDoubleOvertime
        ? (data.doubleOvertimeThreshold ?? null)
        : null,
    consecutiveDaysThreshold: data.hasConsecutiveDayOvertime
      ? (data.consecutiveDaysThreshold ?? null)
      : null,
  }
}

export interface OvertimePolicyFormProps {
  policy?: OvertimePolicy
  serverErrors?: string[]
  isSubmitting?: boolean
  onSubmit: (values: OvertimePolicyFormValues) => void
  onCancel: () => void
}

export function OvertimePolicyForm({
  policy,
  serverErrors,
  isSubmitting,
  onSubmit,
  onCancel,
}: OvertimePolicyFormProps) {
  const Components = useComponentContext()
  const isEdit = policy !== undefined

  const formMethods = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: toDefaults(policy),
  })
  const hasDailyOvertime = formMethods.watch('hasDailyOvertime')
  const hasDoubleOvertime = formMethods.watch('hasDoubleOvertime')
  const hasConsecutiveDayOvertime = formMethods.watch('hasConsecutiveDayOvertime')

  return (
    <FormProvider {...formMethods}>
      <Flex flexDirection="column" gap={24} alignItems="stretch">
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h2">
            {isEdit ? `Edit ${policy.name}` : 'Add overtime policy'}
          </Components.Heading>
          <Components.Text variant="supporting">
            Set when hours count as overtime (1.5x) or double overtime (2x). Use the thresholds
            required in the state your employees work in.
          </Components.Text>
        </Flex>

        {isEdit ? (
          <Components.Alert status="warning" label="Changes apply to the whole current workweek">
            <Components.Text>
              {`Changes take effect right away for ${formatEmployeeCount(policy.employeeUuids.length)}. If this workweek has already started, hours already worked this week are recalculated with the new thresholds. Review any approved timesheets for this week after saving.`}
            </Components.Text>
          </Components.Alert>
        ) : null}

        {serverErrors && serverErrors.length > 0 ? (
          <Components.Alert status="error" label="This policy couldn’t be saved">
            <Flex flexDirection="column" gap={4}>
              {serverErrors.map(message => (
                <Components.Text key={message}>{message}</Components.Text>
              ))}
            </Flex>
          </Components.Alert>
        ) : null}

        <Components.Box
          withPadding
          header={<Components.Heading as="h3">Policy</Components.Heading>}
        >
          <Flex flexDirection="column" gap={20} alignItems="stretch">
            <TextInputField
              name="name"
              label="Policy name"
              placeholder="California overtime"
              isRequired
            />
            <NumberInputField
              name="weeklyThreshold"
              label="Weekly overtime after"
              description="Hours worked in a workweek beyond this count as overtime."
              isRequired
              min={10}
              max={168}
              adornmentEnd="hours"
            />
          </Flex>
        </Components.Box>

        <Components.Box
          withPadding
          header={
            <Flex flexDirection="column" gap={2}>
              <Components.Heading as="h3">Additional rules</Components.Heading>
              <Components.Text variant="supporting">
                Some states require daily, double, or consecutive-day overtime.
              </Components.Text>
            </Flex>
          }
        >
          <Flex flexDirection="column" gap={20} alignItems="stretch">
            <CheckboxField
              name="hasDailyOvertime"
              label="Daily overtime"
              description="Pay overtime for hours beyond a daily limit."
              onChange={checked => {
                if (!checked) formMethods.setValue('hasDoubleOvertime', false)
              }}
            />
            {hasDailyOvertime ? (
              <NumberInputField
                name="dailyThreshold"
                label="Daily overtime after"
                isRequired
                min={1}
                max={24}
                adornmentEnd="hours"
              />
            ) : null}

            <CheckboxField
              name="hasDoubleOvertime"
              label="Double overtime"
              description={
                hasDailyOvertime
                  ? 'Pay double overtime for hours beyond a higher daily limit.'
                  : 'Turn on daily overtime to set a double overtime threshold.'
              }
              isDisabled={!hasDailyOvertime}
            />
            {hasDailyOvertime && hasDoubleOvertime ? (
              <NumberInputField
                name="doubleOvertimeThreshold"
                label="Double overtime after"
                isRequired
                min={1}
                max={24}
                adornmentEnd="hours"
              />
            ) : null}

            <CheckboxField
              name="hasConsecutiveDayOvertime"
              label="Consecutive-day overtime"
              description="Pay overtime when someone works several days in a row in the same workweek."
            />
            {hasConsecutiveDayOvertime ? (
              <NumberInputField
                name="consecutiveDaysThreshold"
                label="Overtime starts on day"
                description="For example, 7 means hours on the seventh consecutive day are overtime."
                isRequired
                min={1}
                max={7}
              />
            ) : null}
          </Flex>
        </Components.Box>

        <ActionsLayout>
          <Components.Button variant="secondary" onClick={onCancel} isDisabled={isSubmitting}>
            Cancel
          </Components.Button>
          <Components.Button
            isLoading={isSubmitting}
            onClick={() => {
              void formMethods.handleSubmit(data => {
                onSubmit(toValues(data))
              })()
            }}
          >
            {isEdit ? 'Save changes' : 'Add policy'}
          </Components.Button>
        </ActionsLayout>
      </Flex>
    </FormProvider>
  )
}
