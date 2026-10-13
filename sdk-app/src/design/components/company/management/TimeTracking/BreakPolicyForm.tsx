import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DescriptionList } from '../../../common/DescriptionList'
import type { BreakPolicy, BreakRule } from './types'
import {
  ActionsLayout,
  CheckboxField,
  Flex,
  Grid,
  NumberInputField,
  SelectField,
  TextInputField,
} from '@/components/Common'
import { STATES_ABBR } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const STATE_OPTIONS = STATES_ABBR.map(state => ({ value: state, label: state }))

const optionalNumber = z.preprocess(
  value => (typeof value === 'number' && !Number.isNaN(value) ? value : undefined),
  z.number().optional(),
)

const ruleSchema = z.object({
  id: z.string().optional(),
  isEnabled: z.boolean(),
  durationMinutes: optionalNumber,
  afterHoursWorked: optionalNumber,
  isPaid: z.boolean(),
})

const schema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    jurisdiction: z.string().min(1, 'State is required'),
    payPremium: z.boolean(),
    meal: ruleSchema,
    rest: ruleSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.meal.isEnabled && !data.rest.isEnabled) {
      ctx.addIssue({
        code: 'custom',
        path: ['meal', 'isEnabled'],
        message: 'Add a meal break, a rest break, or both',
      })
    }
    for (const key of ['meal', 'rest'] as const) {
      const rule = data[key]
      if (!rule.isEnabled) continue
      if (
        rule.durationMinutes === undefined ||
        rule.durationMinutes < 1 ||
        !Number.isInteger(rule.durationMinutes)
      ) {
        ctx.addIssue({
          code: 'custom',
          path: [key, 'durationMinutes'],
          message: 'Enter a whole number of minutes',
        })
      }
      if (rule.afterHoursWorked === undefined || rule.afterHoursWorked <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: [key, 'afterHoursWorked'],
          message: 'Enter the hours worked before this break is required',
        })
      }
    }
  })

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export interface BreakPolicyFormValues {
  name: string
  jurisdiction: string
  payPremium: boolean
  rules: BreakRule[]
}

function ruleDefaults(
  rule: BreakRule | undefined,
  fallbackDuration: number,
  fallbackAfter: number,
) {
  return {
    id: rule?.id,
    isEnabled: rule !== undefined,
    durationMinutes: rule?.durationMinutes ?? fallbackDuration,
    afterHoursWorked: rule ? rule.afterHoursWorkedMinutes / 60 : fallbackAfter,
    isPaid: rule?.isPaid ?? false,
  }
}

function toDefaults(policy: BreakPolicy | undefined): FormInput {
  const meal = policy?.rules.find(rule => rule.breakType === 'meal')
  const rest = policy?.rules.find(rule => rule.breakType === 'rest')
  return {
    name: policy?.name ?? '',
    jurisdiction: policy?.jurisdiction ?? '',
    payPremium: policy?.payPremium ?? false,
    meal: policy
      ? ruleDefaults(meal, 30, 5)
      : { ...ruleDefaults(undefined, 30, 5), isEnabled: true },
    rest: { ...ruleDefaults(rest, 10, 4), isPaid: rest?.isPaid ?? true },
  }
}

function toValues(data: FormOutput): BreakPolicyFormValues {
  const rules: BreakRule[] = []
  for (const breakType of ['meal', 'rest'] as const) {
    const rule = data[breakType]
    if (!rule.isEnabled) continue
    rules.push({
      id: rule.id,
      breakType,
      durationMinutes: rule.durationMinutes ?? 0,
      afterHoursWorkedMinutes: Math.round((rule.afterHoursWorked ?? 0) * 60),
      isPaid: rule.isPaid,
    })
  }
  return { name: data.name, jurisdiction: data.jurisdiction, payPremium: data.payPremium, rules }
}

export interface BreakPolicyFormProps {
  policy?: BreakPolicy
  serverErrors?: string[]
  isSubmitting?: boolean
  onSubmit: (values: BreakPolicyFormValues) => void
  onCancel: () => void
}

export function BreakPolicyForm({
  policy,
  serverErrors,
  isSubmitting,
  onSubmit,
  onCancel,
}: BreakPolicyFormProps) {
  const Components = useComponentContext()
  const isEdit = policy !== undefined

  const formMethods = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: toDefaults(policy),
  })
  const isMealEnabled = formMethods.watch('meal.isEnabled')
  const isRestEnabled = formMethods.watch('rest.isEnabled')

  return (
    <FormProvider {...formMethods}>
      <Flex flexDirection="column" gap={24} alignItems="stretch">
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h2">
            {isEdit ? `Edit ${policy.name}` : 'Add break policy'}
          </Components.Heading>
          <Components.Text variant="supporting">
            Set the meal and rest breaks required in a state. Break rules are used to check each
            shift and calculate unpaid time.
          </Components.Text>
        </Flex>

        {isEdit ? (
          <Components.Alert status="warning" label="Changes take effect today">
            <Components.Text>
              If someone on this policy has already taken a break today, changes to its rules can’t
              be saved until tomorrow. You can also remove that break from their timesheet and try
              again.
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
              placeholder="California breaks"
              isRequired
            />
            {isEdit ? (
              <DescriptionList
                showSeparators={false}
                items={[{ term: 'State', description: policy.jurisdiction ?? 'All states' }]}
              />
            ) : (
              <SelectField
                name="jurisdiction"
                label="State"
                placeholder="Select a state"
                description="The state this policy applies to. This can’t be changed later."
                options={STATE_OPTIONS}
                isRequired
              />
            )}
            <CheckboxField
              name="payPremium"
              label="Pay a premium for missed breaks"
              description="Adds an extra hour of pay when a required break isn’t taken, as some states require."
            />
          </Flex>
        </Components.Box>

        <BreakRuleSection
          title="Meal break"
          ruleKey="meal"
          isEnabled={isMealEnabled}
          durationLabel="Meal break length"
        />
        <BreakRuleSection
          title="Rest break"
          ruleKey="rest"
          isEnabled={isRestEnabled}
          durationLabel="Rest break length"
        />

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

function BreakRuleSection({
  title,
  ruleKey,
  isEnabled,
  durationLabel,
}: {
  title: string
  ruleKey: 'meal' | 'rest'
  isEnabled: boolean
  durationLabel: string
}) {
  const Components = useComponentContext()
  return (
    <Components.Box withPadding header={<Components.Heading as="h3">{title}</Components.Heading>}>
      <Flex flexDirection="column" gap={20} alignItems="stretch">
        <CheckboxField name={`${ruleKey}.isEnabled`} label={`Require a ${ruleKey} break`} />
        {isEnabled ? (
          <>
            <Grid gap={16} gridTemplateColumns={{ base: '1fr', small: '1fr 1fr' }}>
              <NumberInputField
                name={`${ruleKey}.durationMinutes`}
                label={durationLabel}
                isRequired
                min={1}
                adornmentEnd="minutes"
              />
              <NumberInputField
                name={`${ruleKey}.afterHoursWorked`}
                label="Required after working"
                isRequired
                min={0}
                maximumFractionDigits={2}
                adornmentEnd="hours"
              />
            </Grid>
            <CheckboxField
              name={`${ruleKey}.isPaid`}
              label="Paid break"
              description="Paid breaks count toward hours worked."
            />
          </>
        ) : null}
      </Flex>
    </Components.Box>
  )
}
