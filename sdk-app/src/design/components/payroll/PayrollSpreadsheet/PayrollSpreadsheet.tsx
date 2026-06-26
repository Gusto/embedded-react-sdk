import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FocusEvent } from 'react'
import type { Employee } from '@gusto/embedded-api-v-2025-11-15/models/components/employee'
import type {
  EmployeeCompensations,
  PayrollShowReimbursements,
} from '@gusto/embedded-api-v-2025-11-15/models/components/payroll'
import type { PayrollFixedCompensationTypesType } from '@gusto/embedded-api-v-2025-11-15/models/components/payrollfixedcompensationtypestype'
import type { PayrollPayPeriodType } from '@gusto/embedded-api-v-2025-11-15/models/components/payrollpayperiodtype'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api-v-2025-11-15/models/components/payrollemployeecompensationstype'
import type { PayScheduleShow as PayScheduleObject } from '@gusto/embedded-api-v-2025-11-15/models/components/payscheduleshow'
import { Skeleton } from '../../common/Skeleton'
import { BreakdownModal } from './BreakdownModal'
import styles from './PayrollSpreadsheet.module.scss'
import {
  type ColumnDef,
  type ColumnKind,
  type Workweek,
  formatCellValue,
  sumBreakdown,
} from './shared'
import { firstLastName, formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { calculateGrossPay } from '@/components/Payroll/helpers'
import type { PayrollCategory } from '@/components/Payroll/payrollTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, EmptyData, Flex, Grid, useDataView } from '@/components/Common'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11 V7 a5 5 0 0 1 10 0 V11" />
    </svg>
  )
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
  { id: 'reimbursements', label: 'Reimbursements', kind: 'reimbursements' },
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
    case 'reimbursements':
      return true
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
      if (column.kind === 'reimbursements') continue
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

interface ReimbursementRow {
  uuid: string | null
  description: string
  amount: string
  recurring: boolean
}

function seedReimbursements(
  employees: Employee[],
  employeeCompensations: EmployeeCompensations[],
): Record<string, ReimbursementRow[]> {
  const compByEmployee = new Map(employeeCompensations.map(comp => [comp.employeeUuid ?? '', comp]))
  const seed: Record<string, ReimbursementRow[]> = {}
  for (const employee of employees) {
    const comp = compByEmployee.get(employee.uuid)
    seed[employee.uuid] = (comp?.reimbursements ?? []).map(r => ({
      uuid: r.uuid ?? null,
      description: r.description ?? '',
      amount: r.amount,
      recurring: r.recurring ?? false,
    }))
  }
  return seed
}

function reimbursementTotal(rows: ReimbursementRow[] | undefined): number {
  if (!rows) return 0
  return rows.reduce((acc, row) => {
    const n = parseFloat(row.amount || '0')
    return acc + (Number.isFinite(n) ? n : 0)
  }, 0)
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
  /** Required to compute Total pay for salaried employees (hours-in-pay-period derivation). */
  paySchedule?: PayScheduleObject
  /** Payroll category — switches PTO handling for off-cycle in the Total pay calculation. */
  payrollCategory?: PayrollCategory
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

const SAVE_DEBOUNCE_MS = 600

function buildUpdatedCompensation(
  original: EmployeeCompensations,
  values: Record<CellKey, string>,
  reimbursements: ReimbursementRow[],
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

  const nextReimbursements: PayrollShowReimbursements[] = reimbursements.map(r => ({
    amount: r.amount,
    description: r.description.trim() === '' ? null : r.description.trim(),
    uuid: r.uuid ?? null,
    recurring: r.recurring,
  }))

  return {
    ...original,
    hourlyCompensations: nextHourly,
    fixedCompensations: nextFixed,
    paidTimeOff: nextPto,
    reimbursements: nextReimbursements,
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
  paySchedule,
  payrollCategory,
}: PayrollSpreadsheetProps) {
  const Components = useComponentContext()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const stickyHeaderRef = useRef<HTMLDivElement>(null)
  const [isHorizontallyScrolled, setIsHorizontallyScrolled] = useState(false)
  const [values, setValues] = useState<Record<CellKey, string>>(() =>
    seedValues(employees, employeeCompensations),
  )
  const [reimbursementsByEmployee, setReimbursementsByEmployee] = useState<
    Record<string, ReimbursementRow[]>
  >(() => seedReimbursements(employees, employeeCompensations))

  const workweeks = useMemo(() => deriveWorkweeks(payPeriod), [payPeriod])

  // Per-workweek breakdowns for overtime + doubleOvertime, keyed by `${uuid}|${columnId}`.
  // Seeded lazily from the column total on first modal open so partners that haven't yet
  // routed a real breakdown through the API still get sensible defaults.
  const [breakdowns, setBreakdowns] = useState<Record<CellKey, string[]>>({})

  const [openModal, setOpenModal] = useState<{
    employeeUuid: string
    focusColumnId?: string
    columns: ColumnDef[]
    initialBreakdowns: Record<string, string[]>
  } | null>(null)

  const [openReimbursementsModal, setOpenReimbursementsModal] = useState<{
    employeeUuid: string
  } | null>(null)
  const reimbursementsModalBackdropRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!openReimbursementsModal) return
    const backdrop = reimbursementsModalBackdropRef.current
    if (!backdrop) return
    // The Modal primitive caps inner .modal at 544rem; widen it for this surface so the
    // reimbursements DataView + add form (two 320px columns) don't horizontally overflow.
    const modalEl = backdrop.querySelector<HTMLElement>(':scope > div')
    if (modalEl) modalEl.style.maxWidth = 'min(720px, 90vw)'
  }, [openReimbursementsModal])
  const [draftReimbursementDescription, setDraftReimbursementDescription] = useState('')
  const [draftReimbursementAmount, setDraftReimbursementAmount] = useState('')
  const [isAddingReimbursement, setIsAddingReimbursement] = useState(false)

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setIsHorizontallyScrolled(event.currentTarget.scrollLeft > 0)
  }

  const valuesRef = useRef(values)
  valuesRef.current = values
  const reimbursementsRef = useRef(reimbursementsByEmployee)
  reimbursementsRef.current = reimbursementsByEmployee

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
    const next = buildUpdatedCompensation(
      original,
      valuesRef.current,
      reimbursementsRef.current[employeeUuid] ?? [],
      employee,
    )
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

  // Total pay derives from the live-edited compensation so the cell updates as the user types.
  // Uses the main SDK's calculateGrossPay so the prototype matches PayrollConfiguration's column
  // exactly (regular + overtime + fixed earnings + PTO + minimum-wage adjustment).
  const totalPayByEmployee = useMemo(() => {
    const map = new Map<string, number>()
    for (const employee of employees) {
      const original = compensationByEmployee.get(employee.uuid)
      if (!original) {
        map.set(employee.uuid, 0)
        continue
      }
      const updated = buildUpdatedCompensation(
        original,
        values,
        reimbursementsByEmployee[employee.uuid] ?? [],
        employee,
      )
      map.set(
        employee.uuid,
        calculateGrossPay(
          updated as PayrollEmployeeCompensationsType,
          employee,
          payPeriod?.startDate,
          paySchedule,
          payrollCategory,
        ),
      )
    }
    return map
  }, [
    employees,
    compensationByEmployee,
    values,
    reimbursementsByEmployee,
    payPeriod?.startDate,
    paySchedule,
    payrollCategory,
  ])

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

  // RRoP-included columns that apply to a given employee, in COLUMNS order.
  const getModalColumns = (employeeUuid: string): ColumnDef[] => {
    const applicability = applicabilityByEmployee.get(employeeUuid) ?? {}
    return COLUMNS.filter(c => RROP_BREAKDOWN_COLUMNS.has(c.id) && applicability[c.id])
  }

  const seedDraftForColumn = (employeeUuid: string, column: ColumnDef): string[] => {
    const key = cellKey(employeeUuid, column.id)
    const existing = breakdowns[key]
    if (existing && existing.length === workweeks.length) {
      // Existing entries may have been normalized to '0' on save; blank those so the
      // modal matches the parent grid's "empty when zero" rule.
      return existing.map(v => formatCellValue(v, column.kind))
    }
    // First open: seed Week 1 with the current total so the existing value isn't lost.
    // Remaining weeks stay blank. Real API will eventually supply the per-workweek split.
    const total = values[key] ?? ''
    return workweeks.map((_, idx) => (idx === 0 ? total : ''))
  }

  const openBreakdownModal = (employeeUuid: string, focusColumn?: ColumnDef) => {
    const modalColumns = getModalColumns(employeeUuid)
    const initialBreakdowns: Record<string, string[]> = {}
    for (const column of modalColumns) {
      initialBreakdowns[column.id] = seedDraftForColumn(employeeUuid, column)
    }
    setOpenModal({
      employeeUuid,
      focusColumnId: focusColumn?.id,
      columns: modalColumns,
      initialBreakdowns,
    })
  }

  const closeBreakdownModal = () => {
    setOpenModal(null)
  }

  const commitBreakdowns = (
    employeeUuid: string,
    modalColumns: ColumnDef[],
    drafts: Record<string, string[]>,
  ) => {
    const nextBreakdowns: Record<CellKey, string[]> = {}
    const nextValues: Record<CellKey, string> = {}
    for (const column of modalColumns) {
      const draft = drafts[column.id] ?? []
      const normalized = draft.map(v => (v === '' ? '0' : v))
      const key = cellKey(employeeUuid, column.id)
      nextBreakdowns[key] = normalized
      nextValues[key] = formatCellValue(String(sumBreakdown(normalized)), column.kind)
    }
    setBreakdowns(prev => ({ ...prev, ...nextBreakdowns }))
    setValues(prev => ({ ...prev, ...nextValues }))
    closeBreakdownModal()
    flushSave(employeeUuid)
  }

  const resetReimbursementDraft = () => {
    setIsAddingReimbursement(false)
    setDraftReimbursementDescription('')
    setDraftReimbursementAmount('')
  }

  const openReimbursementsModalFor = (employeeUuid: string) => {
    resetReimbursementDraft()
    setOpenReimbursementsModal({ employeeUuid })
  }

  const closeReimbursementsModal = () => {
    setOpenReimbursementsModal(null)
    resetReimbursementDraft()
  }

  const handleSaveReimbursementDraft = () => {
    if (!openReimbursementsModal) return
    const { employeeUuid } = openReimbursementsModal
    const trimmedAmount = draftReimbursementAmount.trim()
    const parsedAmount = parseFloat(trimmedAmount || '0')
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return

    setReimbursementsByEmployee(prev => ({
      ...prev,
      [employeeUuid]: [
        ...(prev[employeeUuid] ?? []),
        {
          uuid: null,
          description: draftReimbursementDescription.trim(),
          amount: parsedAmount.toFixed(2),
          recurring: false,
        },
      ],
    }))
    resetReimbursementDraft()
    flushSave(employeeUuid)
  }

  const handleRemoveReimbursement = (employeeUuid: string, originalIndex: number) => {
    setReimbursementsByEmployee(prev => {
      const rows = prev[employeeUuid] ?? []
      const target = rows[originalIndex]
      if (!target) return prev
      const next = target.uuid
        ? rows.map((row, i) => (i === originalIndex ? { ...row, amount: '0' } : row))
        : rows.filter((_, i) => i !== originalIndex)
      return { ...prev, [employeeUuid]: next }
    })
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
          <div role="columnheader" className={styles.headerCell}>
            Total pay
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

              <div role="gridcell" className={`${styles.cell} ${styles.cellReadOnly}`}>
                {isLoading ? (
                  <Skeleton width="4rem" height="0.875rem" />
                ) : (
                  <>
                    <span className={styles.cellReadOnlyContent}>
                      {formatNumberAsCurrency(totalPayByEmployee.get(uuid) ?? 0)}
                    </span>
                    <LockIcon className={styles.lockIcon} />
                  </>
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
                if (column.kind === 'reimbursements') {
                  const rows = reimbursementsByEmployee[uuid] ?? []
                  const total = reimbursementTotal(rows)
                  const reimbursementCellClass = [
                    styles.cell,
                    total > 0 ? styles.currencyHasValue : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                  return (
                    <div role="gridcell" key={column.id} className={reimbursementCellClass}>
                      <button
                        type="button"
                        className={styles.cellTrigger}
                        aria-label={`${name} — ${column.label}`}
                        onClick={() => {
                          openReimbursementsModalFor(uuid)
                        }}
                      >
                        <span className={styles.cellTriggerValue}>
                          {total > 0 ? formatNumberAsCurrency(total) : ''}
                        </span>
                      </button>
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
        <BreakdownModal
          employeeName={modalEmployeeName}
          payPeriod={payPeriod}
          workweeks={workweeks}
          columns={openModal.columns}
          focusColumnId={openModal.focusColumnId}
          initialBreakdowns={openModal.initialBreakdowns}
          onClose={closeBreakdownModal}
          onSave={drafts => {
            commitBreakdowns(openModal.employeeUuid, openModal.columns, drafts)
          }}
        />
      )}

      {openReimbursementsModal && (
        <Components.Modal
          isOpen
          onClose={closeReimbursementsModal}
          shouldCloseOnBackdropClick
          containerRef={reimbursementsModalBackdropRef}
          footer={
            <Flex justifyContent="flex-end" gap={8}>
              <Components.Button variant="secondary" onClick={closeReimbursementsModal}>
                Done
              </Components.Button>
            </Flex>
          }
        >
          <ReimbursementsModalBody
            employeeUuid={openReimbursementsModal.employeeUuid}
            employeeName={(() => {
              const employee = employeeByUuid.get(openReimbursementsModal.employeeUuid)
              return employee
                ? firstLastName({ first_name: employee.firstName, last_name: employee.lastName })
                : ''
            })()}
            rows={reimbursementsByEmployee[openReimbursementsModal.employeeUuid] ?? []}
            isAdding={isAddingReimbursement}
            draftDescription={draftReimbursementDescription}
            draftAmount={draftReimbursementAmount}
            onStartAdding={() => {
              setIsAddingReimbursement(true)
            }}
            onChangeDescription={setDraftReimbursementDescription}
            onChangeAmount={setDraftReimbursementAmount}
            onSaveDraft={handleSaveReimbursementDraft}
            onCancelDraft={resetReimbursementDraft}
            onRemove={originalIndex => {
              handleRemoveReimbursement(openReimbursementsModal.employeeUuid, originalIndex)
            }}
          />
        </Components.Modal>
      )}
    </div>
  )
}

interface ReimbursementsModalBodyProps {
  employeeUuid: string
  employeeName: string
  rows: ReimbursementRow[]
  isAdding: boolean
  draftDescription: string
  draftAmount: string
  onStartAdding: () => void
  onChangeDescription: (value: string) => void
  onChangeAmount: (value: string) => void
  onSaveDraft: () => void
  onCancelDraft: () => void
  onRemove: (originalIndex: number) => void
}

function ReimbursementsModalBody({
  employeeUuid: _employeeUuid,
  employeeName,
  rows,
  isAdding,
  draftDescription,
  draftAmount,
  onStartAdding,
  onChangeDescription,
  onChangeAmount,
  onSaveDraft,
  onCancelDraft,
  onRemove,
}: ReimbursementsModalBodyProps) {
  const { Button, ButtonIcon, Heading, TextInput } = useComponentContext()

  type VisibleRow = ReimbursementRow & { originalIndex: number }
  const visibleRows: VisibleRow[] = rows
    .map((row, originalIndex) => ({ ...row, originalIndex }))
    .filter(row => parseFloat(row.amount || '0') !== 0)

  const dataViewProps = useDataView<VisibleRow>({
    data: visibleRows,
    columns: [
      {
        key: 'description',
        title: 'Description',
        render: row => row.description.trim() || 'Unnamed reimbursement',
      },
      {
        key: 'amount',
        title: 'Amount',
        render: row => formatNumberAsCurrency(parseFloat(row.amount || '0')),
      },
      {
        key: 'recurring',
        title: 'Type',
        render: row => (row.recurring ? 'Recurring' : 'One-time'),
      },
    ],
    itemMenu: row => {
      if (row.recurring) return null
      const displayDescription = row.description.trim() || 'Unnamed reimbursement'
      return (
        <ButtonIcon
          variant="tertiary"
          onClick={() => {
            onRemove(row.originalIndex)
          }}
          aria-label={`Remove ${displayDescription}`}
        >
          <TrashCanSvg aria-hidden />
        </ButtonIcon>
      )
    },
    emptyState: () => (
      <EmptyData title="No reimbursements added yet">
        <Button variant="secondary" onClick={onStartAdding} icon={<PlusCircleIcon aria-hidden />}>
          Add reimbursement
        </Button>
      </EmptyData>
    ),
  })

  return (
    <Flex flexDirection="column" gap={24}>
      <Heading as="h3" styledAs="h4">
        Reimbursements for {employeeName}
      </Heading>
      {!(visibleRows.length === 0 && isAdding) && (
        <DataView label="Reimbursements" {...dataViewProps} />
      )}
      {isAdding ? (
        <Flex flexDirection="column" gap={12}>
          <Grid gridTemplateColumns={{ base: '1fr', small: [320, 320] }} gap={20}>
            <TextInput
              name="newReimbursementDescription"
              label="Description"
              placeholder="e.g. Mileage"
              value={draftDescription}
              onChange={onChangeDescription}
            />
            <TextInput
              name="newReimbursementAmount"
              type="number"
              min={0}
              adornmentStart="$"
              isRequired
              label="Amount"
              value={draftAmount}
              onChange={onChangeAmount}
            />
          </Grid>
          <Flex gap={12}>
            <Button onClick={onSaveDraft}>Save reimbursement</Button>
            <Button variant="secondary" onClick={onCancelDraft}>
              Cancel
            </Button>
          </Flex>
        </Flex>
      ) : (
        visibleRows.length > 0 && (
          <div>
            <Button
              variant="secondary"
              onClick={onStartAdding}
              title="Add reimbursement"
              icon={<PlusCircleIcon aria-hidden />}
            >
              Add reimbursement
            </Button>
          </div>
        )
      )}
    </Flex>
  )
}
