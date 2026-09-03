import { z } from 'zod'
import {
  Reason,
  LeavingFor,
  ReconcileTaxMethod,
} from '@gusto/embedded-api/models/operations/postcompaniescompanyuuidsuspensions'

/**
 * Ordered list of suspension reasons, matching the order presented in the UI.
 *
 * @internal
 */
export const REASON_ORDER: Reason[] = [
  Reason.SwitchingProvider,
  Reason.ShuttingDown,
  Reason.Acquired,
  Reason.NoMoreEmployees,
  Reason.ChangingEinOrEntityType,
]

/**
 * Ordered `leavingFor` values grouped the way they are surfaced in the UI: payroll providers,
 * then PEOs, then other destinations.
 *
 * @internal
 */
export const LEAVING_FOR_GROUPS: { groupKey: string; values: LeavingFor[] }[] = [
  {
    groupKey: 'payrollProviders',
    values: [
      LeavingFor.Adp,
      LeavingFor.BambooHr,
      LeavingFor.Check,
      LeavingFor.Deel,
      LeavingFor.GustoCom,
      LeavingFor.Homebase,
      LeavingFor.IntuitOrQuickbooks,
      LeavingFor.Namely,
      LeavingFor.Onpay,
      LeavingFor.Oyster,
      LeavingFor.Patriot,
      LeavingFor.Paychex,
      LeavingFor.Paycom,
      LeavingFor.Paylocity,
      LeavingFor.Remote,
      LeavingFor.Rippling,
      LeavingFor.Square,
      LeavingFor.Surepayroll,
      LeavingFor.VelocityGlobal,
      LeavingFor.Zenefits,
    ],
  },
  {
    groupKey: 'peos',
    values: [
      LeavingFor.AdpTotalSource,
      LeavingFor.Insperity,
      LeavingFor.Justworks,
      LeavingFor.Trinet,
    ],
  },
  {
    groupKey: 'other',
    values: [
      LeavingFor.Accountant,
      LeavingFor.BankOrFinancialInstitution,
      LeavingFor.Manual,
      LeavingFor.Other,
    ],
  },
]

/**
 * Error codes surfaced by {@link createSuspensionFormSchema} validation failures.
 *
 * @internal
 */
export const SuspensionFormErrorCodes = {
  reasonRequired: 'reasonRequired',
  leavingForRequired: 'leavingForRequired',
  reconcileTaxMethodRequired: 'reconcileTaxMethodRequired',
  commentsRequired: 'commentsRequired',
} as const

/**
 * Builds the zod schema for the suspension form, injecting localized validation messages.
 *
 * @remarks
 * Conditional requirements mirror the gws-flows behavior: `leavingFor` is required only when the
 * reason is `switching_provider`, and `comments` is required only when leaving for `other`.
 *
 * @param translateError - Resolves an error code from {@link SuspensionFormErrorCodes} to a message.
 * @internal
 */
export function createSuspensionFormSchema(
  translateError: (
    code: (typeof SuspensionFormErrorCodes)[keyof typeof SuspensionFormErrorCodes],
  ) => string,
) {
  return z
    .object({
      reason: z.nativeEnum(Reason).optional(),
      leavingFor: z.nativeEnum(LeavingFor).optional(),
      comments: z.string().optional(),
      reconcileTaxMethod: z.nativeEnum(ReconcileTaxMethod).optional(),
      fileQuarterlyForms: z.boolean(),
      fileYearlyForms: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (!data.reason) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['reason'],
          message: translateError(SuspensionFormErrorCodes.reasonRequired),
        })
      }

      if (!data.reconcileTaxMethod) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['reconcileTaxMethod'],
          message: translateError(SuspensionFormErrorCodes.reconcileTaxMethodRequired),
        })
      }

      if (data.reason === Reason.SwitchingProvider && !data.leavingFor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['leavingFor'],
          message: translateError(SuspensionFormErrorCodes.leavingForRequired),
        })
      }

      if (
        data.reason === Reason.SwitchingProvider &&
        data.leavingFor === LeavingFor.Other &&
        !data.comments?.trim()
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['comments'],
          message: translateError(SuspensionFormErrorCodes.commentsRequired),
        })
      }
    })
}
