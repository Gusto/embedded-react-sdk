import {
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  TableBody as AriaTableBody,
  Row,
  Column,
  Cell,
} from 'react-aria-components'
import classnames from 'classnames'
import type { TableProps } from './TableTypes'
import styles from './Table.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Table({
  className,
  headers,
  rows,
  footer,
  emptyState,
  hasCheckboxColumn,
  ...props
}: TableProps) {
  const { Text } = useComponentContext()
  return (
    <div className={styles.root}>
      <AriaTable {...props} className={classnames('react-aria-Table', className)}>
        <AriaTableHeader>
          <Row>
            {headers.map((header, index) => (
              <Column key={header.key} isRowHeader={index === 0}>
                <Text weight="semibold" size="xs">
                  {header.content}
                </Text>
              </Column>
            ))}
          </Row>
        </AriaTableHeader>
        <AriaTableBody>
          {rows.length === 0 && emptyState ? (
            <Row>
              <Cell colSpan={headers.length}>{emptyState}</Cell>
            </Row>
          ) : (
            rows.map(row => (
              <Row key={row.key}>
                {row.data.map((cell, index) => (
                  <Cell key={cell.key}>
                    <Text
                      variant={
                        hasCheckboxColumn
                          ? index === 1
                            ? 'leading'
                            : 'supporting'
                          : index === 0
                            ? 'leading'
                            : 'supporting'
                      }
                      size="xs"
                    >
                      {cell.content}
                    </Text>
                  </Cell>
                ))}
              </Row>
            ))
          )}
          {footer && footer.length > 0 && (
            <Row key="table-footer" data-footer="true">
              {footer.map(cell => (
                <Cell key={cell.key}>
                  <Text variant="leading" size="sm">
                    {cell.content}
                  </Text>
                </Cell>
              ))}
            </Row>
          )}
        </AriaTableBody>
      </AriaTable>
    </div>
  )
}
