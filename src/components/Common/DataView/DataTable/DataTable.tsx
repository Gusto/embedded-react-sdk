import { useTranslation } from 'react-i18next'
import type { useDataViewPropReturn } from '../useDataView'
import type { TableData, TableRow } from '../../UI/Table/TableTypes'
import { VisuallyHidden } from '../../VisuallyHidden'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type DataTableProps<T> = {
  label: string
  columns: useDataViewPropReturn<T>['columns']
  data: useDataViewPropReturn<T>['data']
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: useDataViewPropReturn<T>['onSelect']
  emptyState?: useDataViewPropReturn<T>['emptyState']
}

function getCellContent<T>(
  item: T,
  column: { key?: string | keyof T; render?: (item: T) => React.ReactNode },
) {
  if (column.render) {
    return column.render(item)
  }

  if (column.key) {
    const key = column.key as keyof T
    return String(item[key] ?? '')
  }

  return ''
}

export const DataTable = <T,>({
  label,
  data,
  columns,
  itemMenu,
  onSelect,
  emptyState,
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
    ...columns.map((column, index) => ({
      key: typeof column.key === 'string' ? column.key : `header-${index}`,
      content: column.title,
    })),
    ...(itemMenu
      ? [
          {
            key: 'actions-header',
            content: <VisuallyHidden>{t('table.actionsColumnHeader')}</VisuallyHidden>,
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
        return {
          key: typeof column.key === 'string' ? column.key : `cell-${colIndex}`,
          content: getCellContent(item, column),
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
    ]

    return {
      key: `row-${rowIndex}`,
      data: rowData,
    }
  })

  return (
    <Components.Table
      aria-label={label}
      data-testid="data-table"
      headers={headers}
      rows={rows}
      emptyState={emptyState ? emptyState() : undefined}
    />
  )
}
