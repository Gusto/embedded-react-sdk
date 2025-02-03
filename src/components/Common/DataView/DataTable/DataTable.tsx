import { Table, TableHeader, Column, Row, Cell, TableBody } from 'react-aria-components'
import { useDataViewPropReturn } from '@/components/Common/DataView/useDataView'
import { VisuallyHidden } from 'react-aria'
import { DisconnectedCheckbox } from '@/components/Common'
import { useTranslation } from 'react-i18next'

export type DataTableProps<T> = {
  label: string
  columns: useDataViewPropReturn<T>['columns']
  data: useDataViewPropReturn<T>['data']
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: useDataViewPropReturn<T>['onSelect']
}

export const DataTable = <T,>({ label, data, columns, itemMenu, onSelect }: DataTableProps<T>) => {
  const { t } = useTranslation('common')

  return (
    <Table aria-label={label}>
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
      <TableBody>
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
                {column.render ? column.render(item) : String(item[column.key])}
              </Cell>
            ))}
            {itemMenu && <Cell>{itemMenu(item)}</Cell>}
          </Row>
        ))}
      </TableBody>
    </Table>
  )
}
