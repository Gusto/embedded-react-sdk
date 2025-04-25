import { Table as AriaTable } from 'react-aria-components'
import classnames from 'classnames'
import type { TableProps } from './TableTypes'
import styles from './Table.module.scss'

export const Table = ({ children, className, ...props }: TableProps) => {
  return (
    <span className={styles.root}>
      <AriaTable className={classnames(className, 'react-aria-Table')} {...props}>
        {children}
      </AriaTable>
    </span>
  )
}
