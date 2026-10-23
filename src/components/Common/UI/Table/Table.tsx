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

/**
 * Data table with headers, rows, optional footer, and empty state.
 *
 * @param rawProps - Table configuration; see {@link TableProps}.
 * @returns The rendered table.
 * @public
 */
export function Table(rawProps: TableProps) {
  const resolvedProps = applyMissingDefaults(rawProps, TableDefaults)
  const {
    className,
    headers,
    rows,
    footer,
    emptyState,
    isWithinBox,
    hasCheckboxColumn,
    sortDescriptor,
    onSortChange,
    ...props
  } = resolvedProps
  // Sorting a column the consumer isn't listening to would make the header look interactive
  // while doing nothing, so sortability is gated on there being a handler to receive it.
  const isSortable = Boolean(onSortChange)
  return (
    <div className={styles.root} data-within-box={isWithinBox || undefined}>
      <AriaTable
        {...props}
        className={classnames('react-aria-Table', className)}
        sortDescriptor={
          sortDescriptor && {
            column: sortDescriptor.columnKey,
            direction: sortDescriptor.direction,
          }
        }
        onSortChange={descriptor => {
          onSortChange?.({
            columnKey: String(descriptor.column),
            direction: descriptor.direction,
          })
        }}
      >
        <AriaTableHeader>
          <Row>
            {headers.map((header, index) => {
              const columnSortDirection =
                sortDescriptor?.columnKey === header.key ? sortDescriptor.direction : undefined
              return (
                <Column
                  key={header.key}
                  id={header.key}
                  isRowHeader={index === 0}
                  allowsSorting={isSortable && header.isSortable}
                >
                  <Text as="span" weight="semibold" size="xs">
                    {header.content}
                    {isSortable && header.isSortable && (
                      <CaretDown
                        aria-hidden="true"
                        className={classnames(
                          styles.sortIcon,
                          columnSortDirection === 'ascending' && styles.sortIconAscending,
                        )}
                        data-sorted={columnSortDirection ? 'true' : undefined}
                      />
                    )}
                  </Text>
                </Column>
              )
            })}
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
