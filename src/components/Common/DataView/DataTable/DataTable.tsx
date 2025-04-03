import { Table, TableHeader, Column, Row, Cell, TableBody } from 'react-aria-components'
import { VisuallyHidden } from 'react-aria'
import { useTranslation } from 'react-i18next'
import type { useDataViewPropReturn } from '@/components/Common/DataView/useDataView'
import { DisconnectedCheckbox } from '@/components/Common'

export type DataTableProps<T> = {
  label: string
  columns: useDataViewPropReturn<T>['columns']
  data: useDataViewPropReturn<T>['data']
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: useDataViewPropReturn<T>['onSelect']
  emptyState?: useDataViewPropReturn<T>['emptyState']
}

export const DataTable = <T,>({
  label,
  data,
  columns,
  itemMenu,
  onSelect,
  emptyState,
}: DataTableProps<T>) => {
  const { t } = useTranslation('common')

  return (
    <Table aria-label={label} data-testid="data-table">
      <TableHeader>
        <Row>
          {onSelect && (
            <Column>
              <VisuallyHidden>{t('table.selectRowHeader')}</VisuallyHidden>
            </Column>
          )}
          {columns.map((column, index) => (
            <Column isRowHeader={index === 0 && true} key={index}>
              {column.title}
            </Column>
          ))}
          {itemMenu && (
            // TODO: Need to bring in localization for strings
            <Column>
              <VisuallyHidden>{t('table.actionsColumnHeader')}</VisuallyHidden>
            </Column>
          )}
        </Row>
      </TableHeader>
      <TableBody renderEmptyState={emptyState}>
        {data.map((item, index) => (
          <Row key={index}>
            {onSelect && (
              <Cell>
                <DisconnectedCheckbox
                  onChange={() => {
                    onSelect(item)
                  }}
                >
                  <VisuallyHidden>Select row</VisuallyHidden>
                </DisconnectedCheckbox>
              </Cell>
            )}
            {columns.map((column, index) => (
              <Cell key={index}>
                {column.render ? column.render(item) : String(item[column.key as keyof T])}
              </Cell>
            ))}
            {itemMenu && <Cell>{itemMenu(item)}</Cell>}
          </Row>
        ))}
      </TableBody>
    </Table>
  )
}
