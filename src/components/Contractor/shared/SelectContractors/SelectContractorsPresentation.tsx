import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { SelectContractorsPresentationProps } from './SelectContractorsPresentationTypes'
import styles from './SelectContractorsPresentation.module.scss'
import { DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { getContractorDisplayName } from '@/components/Contractor/shared/helpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import SearchIcon from '@/assets/icons/search-lg.svg?react'

/** @internal */
export function SelectContractorsPresentation({
  contractors,
  selectedIds,
  searchValue,
  onSelect,
  onSelectAll,
  onSearchChange,
  onSearchClear,
  pagination,
  isFetching,
  emptyStateTitle,
  emptyStateDescription,
}: SelectContractorsPresentationProps) {
  useI18n('Contractor.SelectContractors')
  const { t } = useTranslation('Contractor.SelectContractors')
  const Components = useComponentContext()
  const currencyFormatter = useNumberFormatter()

  const handleSearchChange = (value: string) => {
    onSearchChange(value)
    if (!value) onSearchClear()
  }

  const columns = useMemo(
    () => [
      {
        key: 'name' as keyof Contractor,
        title: t('nameColumn'),
        render: (contractor: Contractor) => (
          <Flex flexDirection="column" gap={0}>
            <Components.Text size="sm" weight="medium">
              {getContractorDisplayName(contractor)}
            </Components.Text>
            <Components.Text variant="supporting" size="sm">
              {contractor.type ?? '–'}
            </Components.Text>
          </Flex>
        ),
      },
      {
        key: 'wage' as keyof Contractor,
        title: t('wageColumn'),
        render: (contractor: Contractor) =>
          contractor.wageType === 'Hourly' && contractor.hourlyRate
            ? t('wageHourly', { rate: currencyFormatter(Number(contractor.hourlyRate)) })
            : (contractor.wageType ?? '–'),
      },
    ],
    [t, currencyFormatter, Components],
  )

  const dataViewProps = useDataView<Contractor>({
    data: contractors,
    columns,
    pagination,
    isFetching,
    selectionMode: 'multiple',
    onSelect,
    onSelectAll,
    getIsItemSelected: contractor => selectedIds.has(contractor.uuid),
    emptyState: () => (
      <EmptyData title={emptyStateTitle ?? t('emptyState')} description={emptyStateDescription} />
    ),
  })

  return (
    <div className={styles.root}>
      <div className={styles.searchContainer}>
        <Components.TextInput
          name="contractor-search"
          type="search"
          label={t('searchLabel')}
          shouldVisuallyHideLabel
          placeholder={t('searchPlaceholder')}
          value={searchValue}
          onChange={handleSearchChange}
          adornmentStart={<SearchIcon aria-hidden />}
        />
      </div>
      <DataView label={t('tableLabel')} {...dataViewProps} />
    </div>
  )
}
