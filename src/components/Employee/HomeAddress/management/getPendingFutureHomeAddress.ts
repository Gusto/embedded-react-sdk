import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { normalizeToDate } from '@/helpers/dateFormatting'

const startOfLocalDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/**
 * Returns the next inactive home address whose effective date is strictly after today (local),
 * or undefined when there is no such scheduled change.
 */
export function getPendingFutureHomeAddress(
  addresses: EmployeeAddress[] | undefined,
  now: Date = new Date(),
): EmployeeAddress | undefined {
  if (!addresses?.length) {
    return undefined
  }

  const todayStart = startOfLocalDay(now)

  const pending = addresses.filter(address => {
    if (address.active === true) {
      return false
    }
    const raw = address.effectiveDate
    if (!raw) {
      return false
    }
    const parsed = normalizeToDate(raw.toString())
    if (!parsed) {
      return false
    }
    return startOfLocalDay(parsed) > todayStart
  })

  if (pending.length === 0) {
    return undefined
  }

  pending.sort((a, b) => {
    const as = a.effectiveDate?.toString() ?? ''
    const bs = b.effectiveDate?.toString() ?? ''
    return as.localeCompare(bs)
  })

  return pending[0]
}

const USA_LABELS = new Set(['USA', 'US'])

function formatCountryForDisplay(country: string | null | undefined): string {
  if (!country?.trim()) {
    return ''
  }
  const c = country.trim()
  return USA_LABELS.has(c) ? 'United States' : c
}

/** Single-line address for pending-change copy (matches product mock: street, city, ST zip, country). */
export function formatPendingHomeAddressLine(address: EmployeeAddress): string {
  const streetLine = [address.street1, address.street2].filter(Boolean).join(', ')
  const cityStateZip = [address.city, [address.state, address.zip].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ')
  const country = formatCountryForDisplay(address.country)

  return [streetLine, cityStateZip, country].filter(Boolean).join(', ')
}
