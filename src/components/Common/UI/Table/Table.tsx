import {
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  TableBody as AriaTableBody,
  Row,
  Column,
  Cell,
} from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { VisuallyHidden } from 'react-aria'
import classnames from 'classnames'
import { Checkbox } from '../Checkbox/Checkbox'
import type { TableProps } from './TableTypes'
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
              <Column key={index}>{column.title}</Column>
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
