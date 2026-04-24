import cn from 'classnames'
import type { TableProps } from '@/components/Common/UI/Table/TableTypes'

export function GwsTable({
  className,
  headers,
  rows,
  footer,
  emptyState,
  isWithinBox,
  hasCheckboxColumn,
  ...props
}: TableProps) {
  return (
    <div className={isWithinBox ? undefined : 'table-responsive w-100'}>
      <table className={cn('table', { 'mb-0': isWithinBox }, className)} {...props}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={header.key}
                scope="col"
                className={cn({
                  'checkbox-column': hasCheckboxColumn && index === 0,
                })}
              >
                {header.content}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-group-divider">
          {rows.length === 0 && emptyState ? (
            <tr>
              <td colSpan={headers.length} className="text-center bg-body-secondary">
                {emptyState}
              </td>
            </tr>
          ) : (
            rows.map(row => (
              <tr key={row.key} className="align-middle">
                {row.data.map((cell, index) => {
                  const isRowHeader = hasCheckboxColumn ? index === 1 : index === 0
                  return isRowHeader ? (
                    <th key={cell.key} scope="row">
                      {cell.content}
                    </th>
                  ) : (
                    <td key={cell.key}>{cell.content}</td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
        {footer && footer.length > 0 && (
          <tfoot>
            <tr>
              {footer.length === 1 && footer[0] ? (
                <td key={footer[0].key} colSpan={headers.length}>
                  {footer[0].content}
                </td>
              ) : (
                footer.map(cell => <td key={cell.key}>{cell.content}</td>)
              )}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
