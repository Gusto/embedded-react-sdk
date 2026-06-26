import { formatHoursDisplay } from '@/components/Payroll/helpers'

export type ColumnKind = 'hours' | 'currency' | 'reimbursements'

export interface ColumnDef {
  id: string
  label: string
  kind: ColumnKind
}

export interface Workweek {
  startDate: string
  endDate: string
}

/** Formats a stored cell value for the given column kind. Two decimals max, empty if zero/blank.
 *  Mirrors `formatHoursDisplay` (hours: integer → `40.0`, decimal → `40.25`) and
 *  `toFixed(2)` for currency (matches PayrollEditEmployee's amount submission). */
export function formatCellValue(raw: string, kind: ColumnKind): string {
  if (raw === '') return ''
  const num = Number(raw)
  if (!Number.isFinite(num) || num === 0) return ''
  if (kind === 'hours') return formatHoursDisplay(num)
  return num.toFixed(2)
}

export function sumBreakdown(breakdown: string[]): number {
  return breakdown.reduce((acc, v) => {
    const n = Number(v)
    return acc + (Number.isFinite(n) ? n : 0)
  }, 0)
}
