import { useEffect, useMemo, useRef, useState, type FocusEvent } from 'react'
import type { Employee } from '@gusto/embedded-api-v-2025-11-15/models/components/employee'
import type { EmployeeCompensations } from '@gusto/embedded-api-v-2025-11-15/models/components/payroll'
import type { PayrollFixedCompensationTypesType } from '@gusto/embedded-api-v-2025-11-15/models/components/payrollfixedcompensationtypestype'
import type { PayrollPayPeriodType } from '@gusto/embedded-api-v-2025-11-15/models/components/payrollpayperiodtype'
import { Skeleton } from '../../common/Skeleton'
import styles from './PayrollSpreadsheet.module.scss'
import { firstLastName } from '@/helpers/formattedStrings'
import { formatHoursDisplay } from '@/components/Payroll/helpers'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import { useDateFormatter } from '@/hooks/useDateFormatter'

type ColumnKind = 'hours' | 'currency'

interface ColumnDef {
  id: string
  label: string
  kind: ColumnKind
}

const COLUMNS: ColumnDef[] = [
  { id: 'regularHours', label: 'Regular hrs', kind: 'hours' },
  { id: 'overtime', label: 'Overtime hrs', kind: 'hours' },
  { id: 'doubleOvertime', label: 'Double overtime hrs', kind: 'hours' },
  { id: 'bonus', label: 'Bonus', kind: 'currency' },
  { id: 'cashTips', label: 'Cash tips', kind: 'currency' },
  { id: 'paycheckTips', label: 'Paycheck tips', kind: 'currency' },
  { id: 'commission', label: 'Commission', kind: 'currency' },
  { id: 'correctionPayment', label: 'Correction payment', kind: 'currency' },
  { id: 'sickHours', label: 'Sick hrs', kind: 'hours' },
  { id: 'vacationHours', label: 'Vacation hrs', kind: 'hours' },
]

const FIXED_COMP_NAME_BY_COLUMN: Record<string, string> = {
  bonus: 'Bonus',
  cashTips: 'Cash Tips',
  paycheckTips: 'Paycheck Tips',
  commission: 'Commission',
  correctionPayment: 'Correction Payment',
}

const HOURLY_COMP_NAME_BY_COLUMN: Record<string, string> = {
  regularHours: 'Regular Hours',
  overtime: 'Overtime',
  doubleOvertime: 'Double overtime',
}

type CellKey = `${string}|${string}`

function cellKey(employeeUuid: string, columnId: string): CellKey {
  return `${employeeUuid}|${columnId}`
}

/** Formats a stored cell value for the given column kind. Two decimals max, empty if zero/blank.
 *  Mirrors `formatHoursDisplay` (hours: integer → `40.0`, decimal → `40.25`) and
 *  `toFixed(2)` for currency (matches PayrollEditEmployee's amount submission). */
function formatCellValue(raw: string, kind: ColumnKind): string {
  if (raw === '') return ''
  const num = Number(raw)
  if (!Number.isFinite(num) || num === 0) return ''
  if (kind === 'hours') return formatHoursDisplay(num)
  return num.toFixed(2)
}

function getPrimaryJobFlsa(employee: Employee): string | undefined {
  const primary = employee.jobs?.find(job => job.primary) ?? employee.jobs?.[0]
  return (
    primary?.compensations?.find(c => c.uuid === primary.currentCompensationUuid)?.flsaStatus ??
    primary?.compensations?.[0]?.flsaStatus
  )
}

function findHourly(compensation: EmployeeCompensations | undefined, columnId: string): string {
  const targetName = HOURLY_COMP_NAME_BY_COLUMN[columnId]?.toLowerCase()
  if (!targetName) return ''
  const match = compensation?.hourlyCompensations?.find(h => h.name?.toLowerCase() === targetName)
  return match?.hours ?? ''
}

function findFixed(compensation: EmployeeCompensations | undefined, columnId: string): string {
  const targetName = FIXED_COMP_NAME_BY_COLUMN[columnId]?.toLowerCase()
  if (!targetName) return ''
  const match = compensation?.fixedCompensations?.find(f => f.name?.toLowerCase() === targetName)
  return match?.amount ?? ''
}

function findPto(
  compensation: EmployeeCompensations | undefined,
  matcher: 'sick' | 'vacation',
): string {
  const match = compensation?.paidTimeOff?.find(p => p.name?.toLowerCase().includes(matcher))
  return match?.hours ?? ''
}

// Per the SDK's PayrollEditEmployeePresentation (HOURS_COMPENSATION_NAMES + findMatchingCompensation):
// an hourly column is only editable when the employee's hourlyCompensations array contains a row
// whose name matches that column. The prepared payroll omits rows the employee isn't eligible for
// (e.g. salaried employees have no hourly rows at all; non-OT-eligible hourly employees omit the
// Overtime / Double overtime rows). Anything else must render N/A.
function hasHourlyComp(compensation: EmployeeCompensations | undefined, columnId: string): boolean {
  const targetName = HOURLY_COMP_NAME_BY_COLUMN[columnId]?.toLowerCase()
  if (!targetName) return false
  return compensation?.hourlyCompensations?.some(h => h.name?.toLowerCase() === targetName) ?? false
}

function isFixedCompApplicable(
  employee: Employee,
  columnId: string,
  fixedCompensationTypes: PayrollFixedCompensationTypesType[],
): boolean {
  if (getPrimaryJobFlsa(employee) === 'Owner') return false
  const targetName = FIXED_COMP_NAME_BY_COLUMN[columnId]?.toLowerCase()
  return fixedCompensationTypes.some(t => t.name?.toLowerCase() === targetName)
}

function isPtoApplicable(
  compensation: EmployeeCompensations | undefined,
  matcher: 'sick' | 'vacation',
): boolean {
  return compensation?.paidTimeOff?.some(p => p.name?.toLowerCase().includes(matcher)) ?? false
}

function isColumnApplicable(
  employee: Employee,
  compensation: EmployeeCompensations | undefined,
  column: ColumnDef,
  fixedCompensationTypes: PayrollFixedCompensationTypesType[],
): boolean {
  switch (column.id) {
    case 'regularHours':
    case 'overtime':
    case 'doubleOvertime':
      return hasHourlyComp(compensation, column.id)
    case 'sickHours':
      return isPtoApplicable(compensation, 'sick')
    case 'vacationHours':
      return isPtoApplicable(compensation, 'vacation')
    default:
      return isFixedCompApplicable(employee, column.id, fixedCompensationTypes)
  }
}

function seedValues(
  employees: Employee[],
  employeeCompensations: EmployeeCompensations[],
): Record<CellKey, string> {
  const compByEmployee = new Map(employeeCompensations.map(comp => [comp.employeeUuid ?? '', comp]))
  const seed: Record<CellKey, string> = {}
  for (const employee of employees) {
    const uuid = employee.uuid
    const comp = compByEmployee.get(uuid)
    for (const column of COLUMNS) {
      let value = ''
      if (column.id === 'sickHours') {
        value = findPto(comp, 'sick')
      } else if (column.id === 'vacationHours') {
        value = findPto(comp, 'vacation')
      } else if (column.kind === 'hours') {
        value = findHourly(comp, column.id)
      } else {
        value = findFixed(comp, column.id)
      }
      seed[cellKey(uuid, column.id)] = formatCellValue(value, column.kind)
    }
  }
  return seed
}

interface PayrollSpreadsheetProps {
  employees: Employee[]
  employeeCompensations: EmployeeCompensations[]
  fixedCompensationTypes: PayrollFixedCompensationTypesType[]
  /** Called after an edit, debounced ~600ms during typing and immediately on blur.
   *  The argument is the full compensation row with updated hourly/fixed/PTO values. */
  onSave?: (compensation: EmployeeCompensations) => void | Promise<void>
  /** Show shimmering skeleton bars in place of cell contents. Use while the underlying
   *  prepared-payroll data is being refetched and the seeded local state is unreliable. */
  isLoading?: boolean
  /** Regular rate of pay mode. When true, Overtime and Double overtime cells become
   *  buttons that open a per-workweek breakdown modal instead of inline number inputs.
   *  Requires `payPeriod` to derive the workweek date ranges. */
  rrop?: boolean
  /** Used in RRoP mode to derive workweek date ranges shown in the breakdown modal. */
  payPeriod?: PayrollPayPeriodType
}

/** Columns that participate in the Regular Rate of Pay workweek breakdown.
 *  Mirrors the RRoP-included earnings list — hourly wages, overtime, double overtime,
 *  non-discretionary bonus, commission, and correction payment (back pay). Cash tips,
 *  paycheck tips, and PTO are excluded from RRoP and stay as inline inputs. */
const RROP_BREAKDOWN_COLUMNS = new Set<string>([
  'regularHours',
  'overtime',
  'doubleOvertime',
  'bonus',
  'commission',
  'correctionPayment',
])

/** Columns that *trigger* the breakdown requirement when they hold a non-empty value.
 *  Entering OT or 2×OT forces the other RRoP-included columns into breakdown mode for
 *  that employee. */
const RROP_TRIGGER_COLUMNS = new Set<string>(['overtime', 'doubleOvertime'])

interface Workweek {
  startDate: string
  endDate: string
}

/** Splits the pay period into consecutive 7-day workweeks anchored at startDate.
 *  Last week clamps to endDate. Returns [] if the pay period is missing or invalid. */
function deriveWorkweeks(payPeriod: PayrollPayPeriodType | undefined): Workweek[] {
  if (!payPeriod?.startDate || !payPeriod.endDate) return []
  const start = new Date(`${payPeriod.startDate}T00:00:00`)
  const end = new Date(`${payPeriod.endDate}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return []
  const weeks: Workweek[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const weekEnd = new Date(cursor)
    weekEnd.setDate(weekEnd.getDate() + 6)
    if (weekEnd > end) weekEnd.setTime(end.getTime())
    weeks.push({ startDate: toIsoDate(cursor), endDate: toIsoDate(weekEnd) })
    cursor.setDate(cursor.getDate() + 7)
  }
  return weeks
}

function toIsoDate(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function sumBreakdown(breakdown: string[]): number {
  return breakdown.reduce((acc, v) => {
    const n = Number(v)
    return acc + (Number.isFinite(n) ? n : 0)
  }, 0)
}

const SAVE_DEBOUNCE_MS = 600

function buildUpdatedCompensation(
  original: EmployeeCompensations,
  values: Record<CellKey, string>,
  employee: Employee,
): EmployeeCompensations {
  const employeeUuid = employee.uuid
  const primaryJobUuid =
    employee.jobs?.find(j => j.primary)?.uuid ??
    original.hourlyCompensations?.[0]?.jobUuid ??
    original.fixedCompensations?.[0]?.jobUuid ??
    ''

  const valueForColumn = (columnId: string) => values[cellKey(employeeUuid, columnId)] ?? ''

  const hourlyColumnByName = new Map<string, string>()
  for (const [columnId, apiName] of Object.entries(HOURLY_COMP_NAME_BY_COLUMN)) {
    hourlyColumnByName.set(apiName.toLowerCase(), columnId)
  }
  const fixedColumnByName = new Map<string, string>()
  for (const [columnId, apiName] of Object.entries(FIXED_COMP_NAME_BY_COLUMN)) {
    fixedColumnByName.set(apiName.toLowerCase(), columnId)
  }

  const nextHourly = (original.hourlyCompensations ?? []).map(hc => {
    const columnId = hourlyColumnByName.get(hc.name?.toLowerCase() ?? '')
    if (!columnId) return hc
    const v = valueForColumn(columnId)
    return { ...hc, hours: v === '' ? '0.0' : v }
  })

  const existingFixed = original.fixedCompensations ?? []
  const nextFixed = existingFixed.map(fc => {
    const columnId = fixedColumnByName.get(fc.name?.toLowerCase() ?? '')
    if (!columnId) return fc
    const v = valueForColumn(columnId)
    return { ...fc, amount: v === '' ? '0.00' : v }
  })
  // Add fixed-comp rows the user entered values for that didn't exist on the row.
  for (const [apiNameLower, columnId] of fixedColumnByName) {
    if (existingFixed.some(fc => fc.name?.toLowerCase() === apiNameLower)) continue
    const v = valueForColumn(columnId)
    if (v === '') continue
    nextFixed.push({
      name: FIXED_COMP_NAME_BY_COLUMN[columnId],
      amount: v,
      jobUuid: primaryJobUuid,
    })
  }

  const nextPto = (original.paidTimeOff ?? []).map(pto => {
    const lower = pto.name?.toLowerCase() ?? ''
    let columnId: string | undefined
    if (lower.includes('sick')) columnId = 'sickHours'
    else if (lower.includes('vacation')) columnId = 'vacationHours'
    if (!columnId) return pto
    const v = valueForColumn(columnId)
    return { ...pto, hours: v === '' ? '0.0' : v }
  })

  return {
    ...original,
    hourlyCompensations: nextHourly,
    fixedCompensations: nextFixed,
    paidTimeOff: nextPto,
  }
}

export function PayrollSpreadsheet({
  employees,
  employeeCompensations,
  fixedCompensationTypes,
  onSave,
  isLoading = false,
  rrop = false,
  payPeriod,
}: PayrollSpreadsheetProps) {
  const Components = useComponentContext()
  const dateFormatter = useDateFormatter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const stickyHeaderRef = useRef<HTMLDivElement>(null)
  const [isHorizontallyScrolled, setIsHorizontallyScrolled] = useState(false)
  const [values, setValues] = useState<Record<CellKey, string>>(() =>
    seedValues(employees, employeeCompensations),
  )

  const workweeks = useMemo(() => deriveWorkweeks(payPeriod), [payPeriod])

  // Per-workweek breakdowns for overtime + doubleOvertime, keyed by `${uuid}|${columnId}`.
  // Seeded lazily from the column total on first modal open so partners that haven't yet
  // routed a real breakdown through the API still get sensible defaults.
  const [breakdowns, setBreakdowns] = useState<Record<CellKey, string[]>>({})

  const [openModal, setOpenModal] = useState<{
    employeeUuid: string
    columnId: string
    kind: ColumnKind
    columnLabel: string
  } | null>(null)
  const [draftBreakdown, setDraftBreakdown] = useState<string[]>([])

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setIsHorizontallyScrolled(event.currentTarget.scrollLeft > 0)
  }

  const valuesRef = useRef(values)
  valuesRef.current = values

  const compensationByEmployee = useMemo(() => {
    const map = new Map<string, EmployeeCompensations>()
    for (const comp of employeeCompensations) {
      if (comp.employeeUuid) map.set(comp.employeeUuid, comp)
    }
    return map
  }, [employeeCompensations])

  const employeeByUuid = useMemo(() => {
    const map = new Map<string, Employee>()
    for (const e of employees) map.set(e.uuid, e)
    return map
  }, [employees])

  const saveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const timers = saveTimers.current
    return () => {
      for (const id of timers.values()) clearTimeout(id)
      timers.clear()
    }
  }, [])

  const triggerSave = (employeeUuid: string) => {
    if (!onSave) return
    const original = compensationByEmployee.get(employeeUuid)
    const employee = employeeByUuid.get(employeeUuid)
    if (!original || !employee) return
    const next = buildUpdatedCompensation(original, valuesRef.current, employee)
    void onSave(next)
  }

  const scheduleSave = (employeeUuid: string) => {
    if (!onSave) return
    const existing = saveTimers.current.get(employeeUuid)
    if (existing) clearTimeout(existing)
    const id = setTimeout(() => {
      saveTimers.current.delete(employeeUuid)
      triggerSave(employeeUuid)
    }, SAVE_DEBOUNCE_MS)
    saveTimers.current.set(employeeUuid, id)
  }

  const flushSave = (employeeUuid: string) => {
    if (!onSave) return
    const existing = saveTimers.current.get(employeeUuid)
    if (existing) {
      clearTimeout(existing)
      saveTimers.current.delete(employeeUuid)
    }
    triggerSave(employeeUuid)
  }

  const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
    const container = scrollContainerRef.current
    const sticky = stickyHeaderRef.current
    if (!container || !sticky) return
    const cell = event.currentTarget.closest('[role="gridcell"]')
    if (!cell) return
    const cellRect = cell.getBoundingClientRect()
    const stickyRect = sticky.getBoundingClientRect()
    const hiddenAmount = stickyRect.right - cellRect.left
    if (hiddenAmount > 0) {
      container.scrollBy({ left: -hiddenAmount, behavior: 'smooth' })
    }
  }

  const applicabilityByEmployee = useMemo(() => {
    const compByEmployee = new Map(
      employeeCompensations.map(comp => [comp.employeeUuid ?? '', comp]),
    )
    const map = new Map<string, Record<string, boolean>>()
    for (const employee of employees) {
      const compensation = compByEmployee.get(employee.uuid)
      const row: Record<string, boolean> = {}
      for (const column of COLUMNS) {
        row[column.id] = isColumnApplicable(employee, compensation, column, fixedCompensationTypes)
      }
      map.set(employee.uuid, row)
    }
    return map
  }, [employees, employeeCompensations, fixedCompensationTypes])

  const handleChange = (employeeUuid: string, columnId: string, next: string) => {
    setValues(prev => ({ ...prev, [cellKey(employeeUuid, columnId)]: next }))
    scheduleSave(employeeUuid)
  }

  const handleBlur = (employeeUuid: string, columnId: string, kind: ColumnKind) => {
    setValues(prev => {
      const current = prev[cellKey(employeeUuid, columnId)] ?? ''
      const normalized = formatCellValue(current, kind)
      if (normalized === current) return prev
      return { ...prev, [cellKey(employeeUuid, columnId)]: normalized }
    })
    flushSave(employeeUuid)
  }

  const openBreakdownModal = (employeeUuid: string, column: ColumnDef) => {
    const key = cellKey(employeeUuid, column.id)
    const existing = breakdowns[key]
    const zero = column.kind === 'hours' ? '0.0' : '0.00'
    if (existing && existing.length === workweeks.length) {
      setDraftBreakdown(existing)
    } else {
      // First open: seed Week 1 with the current total so the existing value isn't lost,
      // and zero out the rest. Real API will eventually supply the per-workweek split.
      const total = values[key] ?? ''
      const seed = workweeks.map((_, idx) => (idx === 0 ? total || zero : zero))
      setDraftBreakdown(seed)
    }
    setOpenModal({
      employeeUuid,
      columnId: column.id,
      kind: column.kind,
      columnLabel: column.label,
    })
  }

  const closeBreakdownModal = () => {
    setOpenModal(null)
    setDraftBreakdown([])
  }

  const saveBreakdownModal = () => {
    if (!openModal) return
    const { employeeUuid, columnId, kind } = openModal
    const key = cellKey(employeeUuid, columnId)
    const normalized = draftBreakdown.map(v => (v === '' ? '0' : v))
    const total = sumBreakdown(normalized)
    setBreakdowns(prev => ({ ...prev, [key]: normalized }))
    setValues(prev => ({ ...prev, [key]: formatCellValue(String(total), kind) }))
    closeBreakdownModal()
    flushSave(employeeUuid)
  }

  const modalEmployeeName = openModal
    ? (() => {
        const employee = employeeByUuid.get(openModal.employeeUuid)
        return employee
          ? firstLastName({ first_name: employee.firstName, last_name: employee.lastName })
          : ''
      })()
    : ''
  const modalColumnLabel = openModal?.columnLabel ?? ''

  // Per-employee: does this row have a non-empty Overtime or Double overtime value?
  // When true, the other RRoP-included columns (regular hours, bonus, commission,
  // correction payment) flip from inline inputs to breakdown-modal triggers.
  const requiresRropBreakdownByEmployee = useMemo(() => {
    const map = new Map<string, boolean>()
    if (!rrop) return map
    for (const employee of employees) {
      const uuid = employee.uuid
      const hasOt =
        (values[cellKey(uuid, 'overtime')] ?? '') !== '' ||
        (values[cellKey(uuid, 'doubleOvertime')] ?? '') !== ''
      map.set(uuid, hasOt)
    }
    return map
  }, [rrop, employees, values])

  return (
    <div
      ref={scrollContainerRef}
      className={`${styles.scrollContainer} ${isHorizontallyScrolled ? styles.isScrolled : ''}`}
      onScroll={handleScroll}
    >
      <div role="grid" className={styles.grid}>
        <div role="row" className={styles.headerRow}>
          <div
            ref={stickyHeaderRef}
            role="columnheader"
            className={`${styles.headerCell} ${styles.stickyLeft}`}
          >
            Employee
          </div>
          {COLUMNS.map(column => (
            <div role="columnheader" key={column.id} className={styles.headerCell}>
              {column.label}
            </div>
          ))}
        </div>

        {employees.map(employee => {
          const uuid = employee.uuid
          const name = firstLastName({
            first_name: employee.firstName,
            last_name: employee.lastName,
          })
          const applicability = applicabilityByEmployee.get(uuid) ?? {}

          return (
            <div role="row" key={uuid} className={styles.row}>
              <div role="rowheader" className={`${styles.cell} ${styles.stickyLeft}`}>
                {isLoading ? (
                  <Skeleton width="8.75rem" height="0.875rem" />
                ) : (
                  <span className={styles.employeeName}>{name}</span>
                )}
              </div>

              {COLUMNS.map(column => {
                if (isLoading) {
                  return (
                    <div role="gridcell" key={column.id} className={styles.cell}>
                      <Skeleton width="3.5rem" height="0.875rem" />
                    </div>
                  )
                }
                if (!applicability[column.id]) {
                  return (
                    <div
                      role="gridcell"
                      key={column.id}
                      className={`${styles.cell} ${styles.cellNa}`}
                    >
                      <span className={styles.notApplicable}>N/A</span>
                    </div>
                  )
                }
                const raw = values[cellKey(uuid, column.id)] ?? ''
                const hasValue = raw !== ''
                // OT + 2×OT always trigger the breakdown modal in RRoP mode. The other
                // RRoP-included columns only trigger once that employee has an OT value —
                // a non-zero OT total forces the rest of the included earnings to be
                // entered per workweek so RRoP can be computed against the same buckets.
                const isOvertimeTrigger = rrop && RROP_TRIGGER_COLUMNS.has(column.id)
                const isInducedRropTrigger =
                  rrop &&
                  !isOvertimeTrigger &&
                  RROP_BREAKDOWN_COLUMNS.has(column.id) &&
                  requiresRropBreakdownByEmployee.get(uuid) === true
                const isRropTrigger = isOvertimeTrigger || isInducedRropTrigger
                const cellClassName = [
                  styles.cell,
                  column.kind === 'currency' && hasValue ? styles.currencyHasValue : '',
                ]
                  .filter(Boolean)
                  .join(' ')
                if (isRropTrigger) {
                  return (
                    <div role="gridcell" key={column.id} className={cellClassName}>
                      <button
                        type="button"
                        className={styles.cellTrigger}
                        aria-label={`${name} — ${column.label}`}
                        onClick={() => {
                          openBreakdownModal(uuid, column)
                        }}
                      >
                        <span className={styles.cellTriggerValue}>{raw}</span>
                      </button>
                    </div>
                  )
                }
                return (
                  <div role="gridcell" key={column.id} className={cellClassName}>
                    {/* The <label> fills the cell so clicks anywhere inside (including on
                        the cell's padding) focus the input natively — no JS click handler
                        needed. */}
                    <label className={styles.cellLabel} aria-label={`${name} — ${column.label}`}>
                      {column.kind === 'currency' && <span className={styles.affix}>$</span>}
                      <input
                        type="number"
                        inputMode="decimal"
                        className={styles.cellInput}
                        value={raw}
                        onFocus={handleInputFocus}
                        onChange={e => {
                          handleChange(uuid, column.id, e.target.value)
                        }}
                        onBlur={() => {
                          handleBlur(uuid, column.id, column.kind)
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
        })}
      </div>

      {openModal && (
        <Components.Modal
          isOpen
          onClose={closeBreakdownModal}
          shouldCloseOnBackdropClick
          footer={
            <Flex justifyContent="flex-end" gap={8}>
              <Components.Button variant="secondary" onClick={closeBreakdownModal}>
                Cancel
              </Components.Button>
              <Components.Button onClick={saveBreakdownModal}>Save</Components.Button>
            </Flex>
          }
        >
          <Flex flexDirection="column" gap={24}>
            <Flex flexDirection="column" gap={4}>
              <Components.Heading as="h3" styledAs="h4">
                {modalColumnLabel} breakdown for {modalEmployeeName}
              </Components.Heading>
              {payPeriod?.startDate && payPeriod.endDate && (
                <Components.Text variant="supporting">
                  Pay period:{' '}
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
            <Flex flexDirection="column" gap={16}>
              {workweeks.map((week, idx) => {
                const { startDate, endDate } = dateFormatter.formatPayPeriod(
                  week.startDate,
                  week.endDate,
                )
                const isHours = openModal.kind === 'hours'
                return (
                  <Components.NumberInput
                    key={`${week.startDate}-${week.endDate}`}
                    label={`Week ${idx + 1}: ${startDate} – ${endDate}`}
                    format={isHours ? 'decimal' : 'currency'}
                    min={0}
                    isRequired
                    value={Number(draftBreakdown[idx] ?? '0') || 0}
                    onChange={value => {
                      setDraftBreakdown(prev => {
                        const next = [...prev]
                        next[idx] = Number.isFinite(value) ? String(value) : '0'
                        return next
                      })
                    }}
                    adornmentEnd={isHours ? <span>hrs</span> : undefined}
                  />
                )
              })}
            </Flex>
          </Flex>
        </Components.Modal>
      )}
    </div>
  )
}
