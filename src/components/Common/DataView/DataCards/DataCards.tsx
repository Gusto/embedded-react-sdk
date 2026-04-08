import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './DataCards.module.scss'
import type { useDataViewPropReturn, SelectionMode } from '@/components/Common/DataView/useDataView'
import { useSelectionState } from '@/components/Common/DataView/useSelectionState'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type DataCardsProps<T> = {
  label: string
  columns: useDataViewPropReturn<T>['columns']
  data: useDataViewPropReturn<T>['data']
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: (item: T, checked: boolean, index: number) => void
  onSelectAll?: (checked: boolean, visibleData: T[]) => void
  isItemSelected?: useDataViewPropReturn<T>['isItemSelected']
  emptyState?: useDataViewPropReturn<T>['emptyState']
  footer?: useDataViewPropReturn<T>['footer']
  selectionMode?: SelectionMode
}

export const DataCards = <T,>({
  label,
  data,
  columns,
  itemMenu,
  onSelect,
  onSelectAll,
  isItemSelected,
  emptyState,
  footer,
  selectionMode = 'multiple',
}: DataCardsProps<T>) => {
  const Components = useComponentContext()
  const { t } = useTranslation('common')
  const radioGroupName = useId()
  const { allSelected } = useSelectionState(data, isItemSelected)

  if (
    process.env.NODE_ENV !== 'production' &&
    onSelect &&
    selectionMode === 'multiple' &&
    !isItemSelected
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      'DataCards: onSelect with selectionMode="multiple" requires isItemSelected for the select-all checkbox to work. ' +
        'Provide isItemSelected or set selectionMode="single".',
    )
  }

  const renderAction = (item: T, index: number) => {
    if (!onSelect) return undefined

    const isSelected = isItemSelected?.(item, index) ?? false

    if (selectionMode === 'single') {
      return (
        <Components.Radio
          name={radioGroupName}
          value={isSelected}
          onChange={() => {
            onSelect(item, true, index)
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
          onSelect(item, checked, index)
        }}
        label={t('card.selectRowLabel')}
        shouldVisuallyHideLabel
      />
    )
  }

  return (
    <div data-testid="data-cards">
      {onSelect && isItemSelected && selectionMode === 'multiple' && data.length > 0 && (
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
            <Components.Card>{emptyState()}</Components.Card>
          </div>
        )}
        {data.map((item, index) => (
          <div role="listitem" key={index}>
            <Components.Card menu={itemMenu && itemMenu(item)} action={renderAction(item, index)}>
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
            <Components.Card>
              {(() => {
                const footerContent = footer()

                return Object.entries(footerContent).map(([key, content]) => {
                  const columnIndex = key.startsWith('column-')
                    ? parseInt(key.replace('column-', ''), 10)
                    : -1
                  const columnTitle = columnIndex >= 0 ? columns[columnIndex]?.title : undefined

                  return (
                    <Flex key={key} flexDirection="column" gap={0}>
                      {columnTitle && <h5 className={styles.columnTitle}>{columnTitle}</h5>}
                      <div className={styles.footerItem}>{content}</div>
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
