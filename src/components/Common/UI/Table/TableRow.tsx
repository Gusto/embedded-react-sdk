import { Row } from 'react-aria-components'
import type { TableRowProps } from './TableTypes'

export const TableRow = ({ children, className, ...props }: TableRowProps) => {
  return (
    <Row className={className} {...props}>
      {children}
    </Row>
  )
}
