import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Location } from '@gusto/embedded-api/models/components/location'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import ListIcon from '@/assets/icons/list.svg?react'
import { DataView, EmptyData, useDataView } from '@/components/Common'
import { Flex, FlexItem } from '@/components/Common/Flex/Flex'
import type { UseWorkAddressFormReady } from '@/components/Employee/Profile/shared/useWorkAddressForm'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { addDays, formatDateLongWithYear, normalizeToDate } from '@/helpers/dateFormatting'
import { addressInline, getCityStateZip, getStreet } from '@/helpers/formattedStrings'

export interface WorkAddressViewProps {
  workAddressForm: UseWorkAddressFormReady
}

function resolveLocation(
  row: EmployeeWorkAddress,
  companyLocations: Location[] | undefined,
): Location | undefined {
  if (!row.locationUuid || !companyLocations?.length) {
    return undefined
  }
  return companyLocations.find(loc => loc.uuid === row.locationUuid)
}

function formatWorkAddressLines(
  row: EmployeeWorkAddress,
  companyLocations: Location[] | undefined,
): { primary: string; secondary: string } {
  const location = resolveLocation(row, companyLocations)
  if (location) {
    const street = getStreet(location).trim()
    const locality = getCityStateZip(location).trim()
    return { primary: street, secondary: locality }
  }
  const street = getStreet(row).trim()
  const locality = getCityStateZip(row).trim()
  return { primary: street, secondary: locality }
}

export function WorkAddressView({ workAddressForm }: WorkAddressViewProps) {
  const { t } = useTranslation('Employee.WorkAddress.Management')
  const Components = useComponentContext()

  const {
    data: { workAddress, workAddresses, companyLocations },
  } = workAddressForm

  const chronologicalAsc = useMemo(() => {
    return [...(workAddresses ?? [])].sort((a, b) => {
      const aDate = a.effectiveDate ?? ''
      const bDate = b.effectiveDate ?? ''
      if (!aDate && !bDate) return 0
      if (!aDate) return 1
      if (!bDate) return -1
      return aDate.localeCompare(bDate)
    })
  }, [workAddresses])

  const historyAddresses = useMemo(
    () => chronologicalAsc.filter(address => address.active !== true),
    [chronologicalAsc],
  )

  const sortedHistory = useMemo(() => [...historyAddresses].reverse(), [historyAddresses])

  const historyEndDate = (row: EmployeeWorkAddress) => {
    const idx = chronologicalAsc.findIndex(a => a.uuid === row.uuid)
    if (idx === -1 || idx >= chronologicalAsc.length - 1) return '—'
    const nextStart = chronologicalAsc[idx + 1]?.effectiveDate
    if (!nextStart) return '—'
    const nextDate = normalizeToDate(nextStart)
    if (!nextDate) return '—'
    const endDate = addDays(nextDate, -1)
    const y = endDate.getFullYear()
    const m = String(endDate.getMonth() + 1).padStart(2, '0')
    const d = String(endDate.getDate()).padStart(2, '0')
    return formatDateLongWithYear(`${y}-${m}-${d}`)
  }

  const historyDataView = useDataView({
    data: sortedHistory,
    columns: [
      {
        title: t('columns.location'),
        render: (row: EmployeeWorkAddress) => {
          const location = resolveLocation(row, companyLocations)
          const lines = formatWorkAddressLines(row, companyLocations)
          return (
            <Flex flexDirection="column" gap={0}>
              <Components.Text weight="medium">
                {location ? addressInline(location) : lines.primary}
              </Components.Text>
              {!location && lines.secondary ? (
                <Components.Text variant="supporting">{lines.secondary}</Components.Text>
              ) : null}
            </Flex>
          )
        },
      },
      {
        title: t('columns.startDate'),
        render: (row: EmployeeWorkAddress) =>
          row.effectiveDate ? formatDateLongWithYear(row.effectiveDate) : '—',
      },
      {
        title: t('columns.endDate'),
        render: (row: EmployeeWorkAddress) => historyEndDate(row),
      },
    ],
    emptyState: () => (
      <div data-testid="work-address-history-empty">
        <EmptyData
          icon={<ListIcon aria-hidden />}
          title={t('historyEmptyTitle')}
          description={t('historyEmptyDescription')}
        />
      </div>
    ),
  })

  const currentLines = workAddress
    ? formatWorkAddressLines(workAddress, companyLocations)
    : null
  const currentLocation =
    workAddress && companyLocations ? resolveLocation(workAddress, companyLocations) : undefined

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={8} alignItems="flex-start">
        <Components.Heading as="h1">{t('title')}</Components.Heading>
        <Components.Text variant="supporting">{t('description')}</Components.Text>
      </Flex>

      <Components.Box
        header={<Components.BoxHeader title={t('currentSectionTitle')} />}
      >
        <Flex flexDirection="column" gap={16}>
          {workAddress && currentLines ? (
            <Flex flexDirection="column" gap={4}>
              <FlexItem>
                {currentLocation ? (
                  <Components.Text weight="medium">{addressInline(currentLocation)}</Components.Text>
                ) : (
                  <>
                    <Components.Text weight="medium">{currentLines.primary}</Components.Text>
                    <Components.Text weight="medium">{currentLines.secondary}</Components.Text>
                  </>
                )}
              </FlexItem>
              {workAddress.effectiveDate ? (
                <Components.Text variant="supporting">
                  {t('currentSince', {
                    date: formatDateLongWithYear(workAddress.effectiveDate),
                  })}
                </Components.Text>
              ) : null}
            </Flex>
          ) : (
            <Components.Text>{t('currentEmpty')}</Components.Text>
          )}
        </Flex>
      </Components.Box>

      <Flex flexDirection="column" gap={12}>
        <Components.Heading as="h2">{t('historySectionTitle')}</Components.Heading>
        <DataView label={t('historySectionTitle')} {...historyDataView} />
      </Flex>
    </Flex>
  )
}
