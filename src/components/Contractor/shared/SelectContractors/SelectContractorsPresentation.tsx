import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { SelectContractorsPresentationProps } from './SelectContractorsPresentationTypes'
import styles from './SelectContractorsPresentation.module.scss'
import { DataView, EmptyData, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { getContractorDisplayName } from '@/components/Contractor/shared/helpers'
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
}: SelectContractorsPresentationProps) {
  useI18n('Contractor.SelectContractors')
  const { t } = useTranslation('Contractor.SelectContractors')
  const Components = useComponentContext()

  const handleSearchChange = (value: string) => {
    onSearchChange(value)
    if (!value) onSearchClear()
  }

  const columns = useMemo(
    () => [
      {
        key: 'name' as keyof Contractor,
        title: t('nameColumn'),
        render: (contractor: Contractor) => getContractorDisplayName(contractor),
      },
    ],
    [t],
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
    emptyState: () => <EmptyData title={t('emptyState')} />,
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
