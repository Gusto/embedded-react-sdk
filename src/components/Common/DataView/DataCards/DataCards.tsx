import { useId } from 'react'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import styles from './DataCards.module.scss'
import type { useDataViewPropReturn, SelectionMode } from '@/components/Common/DataView/useDataView'
import type {
  TableProps,
  TableSortDescriptor,
  TableSortDirection,
} from '@/components/Common/UI/Table/TableTypes'
import type { SelectOption } from '@/components/Common/UI/Select/SelectTypes'
import { useSelectionState } from '@/components/Common/DataView/useSelectionState'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/** @internal */
export type DataCardsProps<T> = {
  label: string
  columns: useDataViewPropReturn<T>['columns']
  data: useDataViewPropReturn<T>['data']
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: (item: T, checked: boolean) => void
  onSelectAll?: (checked: boolean, visibleData: T[]) => void
  getIsItemSelected?: (item: T) => boolean
  hideSelectAll?: useDataViewPropReturn<T>['hideSelectAll']
  emptyState?: useDataViewPropReturn<T>['emptyState']
  footer?: useDataViewPropReturn<T>['footer']
  selectionMode?: SelectionMode
  isWithinBox?: TableProps['isWithinBox']
  isFetching?: useDataViewPropReturn<T>['isFetching']
  sortDescriptor?: useDataViewPropReturn<T>['sortDescriptor']
  onSortChange?: useDataViewPropReturn<T>['onSortChange']
}

/** @internal */
export const DataCards = <T,>({
  label,
  data,
  columns,
  itemMenu,
  onSelect,
  onSelectAll,
  getIsItemSelected,
  hideSelectAll,
  emptyState,
  footer,
  selectionMode = 'multiple',
  isWithinBox,
  isFetching,
  sortDescriptor,
  onSortChange,
}: DataCardsProps<T>) => {
  const Components = useComponentContext()
  const { t } = useTranslation('common')
  const radioGroupName = useId()
  const { allSelected } = useSelectionState(data, getIsItemSelected)

  const sortDirections: TableSortDirection[] = ['ascending', 'descending']
  const sortOptions: SelectOption[] = []
  const sortOptionsByValue = new Map<string, TableSortDescriptor>()
  columns.forEach((column, index) => {
    // Options are labelled from the column title, so a column titled with a ReactNode
    // has nothing usable to show in the dropdown.
    if (!column.isSortable || typeof column.title !== 'string') return
    // Mirrors DataTable's header key, including its index-based fallback, so both
    // layouts report the same `columnKey` back to the consumer.
    const columnKey = typeof column.key === 'string' ? column.key : `header-${index}`
    const columnTitle = column.title
    sortDirections.forEach(direction => {
      const value = `${columnKey}:${direction}`
      sortOptions.push({
        value,
        label:
          direction === 'ascending'
            ? t('card.sortAscendingOption', { column: columnTitle })
            : t('card.sortDescendingOption', { column: columnTitle }),
      })
      sortOptionsByValue.set(value, { columnKey, direction })
    })
  })

  const renderAction = (item: T, index: number) => {
    if (!onSelect) return undefined

    const isSelected = getIsItemSelected?.(item) ?? false

    if (selectionMode === 'single') {
      return (
        <Components.Radio
          name={radioGroupName}
          value={isSelected}
          onChange={() => {
            onSelect(item, true)
          }}
          label={t('card.selectRowLabel')}
          shouldVisuallyHideLabel
        />
      )
    }

    return (
      <Components.Checkbox
        value={isSelected}
        onChange={(checked: boolean) => {
          onSelect(item, checked)
        }}
        label={t('card.selectRowLabel')}
        shouldVisuallyHideLabel
      />
    )
  }

  return (
    <div
      className={cn(styles.root, isWithinBox && styles.withinBox, isFetching && styles.isFetching)}
      data-testid="data-cards"
      aria-busy={Boolean(isFetching)}
    >
      {onSortChange && sortOptions.length > 0 && (
        <div className={styles.sortRow}>
          <Components.Select
            label={t('card.sortByLabel')}
            placeholder={t('card.sortByPlaceholder')}
            options={sortOptions}
            value={
              sortDescriptor ? `${sortDescriptor.columnKey}:${sortDescriptor.direction}` : null
            }
            onChange={value => {
              const nextSort = sortOptionsByValue.get(value)
              if (nextSort) {
                onSortChange(nextSort)
              }
            }}
          />
        </div>
      )}
      {onSelect &&
        getIsItemSelected &&
        selectionMode === 'multiple' &&
        !hideSelectAll &&
        data.length > 0 && (
          <div className={styles.selectAllRow}>
            <Components.Checkbox
              value={allSelected}
              onChange={(checked: boolean) => onSelectAll?.(checked, data)}
              label={t('card.selectAllRowsLabel')}
            />
          </div>
        )}
      <div role="list" aria-label={label}>
        {data.length === 0 && emptyState && (
          <div role="listitem">
            <Components.Card className={isWithinBox ? styles.flushCard : undefined}>
              {emptyState()}
            </Components.Card>
          </div>
        )}
        {data.map((item, index) => (
          <div role="listitem" key={index}>
            <Components.Card
              menu={itemMenu && itemMenu(item)}
              action={renderAction(item, index)}
              className={isWithinBox ? styles.flushCard : undefined}
            >
              {columns.map((column, colIndex) => (
                <Flex key={colIndex} flexDirection="column" gap={0}>
                  {column.title && <h5 className={styles.columnTitle}>{column.title}</h5>}
                  <div className={styles.columnData}>
                    {' '}
                    {column.render ? column.render(item) : String(item[column.key as keyof T])}
                  </div>
                </Flex>
              ))}
            </Components.Card>
          </div>
        ))}
        {footer && (
          <div role="listitem">
            <Components.Card className={isWithinBox ? styles.flushCard : undefined}>
              {(() => {
                const footerContent = footer()

                return columns.map((column, index) => {
                  const columnKey = typeof column.key === 'string' ? column.key : `column-${index}`
                  const content = footerContent[columnKey]
                  if (content === undefined || content === '') return null

                  const isRowLabel = index === 0

                  return (
                    <Flex key={columnKey} flexDirection="column" gap={0}>
                      {!isRowLabel && column.title && (
                        <h5 className={styles.columnTitle}>{column.title}</h5>
                      )}
                      <div className={cn(styles.footerItem, isRowLabel && styles.footerRowLabel)}>
                        {content}
                      </div>
                    </Flex>
                  )
                })
              })()}
            </Components.Card>
          </div>
        )}
      </div>
    </div>
  )
}
