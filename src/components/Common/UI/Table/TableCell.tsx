import { Cell } from 'react-aria-components'
import type { TableCellProps } from './TableTypes'

export const TableCell = ({ children, className, ...props }: TableCellProps) => {
  return (
    <Cell className={className} {...props}>
      {children}
    </Cell>
  )
}
