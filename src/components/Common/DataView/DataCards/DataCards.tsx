import { useId } from 'react'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import styles from './DataCards.module.scss'
import type { useDataViewPropReturn, SelectionMode } from '@/components/Common/DataView/useDataView'
import type { TableProps } from '@/components/Common/UI/Table/TableTypes'
import type { SelectOption } from '@/components/Common/UI/Select/SelectTypes'
import { useSelectionState } from '@/components/Common/DataView/useSelectionState'
import { getSortControls } from '@/components/Common/DataView/getSortControls'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

// Sentinel for the "default order" option, kept clear of the `<columnKey>:<direction>` values.
const DEFAULT_ORDER_VALUE = 'none'

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

  const sortOptions: SelectOption[] = []
  const applySortByValue = new Map<string, () => void>()
  if (onSortChange) {
    sortOptions.push({ value: DEFAULT_ORDER_VALUE, label: t('card.sortDefaultOption') })
    applySortByValue.set(DEFAULT_ORDER_VALUE, () => {
      onSortChange(undefined)
    })
  }
  columns.forEach(column => {
    // Options are labelled from the column title, so a column titled with a ReactNode
    // has nothing usable to show in the dropdown.
    if (!column.isSortable || !onSortChange || typeof column.title !== 'string') return
    const controls = getSortControls(column.key, sortDescriptor, onSortChange)
    const columnTitle = column.title
    sortOptions.push(
      {
        value: `${column.key}:ascending`,
        label: t('card.sortAscendingOption', { column: columnTitle }),
      },
      {
        value: `${column.key}:descending`,
        label: t('card.sortDescendingOption', { column: columnTitle }),
      },
    )
    applySortByValue.set(`${column.key}:ascending`, controls.onSortAscending)
    applySortByValue.set(`${column.key}:descending`, controls.onSortDescending)
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
      {sortOptions.length > 1 && (
        <div className={styles.sortRow}>
          <Components.Select
            label={t('card.sortByLabel')}
            // A value is always selected -- unsorted data resolves to the default-order option.
            placeholder=""
            options={sortOptions}
            value={
              sortDescriptor
                ? `${sortDescriptor.columnKey}:${sortDescriptor.direction}`
                : DEFAULT_ORDER_VALUE
            }
            onChange={value => {
              applySortByValue.get(value)?.()
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
