import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { OvertimePolicy } from './types'

const optionalNumber = z.preprocess(
  value => (typeof value === 'number' && !Number.isNaN(value) ? value : undefined),
  z.number().int('Must be a whole number.').optional(),
)

function createSchema({
  existingNames,
  lockedEmployeeUuids,
}: {
  existingNames: string[]
  lockedEmployeeUuids: string[]
}) {
  return z
    .object({
      name: z.string().trim().min(1, 'Policy name is required.').max(255),
      weeklyThreshold: z.preprocess(
        value => (typeof value === 'number' && !Number.isNaN(value) ? value : undefined),
        z
          .number({ error: 'Weekly overtime is required.' })
          .int('Must be a whole number.')
          .min(10, 'Must be between 10 and 168 hours.')
          .max(168, 'Must be between 10 and 168 hours.'),
      ),
      hasDailyOvertime: z.boolean(),
      dailyThreshold: optionalNumber,
      hasDoubleOvertime: z.boolean(),
      doubleOvertimeThreshold: optionalNumber,
      consecutiveDayOvertime: z.enum(['yes', 'no']),
      employeeUuids: z.array(z.string()),
    })
    .superRefine((data, ctx) => {
      if (existingNames.includes(data.name.trim().toLowerCase())) {
        ctx.addIssue({
          code: 'custom',
          path: ['name'],
          message: 'There is already another set of rules with this policy name.',
        })
      }
      const inRange = (enabled: boolean, value: number | undefined, path: string) => {
        if (!enabled) return
        if (value === undefined || value < 1 || value > 24) {
          ctx.addIssue({ code: 'custom', path: [path], message: 'Must be between 1 and 24 hours.' })
        }
      }
      inRange(data.hasDailyOvertime, data.dailyThreshold, 'dailyThreshold')
      inRange(data.hasDoubleOvertime, data.doubleOvertimeThreshold, 'doubleOvertimeThreshold')
      if (data.hasDoubleOvertime && !data.hasDailyOvertime) {
        ctx.addIssue({
          code: 'custom',
          path: ['hasDoubleOvertime'],
          message: 'Double daily overtime cannot exist without daily overtime.',
        })
      }
      if (
        data.hasDailyOvertime &&
        data.hasDoubleOvertime &&
        data.dailyThreshold !== undefined &&
        data.doubleOvertimeThreshold !== undefined &&
        data.dailyThreshold >= data.doubleOvertimeThreshold
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['doubleOvertimeThreshold'],
          message: 'Daily overtime must be less than double daily overtime.',
        })
      }
      if (lockedEmployeeUuids.some(uuid => !data.employeeUuids.includes(uuid))) {
        ctx.addIssue({
          code: 'custom',
          path: ['employeeUuids'],
          message:
            'Overtime policies are required. To remove someone, you must reassign them to a different policy.',
        })
      }
    })
}

export type OvertimePolicyFormInput = z.input<ReturnType<typeof createSchema>>
type FormOutput = z.output<ReturnType<typeof createSchema>>

export interface OvertimePolicyFormValues {
  name: string
  weeklyThreshold: number
  dailyThreshold: number | null
  doubleOvertimeThreshold: number | null
  consecutiveDaysThreshold: number | null
  employeeUuids: string[]
}

function toDefaults(policy: OvertimePolicy | undefined): OvertimePolicyFormInput {
  return {
    name: policy?.name ?? '',
    weeklyThreshold: policy?.weeklyThreshold ?? 40,
    hasDailyOvertime: policy ? policy.dailyThreshold !== null : false,
    dailyThreshold: policy?.dailyThreshold ?? 8,
    hasDoubleOvertime: policy ? policy.doubleOvertimeThreshold !== null : false,
    doubleOvertimeThreshold: policy?.doubleOvertimeThreshold ?? 12,
    consecutiveDayOvertime: policy?.consecutiveDaysThreshold ? 'yes' : 'no',
    employeeUuids: policy?.employeeUuids ?? [],
  }
}

function toValues(data: FormOutput): OvertimePolicyFormValues {
  return {
    name: data.name.trim(),
    weeklyThreshold: data.weeklyThreshold,
    dailyThreshold: data.hasDailyOvertime ? (data.dailyThreshold ?? null) : null,
    doubleOvertimeThreshold:
      data.hasDailyOvertime && data.hasDoubleOvertime
        ? (data.doubleOvertimeThreshold ?? null)
        : null,
    consecutiveDaysThreshold: data.consecutiveDayOvertime === 'yes' ? 7 : null,
    employeeUuids: data.employeeUuids,
  }
}

export function useOvertimePolicyForm({
  policy,
  policyNames,
  onSubmit,
}: {
  policy?: OvertimePolicy
  policyNames: Record<string, string>
  onSubmit: (values: OvertimePolicyFormValues) => void
}) {
  const formMethods = useForm<OvertimePolicyFormInput, unknown, FormOutput>({
    resolver: zodResolver(
      createSchema({
        existingNames: Object.entries(policyNames)
          .filter(([id]) => id !== policy?.id)
          .map(([, name]) => name.toLowerCase()),
        lockedEmployeeUuids: policy?.employeeUuids ?? [],
      }),
    ),
    defaultValues: toDefaults(policy),
  })

  const submit = () => {
    void formMethods.handleSubmit(data => {
      onSubmit(toValues(data))
    })()
  }

  return { formMethods, submit }
}
