import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { HolidayItem, SelectHolidaysPresentationProps } from './SelectHolidaysTypes'
import { DataView, Flex, ActionsLayout, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

export function SelectHolidaysPresentation({
  holidays,
  selectedHolidayUuids,
  onSelectionChange,
  onContinue,
  onBack,
}: SelectHolidaysPresentationProps) {
  useI18n('Company.TimeOff.HolidayPolicy')
  const { t } = useTranslation('Company.TimeOff.HolidayPolicy')
  const { Heading, Text, Button } = useComponentContext()

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
    selectionMode: 'multiple',
    onSelect: onSelectionChange,
    isItemSelected: (item: HolidayItem) => selectedHolidayUuids.has(item.uuid),
  })

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={4}>
        <Heading as="h2">{t('title')}</Heading>
        <Text variant="supporting">{t('description')}</Text>
      </Flex>

      <DataView label={t('tableLabel')} {...dataViewProps} />

      <ActionsLayout>
        <Button variant="secondary" onClick={onBack}>
          {t('backCta')}
        </Button>
        <Button variant="primary" onClick={onContinue}>
          {t('continueCta')}
        </Button>
      </ActionsLayout>
    </Flex>
  )
}
