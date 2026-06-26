import { useLayoutEffect, useRef, useState } from 'react'
import type { PayrollPayPeriodType } from '@gusto/embedded-api-v-2025-11-15/models/components/payrollpayperiodtype'
import styles from './PayrollSpreadsheet.module.scss'
import { type ColumnDef, type Workweek, formatCellValue, sumBreakdown } from './shared'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'

interface BreakdownModalProps {
  employeeName: string
  payPeriod?: PayrollPayPeriodType
  workweeks: Workweek[]
  columns: ColumnDef[]
  focusColumnId?: string
  initialBreakdowns: Record<string, string[]>
  onClose: () => void
  onSave: (breakdowns: Record<string, string[]>) => void
}

export function BreakdownModal({
  employeeName,
  payPeriod,
  workweeks,
  columns,
  focusColumnId,
  initialBreakdowns,
  onClose,
  onSave,
}: BreakdownModalProps) {
  const Components = useComponentContext()
  const dateFormatter = useDateFormatter()
  const [draftBreakdowns, setDraftBreakdowns] = useState(initialBreakdowns)
  const backdropRef = useRef<HTMLDivElement>(null)
  // Keyed by `${columnId}|${weekIdx}` so the open effect can focus the cell the user clicked
  // without re-firing focus on every keystroke (which would yank focus back to the seeded cell).
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map())

  useLayoutEffect(() => {
    const backdrop = backdropRef.current
    if (!backdrop) return
    // The Modal primitive caps inner .modal at 544rem; widen it so the workweek×column grid
    // (up to 6 columns + Type + Total) doesn't horizontally overflow.
    const modalEl = backdrop.querySelector<HTMLElement>(':scope > div')
    if (modalEl) modalEl.style.maxWidth = 'min(960px, 95vw)'
    if (focusColumnId) {
      const target = inputRefs.current.get(`${focusColumnId}|0`)
      target?.focus()
      target?.select()
    }
  }, [focusColumnId])

  const focusedColumn = focusColumnId ? columns.find(c => c.id === focusColumnId) : undefined
  const otherColumns = focusedColumn ? columns.filter(c => c.id !== focusedColumn.id) : columns
  const primaryColumns = focusedColumn ? [focusedColumn] : []

  const renderRow = (column: ColumnDef) => {
    const sum = sumBreakdown(draftBreakdowns[column.id] ?? [])
    const totalDisplay = formatCellValue(String(sum), column.kind)
    const totalHasValue = totalDisplay !== ''
    const totalCellClassName = [
      styles.breakdownCell,
      styles.breakdownTotalCell,
      column.kind === 'currency' && totalHasValue ? styles.currencyHasValue : '',
    ]
      .filter(Boolean)
      .join(' ')
    return (
      <div role="row" key={column.id} className={styles.breakdownRow}>
        <div role="rowheader" className={`${styles.breakdownCell} ${styles.breakdownTypeCell}`}>
          {column.label}
        </div>
        <div role="gridcell" className={totalCellClassName}>
          <span className={styles.breakdownTotalValue}>
            {totalHasValue
              ? column.kind === 'currency'
                ? `$${totalDisplay}`
                : `${totalDisplay} ${column.kind === 'hours' ? 'hrs' : ''}`.trim()
              : ''}
          </span>
        </div>
        {workweeks.map((week, weekIdx) => {
          const raw = draftBreakdowns[column.id]?.[weekIdx] ?? ''
          const hasValue = raw !== '' && raw !== '0' && raw !== '0.0' && raw !== '0.00'
          const cellClassName = [
            styles.breakdownCell,
            column.kind === 'currency' && hasValue ? styles.currencyHasValue : '',
          ]
            .filter(Boolean)
            .join(' ')
          const refKey = `${column.id}|${weekIdx}`
          return (
            <div
              role="gridcell"
              key={`${week.startDate}-${week.endDate}`}
              className={cellClassName}
            >
              <label
                className={styles.cellLabel}
                aria-label={`${column.label} — Week ${weekIdx + 1}`}
              >
                {column.kind === 'currency' && <span className={styles.affix}>$</span>}
                <input
                  type="number"
                  inputMode="decimal"
                  className={styles.cellInput}
                  value={raw}
                  ref={node => {
                    if (node) inputRefs.current.set(refKey, node)
                    else inputRefs.current.delete(refKey)
                  }}
                  onChange={e => {
                    const next = e.target.value
                    setDraftBreakdowns(prev => {
                      const arr = prev[column.id] ?? []
                      const updated = [...arr]
                      updated[weekIdx] = next
                      return { ...prev, [column.id]: updated }
                    })
                  }}
                  onBlur={e => {
                    const normalized = formatCellValue(e.target.value, column.kind)
                    setDraftBreakdowns(prev => {
                      const arr = prev[column.id] ?? []
                      if ((arr[weekIdx] ?? '') === normalized) return prev
                      const updated = [...arr]
                      updated[weekIdx] = normalized
                      return { ...prev, [column.id]: updated }
                    })
                  }}
                  min={0}
                  step={0.01}
                />
                {column.kind === 'hours' && <span className={styles.affix}>hrs</span>}
              </label>
            </div>
          )
        })}
      </div>
    )
  }

  const renderGrid = (cols: ColumnDef[]) => (
    <div
      role="grid"
      className={styles.breakdownGrid}
      style={{
        gridTemplateColumns: `minmax(8rem, 12rem) minmax(6rem, 8rem) repeat(${workweeks.length}, minmax(9rem, 1fr))`,
      }}
    >
      <div role="row" className={styles.breakdownHeaderRow}>
        <div role="columnheader" className={styles.breakdownHeaderCell}>
          Type
        </div>
        <div role="columnheader" className={styles.breakdownHeaderCell}>
          Total
        </div>
        {workweeks.map((week, weekIdx) => {
          const { startDate, endDate } = dateFormatter.formatPayPeriod(week.startDate, week.endDate)
          return (
            <div
              role="columnheader"
              key={`${week.startDate}-${week.endDate}`}
              className={styles.breakdownHeaderCell}
            >
              Week {weekIdx + 1}: {startDate} – {endDate}
            </div>
          )
        })}
      </div>
      {cols.map(renderRow)}
    </div>
  )

  return (
    <Components.Modal
      isOpen
      onClose={onClose}
      shouldCloseOnBackdropClick
      containerRef={backdropRef}
      footer={
        <Flex justifyContent="flex-end" gap={8}>
          <Components.Button variant="secondary" onClick={onClose}>
            Cancel
          </Components.Button>
          <Components.Button
            onClick={() => {
              onSave(draftBreakdowns)
            }}
          >
            Save
          </Components.Button>
        </Flex>
      }
    >
      <Flex flexDirection="column" gap={24}>
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h3" styledAs="h4">
            Workweek breakdown for {employeeName}
          </Components.Heading>
          {payPeriod?.startDate && payPeriod.endDate && (
            <Components.Text variant="supporting">
              {(() => {
                const { startDate, endDate } = dateFormatter.formatPayPeriod(
                  payPeriod.startDate,
                  payPeriod.endDate,
                )
                return `${startDate} – ${endDate}`
              })()}
            </Components.Text>
          )}
        </Flex>
        {primaryColumns.length > 0 && renderGrid(primaryColumns)}
        {otherColumns.length > 0 && (
          <Components.Heading as="h4" styledAs="h5">
            More hours and earnings
          </Components.Heading>
        )}
        {otherColumns.length > 0 && renderGrid(otherColumns)}
      </Flex>
    </Components.Modal>
  )
}
