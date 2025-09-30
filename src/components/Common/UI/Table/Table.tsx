import {
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  TableBody as AriaTableBody,
  Row,
  Column,
  Cell,
} from 'react-aria-components'
import classnames from 'classnames'
import { Text } from '../Text/Text'
import type { TableProps } from './TableTypes'
import { TableDefaults } from './TableTypes'
import styles from './Table.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'

export function Table(rawProps: TableProps) {
  const resolvedProps = applyMissingDefaults(rawProps, TableDefaults)
  const { className, headers, rows, footer, emptyState, variant, ...props } = resolvedProps
  return (
    <div className={styles.root} data-variant={variant}>
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
                    <Text variant={index === 0 ? 'leading' : 'supporting'} size="xs">
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
