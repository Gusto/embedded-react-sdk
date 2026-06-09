import { z } from 'zod'
import { PaymentPeriod } from '@gusto/embedded-api-v-2025-11-15/models/components/garnishmentchildsupport'
import type { Agencies } from '@gusto/embedded-api-v-2025-11-15/models/components/childsupportdata'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type ValidatorsFor,
} from '@/partner-hook-utils/form/buildFormSchema'
import { coerceNaN } from '@/partner-hook-utils/form/preprocessors'

// ── Error codes ────────────────────────────────────────────────────────

export const ChildSupportGarnishmentFormErrorCodes = {
  REQUIRED: 'REQUIRED',
  NEGATIVE_AMOUNT: 'NEGATIVE_AMOUNT',
  PERCENT_OUT_OF_RANGE: 'PERCENT_OUT_OF_RANGE',
} as const

export type ChildSupportGarnishmentFormErrorCode =
  (typeof ChildSupportGarnishmentFormErrorCodes)[keyof typeof ChildSupportGarnishmentFormErrorCodes]

// ── Required-attribute keys recognized from the API ────────────────────

/**
 * Agencies declare which child-support attributes they need via
 * `required_attributes[].key`. The legacy form only mapped three keys;
 * unknown keys are ignored both there and here.
 */
export const SUPPORTED_REQUIRED_ATTR_KEYS = [
  'case_number',
  'order_number',
  'remittance_number',
] as const

export type SupportedRequiredAttrKey = (typeof SUPPORTED_REQUIRED_ATTR_KEYS)[number]

// Field name on the form for each required-attribute key.
export const REQUIRED_ATTR_FIELD_NAME: Record<SupportedRequiredAttrKey, string> = {
  case_number: 'caseNumber',
  order_number: 'orderNumber',
  remittance_number: 'remittanceNumber',
}

export function getRequiredAttrKeys(agency?: Agencies | null): Set<SupportedRequiredAttrKey> {
  const keys = new Set<SupportedRequiredAttrKey>()
  if (!agency?.requiredAttributes) return keys
  for (const attr of agency.requiredAttributes) {
    if (!attr.key) continue
    if ((SUPPORTED_REQUIRED_ATTR_KEYS as readonly string[]).includes(attr.key)) {
      keys.add(attr.key as SupportedRequiredAttrKey)
    }
  }
  return keys
}

// ── Form data types ────────────────────────────────────────────────────

export interface ChildSupportGarnishmentFormData {
  state: string
  fipsCode: string
  caseNumber: string
  orderNumber: string
  remittanceNumber: string
  payPeriodMaximum: number
  amount: number
  paymentPeriod: PaymentPeriod
}

export type ChildSupportGarnishmentFormOutputs = ChildSupportGarnishmentFormData

// ── Field validators ───────────────────────────────────────────────────

const PERCENT_MIN = 0
const PERCENT_MAX = 100

const fieldValidators = {
  state: z.string(),
  fipsCode: z.string(),
  caseNumber: z.string(),
  orderNumber: z.string(),
  remittanceNumber: z.string(),
  // Currency cap on the pay-period — required, ≥ 0.
  payPeriodMaximum: z.preprocess(
    coerceNaN(0),
    z.number().min(0, { message: ChildSupportGarnishmentFormErrorCodes.NEGATIVE_AMOUNT }),
  ),
  // Percentage of paycheck, 0-100. Required.
  amount: z.preprocess(
    coerceNaN(0),
    z
      .number()
      .min(PERCENT_MIN, {
        message: ChildSupportGarnishmentFormErrorCodes.PERCENT_OUT_OF_RANGE,
      })
      .max(PERCENT_MAX, {
        message: ChildSupportGarnishmentFormErrorCodes.PERCENT_OUT_OF_RANGE,
      }),
  ),
  paymentPeriod: z.enum(PaymentPeriod),
} satisfies ValidatorsFor<ChildSupportGarnishmentFormData>

export type ChildSupportGarnishmentFormField = keyof ChildSupportGarnishmentFormData

// ── Required fields config ─────────────────────────────────────────────
//
// `state`, `fipsCode`, `payPeriodMaximum`, `amount`, `paymentPeriod` are
// always required. The three agency-attribute fields toggle requiredness
// based on the currently selected agency — see `createChildSupportGarnishmentFormSchema`
// which assigns 'always' / 'never' per call.

interface ChildSupportGarnishmentFormSchemaOptions {
  mode?: 'create' | 'update'
  /**
   * The agency record matching the currently selected `state`. Used only when
   * `agencyList` is not provided — `requiredAttributes` are pinned to this
   * single agency, so the schema must be rebuilt whenever the user picks a
   * different state. Prefer passing `agencyList` instead so requiredness
   * tracks the form's `state` value dynamically.
   */
  selectedAgency?: Agencies | null
  /**
   * Full list of agencies. When provided, the schema's requiredness for
   * `caseNumber` / `orderNumber` / `remittanceNumber` is computed at validation
   * time by looking up the agency whose `state` matches the form's `state`
   * value — so a single schema instance stays correct as the user changes
   * states. Takes precedence over `selectedAgency`.
   */
  agencyList?: readonly Agencies[]
}

export function createChildSupportGarnishmentFormSchema({
  mode = 'create',
  selectedAgency,
  agencyList,
}: ChildSupportGarnishmentFormSchemaOptions = {}) {
  // Read `data.state` eagerly (outside the `agencyList.find` callback) so that
  // `buildFormSchema`'s proxy-based predicate-dep detection always observes
  // the `state` access — otherwise an empty `agencyList` at schema-build time
  // would short-circuit the `find` before the proxy sees `data.state` and
  // `useDeriveFieldsMetadata` would treat the field metadata as static.
  const requiredFieldsConfig = agencyList
    ? ({
        caseNumber: data => {
          const state = data.state
          return getRequiredAttrKeys(agencyList.find(a => a.state === state)).has('case_number')
        },
        orderNumber: data => {
          const state = data.state
          return getRequiredAttrKeys(agencyList.find(a => a.state === state)).has('order_number')
        },
        remittanceNumber: data => {
          const state = data.state
          return getRequiredAttrKeys(agencyList.find(a => a.state === state)).has(
            'remittance_number',
          )
        },
      } satisfies RequiredFieldConfig<typeof fieldValidators>)
    : (() => {
        const requiredAttrKeys = getRequiredAttrKeys(selectedAgency)
        return {
          caseNumber: requiredAttrKeys.has('case_number') ? 'always' : 'never',
          orderNumber: requiredAttrKeys.has('order_number') ? 'always' : 'never',
          remittanceNumber: requiredAttrKeys.has('remittance_number') ? 'always' : 'never',
        } satisfies RequiredFieldConfig<typeof fieldValidators>
      })()

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: ChildSupportGarnishmentFormErrorCodes.REQUIRED,
    mode,
  })
}
