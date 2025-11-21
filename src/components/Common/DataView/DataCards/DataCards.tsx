import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { getColumnContent } from '../getColumnContent'
import { getFooterContent } from '../getFooterContent'
import { DataViewActions } from '../DataActions/DataViewActions'
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
  rowActions?: useDataViewPropReturn<T>['rowActions']
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
  rowActions,
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
      {data.map((item, index) => {
        const inlineMenu = itemMenu?.(item)
        const actionButtons = rowActions?.buttons?.(item) ?? []
        const actionMenu = rowActions?.menuItems?.(item) ?? null

        const cardMenu =
          inlineMenu || actionMenu ? (
            <div className={styles.menuWrapper}>
              {actionMenu && <DataViewActions actions={[actionMenu]} orientation="row" />}
              {inlineMenu}
            </div>
          ) : undefined

        return (
          <div role="listitem" key={index}>
            <Components.Card menu={cardMenu} action={renderAction(item, index)}>
              {columns.map((column, colIndex) => {
                const { primary, secondary } = getColumnContent(item, column)
                return (
                  <Flex key={colIndex} flexDirection="column" gap={2}>
                    {column.title && <h5 className={styles.columnTitle}>{column.title}</h5>}
                    <div className={styles.columnData}>
                      <div className={styles.columnPrimary}>{primary}</div>
                      {secondary !== undefined && (
                        <div className={styles.columnSecondary}>{secondary}</div>
                      )}
                    </div>
                  </Flex>
                )
              })}
              {actionButtons.length > 0 && (
                <Flex flexDirection="column" gap={2}>
                  <div className={styles.columnData}>
                    <DataViewActions actions={actionButtons} orientation="column" />
                  </div>
                </Flex>
              )}
            </Components.Card>
          </div>
        )
      })}
      {footer && (
        <div role="listitem">
          <Components.Card>
            {(() => {
              const footerContent = footer()

              return Object.entries(footerContent).map(([key, content]) => {
                const { primary, secondary } = getFooterContent(content)
                return (
                  <div key={key} className={styles.footerItem}>
                    <div>{primary}</div>
                    {secondary !== undefined && (
                      <div className={styles.footerSecondary}>{secondary}</div>
                    )}
                  </div>
                )
              })
            })()}
          </Components.Card>
        </div>
      )}
    </div>
  )
}
