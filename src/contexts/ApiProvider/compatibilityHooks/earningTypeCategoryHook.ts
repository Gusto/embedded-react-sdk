import { EarningTypeCategory } from '@gusto/embedded-api/models/components/earningtype'
import { createResponseBodyHook, isRecord } from './createResponseBodyHook'

const EARNING_TYPES_LIST_OPERATION_ID = 'get-v1-companies-company_id-earning_types'

const KNOWN_CATEGORIES: ReadonlySet<string> = new Set(Object.values(EarningTypeCategory))

const hasUnknownCategory = (earningType: unknown): earningType is Record<string, unknown> =>
  isRecord(earningType) &&
  typeof earningType.category === 'string' &&
  !KNOWN_CATEGORIES.has(earningType.category)

// `category` is optional in the schema, so an unrecognized category collapses to an omitted key --
// the same shape the API sends for a company without categorized custom bonus earning types. The
// earning type itself is preserved, so it stays selectable in payroll editing with its name,
// `active` flag, and `included_in_overtime_pay` intact.
const stripUnknownCategory = (earningType: Record<string, unknown>): Record<string, unknown> => {
  const { category: _category, ...rest } = earningType
  return rest
}

const listHasUnknownCategory = (list: unknown): boolean =>
  Array.isArray(list) && list.some(hasUnknownCategory)

const stripUnknownCategories = (list: unknown): unknown =>
  Array.isArray(list)
    ? list.map(earningType =>
        hasUnknownCategory(earningType) ? stripUnknownCategory(earningType) : earningType,
      )
    : list

/**
 * Temporary workaround for a Gusto-Partner-API spec gap: `Earning-Type.category` is generated as a
 * closed enum (`z.nativeEnum(EarningTypeCategory)`) in `@gusto/embedded-api`, but the published OAS
 * omits categories the application emits -- `FlatSumBonus` ships on active custom earning types
 * when regular-rate-of-pay is enabled (SDK-1419). Because the list validator validates every item in
 * both the `default` and `custom` arrays, one such earning type rejects the entire
 * `EarningTypeList` response and the payroll employee editor's earning-types query fails outright.
 * This afterSuccess hook omits any category outside the closed enum before the SDK's zod parse, so
 * the response still validates and the earning type stays intact. Remove once the client supports
 * lax/open enum parsing for this field.
 *
 * @internal
 */
export const earningTypeCategoryHook = createResponseBodyHook(
  [EARNING_TYPES_LIST_OPERATION_ID],
  body => {
    if (!isRecord(body)) return undefined
    if (!listHasUnknownCategory(body.default) && !listHasUnknownCategory(body.custom)) {
      return undefined
    }

    return {
      ...body,
      ...('default' in body ? { default: stripUnknownCategories(body.default) } : {}),
      ...('custom' in body ? { custom: stripUnknownCategories(body.custom) } : {}),
    }
  },
)
