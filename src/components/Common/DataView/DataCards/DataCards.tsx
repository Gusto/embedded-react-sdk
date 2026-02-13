import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './DataCards.module.scss'
import type { useDataViewPropReturn, SelectionMode } from '@/components/Common/DataView/useDataView'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type DataCardsProps<T> = {
  columns: useDataViewPropReturn<T>['columns']
  data: useDataViewPropReturn<T>['data']
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: useDataViewPropReturn<T>['onSelect']
  isItemSelected?: useDataViewPropReturn<T>['isItemSelected']
  emptyState?: useDataViewPropReturn<T>['emptyState']
  footer?: useDataViewPropReturn<T>['footer']
  selectionMode?: SelectionMode
}

export const DataCards = <T,>({
  data,
  columns,
  itemMenu,
  onSelect,
  isItemSelected,
  emptyState,
  footer,
  selectionMode = 'multiple',
}: DataCardsProps<T>) => {
  const Components = useComponentContext()
  const { t } = useTranslation('common')
  const radioGroupName = useId()

  const renderAction = (item: T, index: number) => {
    if (!onSelect) return undefined

    const isSelected = isItemSelected?.(item, index) ?? false

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
    <div role="list" data-testid="data-cards">
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

              return Object.entries(footerContent).map(([key, content]) => (
                <div key={key} className={styles.footerItem}>
                  {content}
                </div>
              ))
            })()}
          </Components.Card>
        </div>
      )}
    </div>
  )
}
