import { useEffect, useState } from 'react'
import classNames from 'classnames'
import type { TableProps } from '@gusto/embedded-react-sdk'
import styles from './Table.module.scss'

export function Table({
  headers,
  rows,
  footer,
  emptyState,
  isWithinBox = false,
  hasCheckboxColumn = false,
  className,
  id,
  role,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: TableProps) {
  const isEmpty = rows.length === 0
  const colCount = headers.length
  const [hoveredRowKey, setHoveredRowKey] = useState<string | null>(null)

  // Clear sticky hover when any click happens (popovers/menus closing,
  // dialogs opening) and when the window loses focus.
  useEffect(() => {
    const clear = () => {
      setHoveredRowKey(null)
    }
    document.addEventListener('click', clear)
    window.addEventListener('blur', clear)
    return () => {
      document.removeEventListener('click', clear)
      window.removeEventListener('blur', clear)
    }
  }, [])

  return (
    <table
      id={id}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      className={classNames(styles.root, className, {
        [styles.bare as string]: isWithinBox,
        [styles.withCheckboxColumn as string]: hasCheckboxColumn,
      })}
    >
      <thead className={styles.head}>
        <tr className={styles.headRow}>
          {headers.map(header => (
            <th key={header.key} scope="col" className={styles.headCell}>
              {header.content}
            </th>
          ))}
        </tr>
      </thead>

      <tbody
        className={styles.body}
        onPointerLeave={() => {
          setHoveredRowKey(null)
        }}
      >
        {isEmpty ? (
          <tr className={styles.emptyRow}>
            <td colSpan={Math.max(colCount, 1)} className={styles.emptyCell}>
              {emptyState}
            </td>
          </tr>
        ) : (
          rows.map(row => (
            <tr
              key={row.key}
              className={styles.row}
              data-hovered={hoveredRowKey === row.key || undefined}
              onPointerEnter={() => {
                setHoveredRowKey(row.key)
              }}
              onPointerLeave={() => {
                setHoveredRowKey(prev => (prev === row.key ? null : prev))
              }}
            >
              {row.data.map(cell => (
                <td key={cell.key} className={styles.cell}>
                  {cell.content}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>

      {footer && footer.length > 0 && (
        <tfoot className={styles.foot}>
          <tr className={styles.footRow}>
            {footer.map(cell => (
              <td key={cell.key} className={styles.footCell}>
                {cell.content}
              </td>
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  )
}
