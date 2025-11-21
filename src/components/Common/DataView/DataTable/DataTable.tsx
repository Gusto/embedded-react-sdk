import { useTranslation } from 'react-i18next'
import type { useDataViewPropReturn } from '../useDataView'
import type { TableData, TableRow, TableProps } from '../../UI/Table/TableTypes'
import { VisuallyHidden } from '../../VisuallyHidden'
import { getColumnContent } from '../getColumnContent'
import { DataViewActions } from '../DataActions/DataViewActions'
import { getFooterContent } from '../getFooterContent'
import styles from './DataTable.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type DataTableProps<T> = {
  label: string
  columns: useDataViewPropReturn<T>['columns']
  data: useDataViewPropReturn<T>['data']
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: useDataViewPropReturn<T>['onSelect']
  emptyState?: useDataViewPropReturn<T>['emptyState']
  footer?: useDataViewPropReturn<T>['footer']
  rowActions?: useDataViewPropReturn<T>['rowActions']
  variant?: TableProps['variant']
}

export const DataTable = <T,>({
  label,
  data,
  columns,
  itemMenu,
  onSelect,
  emptyState,
  footer,
  rowActions,
  variant,
}: DataTableProps<T>) => {
  const Components = useComponentContext()
  const { t } = useTranslation('common')

  const headers: TableData[] = [
    ...(onSelect
      ? [
          {
            key: 'select-header',
            content: <VisuallyHidden>{t('table.selectRowHeader')}</VisuallyHidden>,
          },
        ]
      : []),
    ...columns.map((column, index) => {
      const alignment = column.align ?? 'left'
      return {
        key: typeof column.key === 'string' ? column.key : `header-${index}`,
        content: (
          <div className={styles.headerCell} data-align={alignment}>
            {column.title}
          </div>
        ),
      }
    }),
    ...(itemMenu
      ? [
          {
            key: 'actions-header',
            content: <VisuallyHidden>{t('table.actionsColumnHeader')}</VisuallyHidden>,
          },
        ]
      : []),
    ...(rowActions
      ? [
          {
            key: 'row-actions-header',
            content: (
              <div className={styles.headerCell} data-align={rowActions.align ?? 'right'}>
                {rowActions.header || ''}
              </div>
            ),
          },
        ]
      : []),
  ]

  const rows: TableRow[] = data.map((item, rowIndex) => {
    const rowData: TableData[] = [
      ...(onSelect
        ? [
            {
              key: `select-${rowIndex}`,
              content: (
                <Components.Checkbox
                  onChange={(checked: boolean) => {
                    onSelect(item, checked)
                  }}
                  label={t('table.selectRowLabel')}
                  shouldVisuallyHideLabel
                />
              ),
            },
          ]
        : []),
      ...columns.map((column, colIndex) => {
        const alignment = column.align ?? 'left'
        const { primary, secondary } = getColumnContent(item, column)
        const cellContent =
          secondary !== undefined ? (
            <div className={styles.cellContent}>
              <div>{primary}</div>
              <div className={styles.cellSecondary}>{secondary}</div>
            </div>
          ) : (
            primary
          )

        return {
          key: typeof column.key === 'string' ? column.key : `cell-${colIndex}`,
          content: (
            <div className={styles.cellWrapper} data-align={alignment}>
              {cellContent}
            </div>
          ),
        }
      }),
      ...(itemMenu
        ? [
            {
              key: `menu-${rowIndex}`,
              content: itemMenu(item),
            },
          ]
        : []),
      ...(rowActions
        ? [
            {
              key: `row-actions-${rowIndex}`,
              content: (
                <div className={styles.cellWrapper} data-align={rowActions.align ?? 'right'}>
                  <DataViewActions
                    actions={[
                      ...(rowActions.buttons?.(item) ?? []),
                      ...(rowActions.menuItems?.(item) ? [rowActions.menuItems(item)!] : []),
                    ]}
                    orientation="row"
                  />
                </div>
              ),
            },
          ]
        : []),
    ]

    return {
      key: `row-${rowIndex}`,
      data: rowData,
    }
  })

  const buildFooterData = () => {
    if (!footer) return undefined

    const footerContent = footer()
    const footerCells: TableData[] = []

    // Add select column footer (empty)
    if (onSelect) {
      footerCells.push({
        key: 'footer-select',
        content: '',
      })
    }

    // Add data column footers
    columns.forEach((column, index) => {
      const columnKey = typeof column.key === 'string' ? column.key : `column-${index}`
      const alignment = column.align ?? 'left'
      const footerValue = footerContent[columnKey]
      const { primary: footerPrimary, secondary: footerSecondary } = getFooterContent(footerValue)

      footerCells.push({
        key: `footer-${columnKey}`,
        content: (
          <div className={styles.footerCell} data-align={alignment}>
            <div>{footerPrimary}</div>
            {footerSecondary !== undefined && (
              <div className={styles.footerSecondary}>{footerSecondary}</div>
            )}
          </div>
        ),
      })
    })

    // Add actions column footer (empty)
    if (itemMenu) {
      footerCells.push({
        key: 'footer-actions',
        content: <div className={styles.footerCell} data-align="left" />,
      })
    }

    if (rowActions) {
      footerCells.push({
        key: 'footer-row-actions',
        content: <div className={styles.footerCell} data-align={rowActions.align ?? 'right'} />,
      })
    }

    return footerCells
  }

  const footerData = buildFooterData()

  return (
    <Components.Table
      aria-label={label}
      data-testid="data-table"
      headers={headers}
      rows={rows}
      footer={footerData}
      emptyState={emptyState ? emptyState() : undefined}
      variant={variant}
      hasCheckboxColumn={!!onSelect}
    />
  )
}
