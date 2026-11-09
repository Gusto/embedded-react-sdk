import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { BreakPolicy, BreakRule } from './types'

const optionalNumber = z.preprocess(
  value => (typeof value === 'number' && !Number.isNaN(value) ? value : undefined),
  z.number().optional(),
)

const ruleSchema = z.object({
  id: z.string().optional(),
  durationMinutes: optionalNumber,
  everyHours: optionalNumber,
  compensation: z.enum(['unpaid', 'paid']),
})

function createSchema(existingNames: string[]) {
  return z
    .object({
      name: z.string().trim().min(1, 'Policy name is required.'),
      providesMeal: z.boolean(),
      meals: z.array(ruleSchema),
      providesRest: z.boolean(),
      rests: z.array(ruleSchema),
      payPremium: z.boolean(),
      employeeUuids: z.array(z.string()),
    })
    .superRefine((data, ctx) => {
      if (existingNames.includes(data.name.trim().toLowerCase())) {
        ctx.addIssue({
          code: 'custom',
          path: ['name'],
          message: 'Break policy names must be unique for a company.',
        })
      }
      if (!data.providesMeal && !data.providesRest) {
        ctx.addIssue({
          code: 'custom',
          path: ['providesMeal'],
          message: 'Enter a meal or rest break to create this policy.',
        })
      }
      for (const key of ['meals', 'rests'] as const) {
        if (key === 'meals' ? !data.providesMeal : !data.providesRest) continue
        data[key].forEach((rule, index) => {
          if (
            rule.durationMinutes === undefined ||
            rule.durationMinutes < 1 ||
            !Number.isInteger(rule.durationMinutes)
          ) {
            ctx.addIssue({
              code: 'custom',
              path: [key, index, 'durationMinutes'],
              message: 'Must be a whole number of at least 1 minute.',
            })
          }
          if (rule.everyHours === undefined || rule.everyHours <= 0) {
            ctx.addIssue({
              code: 'custom',
              path: [key, index, 'everyHours'],
              message: 'Enter how often this break is provided.',
            })
          }
        })
      }
    })
}

export type BreakPolicyFormInput = z.input<ReturnType<typeof createSchema>>
type FormOutput = z.output<ReturnType<typeof createSchema>>

export interface BreakPolicyFormValues {
  name: string
  jurisdiction: string | null
  payPremium: boolean
  rules: BreakRule[]
  employeeUuids: string[]
}

function toRuleInput(rule: BreakRule) {
  return {
    id: rule.id,
    durationMinutes: rule.durationMinutes,
    everyHours: rule.afterHoursWorkedMinutes / 60,
    compensation: rule.isPaid ? ('paid' as const) : ('unpaid' as const),
  }
}

function toDefaults(policy: BreakPolicy | undefined): BreakPolicyFormInput {
  const rules = policy?.rules ?? []
  const meals = rules.filter(rule => rule.breakType === 'meal').map(toRuleInput)
  const rests = rules.filter(rule => rule.breakType === 'rest').map(toRuleInput)
  return {
    name: policy?.name ?? '',
    providesMeal: meals.length > 0,
    meals:
      meals.length > 0 ? meals : [{ durationMinutes: 30, everyHours: 5, compensation: 'unpaid' }],
    providesRest: rests.length > 0,
    rests:
      rests.length > 0 ? rests : [{ durationMinutes: 10, everyHours: 4, compensation: 'paid' }],
    payPremium: policy?.payPremium ?? false,
    employeeUuids: policy?.employeeUuids ?? [],
  }
}

function toValues(data: FormOutput, jurisdiction: string | null): BreakPolicyFormValues {
  const toRule =
    (breakType: 'meal' | 'rest') =>
    (rule: FormOutput['meals'][number]): BreakRule => ({
      id: rule.id,
      breakType,
      durationMinutes: rule.durationMinutes ?? 0,
      afterHoursWorkedMinutes: Math.round((rule.everyHours ?? 0) * 60),
      isPaid: rule.compensation === 'paid',
    })
  return {
    name: data.name.trim(),
    jurisdiction,
    payPremium: data.payPremium,
    rules: [
      ...(data.providesMeal ? data.meals.map(toRule('meal')) : []),
      ...(data.providesRest ? data.rests.map(toRule('rest')) : []),
    ],
    employeeUuids: data.employeeUuids,
  }
}

export function useBreakPolicyForm({
  policy,
  policyNames,
  onSubmit,
}: {
  policy?: BreakPolicy
  policyNames: Record<string, string>
  onSubmit: (values: BreakPolicyFormValues) => void
}) {
  const jurisdiction = policy?.jurisdiction ?? null

  const formMethods = useForm<BreakPolicyFormInput, unknown, FormOutput>({
    resolver: zodResolver(
      createSchema(
        Object.entries(policyNames)
          .filter(([id]) => id !== policy?.id)
          .map(([, name]) => name.toLowerCase()),
      ),
    ),
    defaultValues: toDefaults(policy),
  })

  const submit = () => {
    void formMethods.handleSubmit(data => {
      onSubmit(toValues(data, jurisdiction))
    })()
  }

  return { formMethods, jurisdiction, submit }
}
