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
import CaretDown from '@/assets/icons/caret-down.svg?react'

function getAriaSortDescriptor(headers: TableProps['headers']) {
  for (const header of headers) {
    if (header.isSortable && header.sortDirection !== 'none') {
      return { column: header.key, direction: header.sortDirection }
    }
  }
  return undefined
}

/**
 * Data table with headers, rows, optional footer, and empty state.
 *
 * @param rawProps - Table configuration; see {@link TableProps}.
 * @returns The rendered table.
 * @public
 */
export function Table(rawProps: TableProps) {
  const resolvedProps = applyMissingDefaults(rawProps, TableDefaults)
  const { className, headers, rows, footer, emptyState, isWithinBox, hasCheckboxColumn, ...props } =
    resolvedProps
  return (
    <div className={styles.root} data-within-box={isWithinBox || undefined}>
      <AriaTable
        {...props}
        className={classnames('react-aria-Table', className)}
        sortDescriptor={getAriaSortDescriptor(headers)}
        onSortChange={descriptor => {
          // The header owns its own cycle, so react-aria's suggested direction is discarded.
          const activatedHeader = headers.find(header => header.key === String(descriptor.column))
          if (activatedHeader?.isSortable) {
            activatedHeader.onSort()
          }
        }}
      >
        <AriaTableHeader>
          <Row>
            {headers.map((header, index) => (
              <Column
                key={header.key}
                id={header.key}
                isRowHeader={index === 0}
                allowsSorting={header.isSortable}
              >
                <Text as="span" weight="semibold" size="xs">
                  {header.content}
                  {header.isSortable && (
                    <CaretDown
                      aria-hidden="true"
                      className={classnames(
                        styles.sortIcon,
                        header.sortDirection === 'ascending' && styles.sortIconAscending,
                      )}
                      data-sorted={header.sortDirection === 'none' ? undefined : 'true'}
                    />
                  )}
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
                      as="span"
                      variant={
                        hasCheckboxColumn
                          ? index === 1
                            ? 'leading'
                            : 'supporting'
                          : index === 0
                            ? 'leading'
                            : 'supporting'
                      }
                      size="sm"
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
              {footer.length === 1 && footer[0] ? (
                <Cell key={footer[0].key} colSpan={headers.length}>
                  <Text as="span" variant="leading" size="sm">
                    {footer[0].content}
                  </Text>
                </Cell>
              ) : (
                footer.map(cell => (
                  <Cell key={cell.key}>
                    <Text as="span" variant="leading" size="sm">
                      {cell.content}
                    </Text>
                  </Cell>
                ))
              )}
            </Row>
          )}
        </AriaTableBody>
      </AriaTable>
    </div>
  )
}
