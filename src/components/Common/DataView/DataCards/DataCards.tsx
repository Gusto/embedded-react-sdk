import { getColumnContent } from '../getColumnContent'
import { getFooterContent } from '../getFooterContent'
import { DataViewActions } from '../DataActions/DataViewActions'
import styles from './DataCards.module.scss'
import type { useDataViewPropReturn } from '@/components/Common/DataView/useDataView'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type DataCardsProps<T> = {
  columns: useDataViewPropReturn<T>['columns']
  data: useDataViewPropReturn<T>['data']
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: useDataViewPropReturn<T>['onSelect']
  emptyState?: useDataViewPropReturn<T>['emptyState']
  footer?: useDataViewPropReturn<T>['footer']
  rowActions?: useDataViewPropReturn<T>['rowActions']
}

export const DataCards = <T,>({
  data,
  columns,
  itemMenu,
  onSelect,
  emptyState,
  footer,
  rowActions,
}: DataCardsProps<T>) => {
  const Components = useComponentContext()
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
            <Components.Card
              menu={cardMenu}
              onSelect={
                onSelect
                  ? (checked: boolean) => {
                      onSelect(item, checked)
                    }
                  : undefined
              }
            >
              {columns.map((column, index) => {
                const { primary, secondary } = getColumnContent(item, column)

                return (
                  <Flex key={index} flexDirection="column" gap={2}>
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

              // Footer content is always an object with column keys
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
