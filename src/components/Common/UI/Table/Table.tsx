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

export function Table({ className, headers, rows, emptyState, ...props }: TableProps) {
  return (
    <div className={styles.root}>
      <AriaTable {...props} className={classnames('react-aria-Table', className)}>
        <AriaTableHeader>
          <Row>
            {headers.map((header, index) => (
              <Column key={header.key} isRowHeader={index === 0}>
                {header.content}
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
                {row.data.map(cell => (
                  <Cell key={cell.key}>{cell.content}</Cell>
                ))}
              </Row>
            ))
          )}
        </AriaTableBody>
      </AriaTable>
    </div>
  )
}
