import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { EmployeeTableItem, EmployeeTableProps } from './EmployeeTableTypes'
import styles from './EmployeeTable.module.scss'
import { DataView, useDataView } from '@/components/Common'
import type { useDataViewProp } from '@/components/Common/DataView/useDataView'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n/I18n'
import { firstLastName } from '@/helpers/formattedStrings'
import SearchIcon from '@/assets/icons/search-lg.svg?react'
import CloseIcon from '@/assets/icons/close.svg?react'

export function EmployeeTable<T extends EmployeeTableItem>({
  data,
  label,
  additionalColumns = [],
  searchValue,
  onSearchChange,
  onSearchClear,
  searchPlaceholder,
  selectionMode,
  onSelect,
  getIsItemSelected,
  itemMenu,
  pagination,
  isFetching,
  emptyState,
  emptySearchState,
  footer,
}: EmployeeTableProps<T>) {
  useI18n('Company.TimeOff.EmployeeTable')
  const { t } = useTranslation('Company.TimeOff.EmployeeTable')
  const Components = useComponentContext()

  const isSearchWithNoResults = searchValue.length > 0 && data.length === 0
  const hasActiveSearch = searchValue.length > 0

  const defaultEmptySearch = useMemo(() => {
    const noSearchResults = t('noSearchResults')
    return function EmptySearchFallback() {
      return <DefaultEmptySearchState message={noSearchResults} />
    }
  }, [t])

  const resolvedEmptyState = useMemo(() => {
    if (isSearchWithNoResults && emptySearchState) {
      return emptySearchState
    }
    if (isSearchWithNoResults) {
      return defaultEmptySearch
    }
    return emptyState
  }, [isSearchWithNoResults, emptySearchState, emptyState, defaultEmptySearch])

  const columns = useMemo(
    () => [
      {
        key: 'name',
        title: t('name'),
        render: (item: T) => (
          <span id={`employee-name-${item.uuid}`}>
            {firstLastName({
              first_name: item.firstName,
              last_name: item.lastName,
            })}
          </span>
        ),
      },
      {
        key: 'jobTitle' as keyof T,
        title: t('jobTitle'),
        render: (item: T) => item.jobTitle ?? '',
      },
      ...additionalColumns,
    ],
    [t, additionalColumns],
  )

  const dataViewProps = useDataView<T>({
    data,
    columns,
    itemMenu,
    pagination,
    isFetching,
    emptyState: resolvedEmptyState,
    footer,
    ...(onSelect && { selectionMode, onSelect, getIsItemSelected }),
  } as useDataViewProp<T>)

  return (
    <div className={styles.root} data-has-menu={itemMenu ? true : undefined}>
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <Components.TextInput
            name="employee-search"
            type="search"
            label={t('searchLabel')}
            shouldVisuallyHideLabel
            placeholder={searchPlaceholder ?? t('searchPlaceholder')}
            value={searchValue}
            onChange={onSearchChange}
            adornmentStart={<SearchIcon aria-hidden />}
          />
          {hasActiveSearch && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={onSearchClear}
              aria-label={t('clearSearch')}
            >
              <CloseIcon aria-hidden />
            </button>
          )}
        </div>
      </div>
      <DataView label={label ?? t('tableLabel')} {...dataViewProps} />
    </div>
  )
}

function DefaultEmptySearchState({ message }: { message: string }) {
  const { Text } = useComponentContext()
  return <Text>{message}</Text>
}
