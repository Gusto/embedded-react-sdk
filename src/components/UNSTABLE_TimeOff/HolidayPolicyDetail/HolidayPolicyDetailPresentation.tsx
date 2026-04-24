import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { HolidayItem } from '../HolidaySelectionForm/HolidaySelectionFormTypes'
import { PolicyDetailLayout } from '../shared/PolicyDetailLayout'
import type { HolidayPolicyDetailPresentationProps } from './HolidayPolicyDetailTypes'
import { DataView, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

const HOLIDAYS_TAB_ID = 'holidays'

export function HolidayPolicyDetailPresentation({
  title,
  subtitle,
  onBack,
  backLabel,
  actions,
  holidays,
  selectedTabId,
  onTabChange,
  employees,
  removeDialog,
  successAlert,
  onDismissAlert,
}: HolidayPolicyDetailPresentationProps) {
  useI18n('Company.TimeOff.HolidayPolicy')
  const { t } = useTranslation('Company.TimeOff.HolidayPolicy')

  const holidaysTabContent = <HolidaysTab holidays={holidays} />

  return (
    <PolicyDetailLayout
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      backLabel={backLabel}
      actions={actions}
      firstTab={{
        id: HOLIDAYS_TAB_ID,
        label: t('tabs.holidays'),
        content: holidaysTabContent,
      }}
      selectedTabId={selectedTabId}
      onTabChange={onTabChange}
      employees={employees}
      removeDialog={removeDialog}
      successAlert={successAlert}
      onDismissAlert={onDismissAlert}
    />
  )
}

function HolidaysTab({ holidays }: { holidays: HolidayItem[] }) {
  useI18n('Company.TimeOff.HolidayPolicy')
  const { t } = useTranslation('Company.TimeOff.HolidayPolicy')
  const { Text, Box, BoxHeader } = useComponentContext()

  const columns = useMemo(
    () => [
      {
        key: 'name' as keyof HolidayItem,
        title: t('tableHeaders.holidayName'),
        render: (item: HolidayItem) => <Text weight="medium">{item.name}</Text>,
      },
      {
        key: 'observedDate' as keyof HolidayItem,
        title: t('tableHeaders.observedDate'),
        render: (item: HolidayItem) => <Text variant="supporting">{item.observedDate}</Text>,
      },
      {
        key: 'nextObservation' as keyof HolidayItem,
        title: t('tableHeaders.nextObservation'),
        render: (item: HolidayItem) => <Text variant="supporting">{item.nextObservation}</Text>,
      },
    ],
    [t, Text],
  )

  const dataViewProps = useDataView<HolidayItem>({
    data: holidays,
    columns,
  })

  return (
    <Box header={<BoxHeader title={t('show.holidaySchedule')} />} withPadding={false}>
      <DataView label={t('tableLabel')} {...dataViewProps} />
    </Box>
  )
}
