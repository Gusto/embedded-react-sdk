import {
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  TableBody as AriaTableBody,
  Row,
  Column,
  Cell,
} from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import classnames from 'classnames'
import { VisuallyHidden } from '../../VisuallyHidden'
import { Checkbox } from '../Checkbox/Checkbox'
import type { TableProps, TableColumn } from './TableTypes'
import styles from './Table.module.scss'

export function Table<T>({
  data,
  columns,
  className,
  emptyState,
  onSelect,
  itemMenu,
  ...props
}: TableProps<T>) {
  const { t } = useTranslation('common')

  // Check if at least one column has isRowHeader set to true
  const hasRowHeader = columns.some(column => column.isRowHeader)

  // We'll use this to determine if a column should be a row header
  const getIsRowHeader = (column: TableColumn<T>, index: number): boolean => {
    // If column already has isRowHeader defined, use that
    if (column.isRowHeader !== undefined) {
      return column.isRowHeader
    }

    // If no column has isRowHeader set, use the first column
    if (!hasRowHeader && index === 0) {
      return true
    }

    return false
  }

  const getCellContent = (
    item: T,
    column: { key?: string | keyof T; render?: (item: T) => React.ReactNode },
  ) => {
    if (column.render) {
      return column.render(item)
    }

    if (column.key) {
      const key = column.key as keyof T
      return String(item[key] ?? '')
    }

    return ''
  }

  return (
    <div className={styles.root}>
      <AriaTable {...props} className={classnames('react-aria-Table', className)}>
        <AriaTableHeader>
          <Row>
            {onSelect && (
              <Column>
                <VisuallyHidden>{t('table.selectRowHeader')}</VisuallyHidden>
              </Column>
            )}
            {columns.map((column, index) => (
              <Column key={index} isRowHeader={getIsRowHeader(column, index)}>
                {column.title}
              </Column>
            ))}
            {itemMenu && (
              <Column>
                <VisuallyHidden>{t('table.actionsColumnHeader')}</VisuallyHidden>
              </Column>
            )}
          </Row>
        </AriaTableHeader>
        <AriaTableBody>
          {data.length === 0 && emptyState ? (
            <Row>
              <Cell colSpan={columns.length + (onSelect ? 1 : 0) + (itemMenu ? 1 : 0)}>
                {emptyState()}
              </Cell>
            </Row>
          ) : (
            data.map((item, rowIndex) => (
              <Row key={rowIndex}>
                {onSelect && (
                  <Cell>
                    <Checkbox
                      onChange={(checked: boolean) => {
                        onSelect(item, checked)
                      }}
                      label={t('table.selectRowLabel')}
                      shouldVisuallyHideLabel
                    />
                  </Cell>
                )}
                {columns.map((column, colIndex) => (
                  <Cell key={colIndex}>{getCellContent(item, column)}</Cell>
                ))}
                {itemMenu && <Cell>{itemMenu(item)}</Cell>}
              </Row>
            ))
          )}
        </AriaTableBody>
      </AriaTable>
    </div>
  )
}
