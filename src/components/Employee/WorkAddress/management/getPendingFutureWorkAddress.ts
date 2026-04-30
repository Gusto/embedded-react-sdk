import type { Location } from '@gusto/embedded-api/models/components/location'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { normalizeToDate } from '@/helpers/dateFormatting'
import { addressInline } from '@/helpers/formattedStrings'

const startOfLocalDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export function getPendingFutureWorkAddress(
  addresses: EmployeeWorkAddress[] | undefined,
  now: Date = new Date(),
): EmployeeWorkAddress | undefined {
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
    const parsed = normalizeToDate(raw)
    if (!parsed) {
      return false
    }
    return startOfLocalDay(parsed) > todayStart
  })

  if (pending.length === 0) {
    return undefined
  }

  pending.sort((a, b) => {
    const as = a.effectiveDate ?? ''
    const bs = b.effectiveDate ?? ''
    return as.localeCompare(bs)
  })

  return pending[0]
}

export function formatPendingWorkAddressLine(
  address: EmployeeWorkAddress,
  companyLocations: Location[] | undefined,
): string {
  if (address.locationUuid && companyLocations?.length) {
    const location = companyLocations.find(loc => loc.uuid === address.locationUuid)
    if (location) {
      return addressInline(location)
    }
  }
  const streetLine = [address.street1, address.street2].filter(Boolean).join(', ')
  const cityStateZip = [address.city, [address.state, address.zip].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ')
  const country = address.country.trim()
  return [streetLine, cityStateZip, country].filter(Boolean).join(', ')
}
