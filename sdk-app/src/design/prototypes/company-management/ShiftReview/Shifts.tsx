import { useMemo, useState } from 'react'
import { useEmployeesList } from '@gusto/embedded-api/react-query/employeesList'
import { ShiftList } from '../../../components/company/management/ShiftReview/ShiftList'
import type { ShiftStatusFilter } from '../../../components/company/management/ShiftReview/types'
import type {
  BulkActionResult,
  TimesheetStatus,
} from '../../../components/company/management/TimeTracking/types'
import {
  addDaysToDateString,
  zonedToUtcIso,
} from '../../../components/company/management/TimeTracking/timeZones'
import { Skeleton } from '../../../components/common/Skeleton'
import { formatDayWithWeekday } from '../../../components/company/management/TimeTracking/formatters'
import {
  employeeName,
  isSheetApprovable,
  toShift,
  type TimeTrackingEmployee,
} from '../TimeTracking/adapters'
import {
  errorMessages,
  useChangeTimeSheetStatus,
  useDeleteTimeSheets,
  useTimeSheetPage,
  type ApiTimeSheet,
  type StatusChangeResult,
} from '../TimeTracking/timeTrackingApi'
import { toShiftListRow } from './adapters'
import { Flex } from '@/components/Common'
import { addDays, formatDateToStringDate } from '@/helpers/dateFormatting'
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter/useDateRangeFilter'
import { usePagination } from '@/hooks/usePagination/usePagination'

const DEFAULT_RANGE_DAYS = 14

export interface ShiftsProps {
  companyId: string
  onAddShift: (request: AddShiftRequest) => void
  onEditShift: (request: EditShiftRequest) => void
}

export interface AddShiftRequest {
  initialEmployeeUuid: string | null
  knownSheets: ApiTimeSheet[]
}

export interface EditShiftRequest {
  sheet: ApiTimeSheet
  employee: TimeTrackingEmployee | undefined
}

// Bounded at the viewer's midnight, so shifts recorded in another time zone can fall outside an edge.
function toShiftStartBounds(startDate: Date, endDate: Date) {
  const viewerTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return {
    shiftStartedAfter: zonedToUtcIso(
      formatDateToStringDate(startDate) ?? '',
      '00:00',
      viewerTimeZone,
    ),
    shiftStartedBefore: zonedToUtcIso(
      addDaysToDateString(formatDateToStringDate(endDate) ?? '', 1),
      '00:00',
      viewerTimeZone,
    ),
  }
}

export function Shifts({ companyId, onAddShift, onEditShift }: ShiftsProps) {
  const [defaultRange] = useState(() => {
    const today = new Date()
    return { start: addDays(today, -(DEFAULT_RANGE_DAYS - 1)), end: today }
  })
  const [statusFilter, setStatusFilter] = useState<ShiftStatusFilter>('all')
  const [employeeFilter, setEmployeeFilter] = useState<string | null>(null)
  // Sheets are kept, not just ids, so selections on other pages still have a version to submit.
  const [selectedSheets, setSelectedSheets] = useState<Map<string, ApiTimeSheet>>(new Map())
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, TimesheetStatus>>({})
  const [optimisticallyDeletedIds, setOptimisticallyDeletedIds] = useState<string[]>([])
  const [actionResult, setActionResult] = useState<BulkActionResult | null>(null)
  const { currentPage, itemsPerPage, getPaginationProps, resetPage } = usePagination({
    defaultItemsPerPage: 25,
  })
  const handleFilterChange = () => {
    resetPage()
    setSelectedSheets(new Map())
  }
  const dateRangeFilter = useDateRangeFilter({
    initialStartDate: defaultRange.start,
    initialEndDate: defaultRange.end,
    onFilterChange: handleFilterChange,
  })

  const shiftsQuery = useTimeSheetPage(companyId, {
    ...toShiftStartBounds(
      dateRangeFilter.startDate ?? defaultRange.start,
      dateRangeFilter.endDate ?? defaultRange.end,
    ),
    status: statusFilter === 'all' ? null : statusFilter,
    employeeUuids: employeeFilter ? [employeeFilter] : [],
    page: currentPage,
    per: itemsPerPage,
  })

  const employeesQuery = useEmployeesList({ companyId }, { throwOnError: false })
  const employees = useMemo(
    () => (employeesQuery.data?.showEmployees ?? []) as TimeTrackingEmployee[],
    [employeesQuery.data],
  )
  const employeesByUuid = useMemo(
    () => new Map(employees.map(employee => [employee.uuid, employee])),
    [employees],
  )
  const employeeOptions = useMemo(
    () =>
      employees
        .filter(employee => !employee.terminated)
        .map(employee => ({ value: employee.uuid, label: employeeName(employee) })),
    [employees],
  )

  const changeStatus = useChangeTimeSheetStatus(companyId)
  const deleteTimeSheets = useDeleteTimeSheets()

  const pageSheets = useMemo(() => shiftsQuery.data?.body ?? [], [shiftsQuery.data])

  const rows = useMemo(() => {
    const now = new Date()
    return pageSheets
      .filter(sheet => !optimisticallyDeletedIds.includes(sheet.uuid))
      .map(sheet => {
        const row = toShiftListRow(sheet, employeesByUuid.get(sheet.entity_uuid), now)
        const optimisticStatus = optimisticStatuses[sheet.uuid]
        return optimisticStatus ? { ...row, status: optimisticStatus } : row
      })
  }, [pageSheets, employeesByUuid, optimisticStatuses, optimisticallyDeletedIds])

  const selected = [...selectedSheets.values()]
  const approvableSelection = selected.filter(sheet => isSheetApprovable(sheet))

  const shiftLabel = (sheet: ApiTimeSheet) => {
    const employee = employeesByUuid.get(sheet.entity_uuid)
    const name = employee ? employeeName(employee) : 'Unknown employee'
    return `${name} · ${formatDayWithWeekday(toShift(sheet).date)}`
  }

  const toActionResult = (
    action: BulkActionResult['action'],
    targets: ApiTimeSheet[],
    results: StatusChangeResult[],
  ): BulkActionResult => {
    const resultsByUuid = new Map(results.map(result => [result.uuid, result]))
    return {
      action,
      succeeded: targets
        .filter(sheet => resultsByUuid.get(sheet.uuid)?.ok)
        .map(sheet => ({ id: sheet.uuid, label: shiftLabel(sheet) })),
      failed: targets
        .filter(sheet => !resultsByUuid.get(sheet.uuid)?.ok)
        .map(sheet => ({
          id: sheet.uuid,
          label: shiftLabel(sheet),
          messages: resultsByUuid.get(sheet.uuid)?.messages ?? [],
        })),
    }
  }

  const failAll = (targets: ApiTimeSheet[], error: unknown): StatusChangeResult[] =>
    targets.map(sheet => ({ uuid: sheet.uuid, ok: false, messages: errorMessages(error) }))

  // Rows show the requested state immediately. The mutation resolves only after the time sheet
  // queries refetch, so clearing the overlay then reveals the server's state: kept on success,
  // reverted for anything that failed.
  const applyStatus = async (status: TimesheetStatus) => {
    const targets = approvableSelection.filter(sheet => sheet.status !== status)
    if (targets.length === 0) return
    const targetIds = targets.map(sheet => sheet.uuid)
    setSelectedSheets(new Map())
    setActionResult(null)
    setOptimisticStatuses(prev => ({
      ...prev,
      ...Object.fromEntries(targetIds.map(id => [id, status])),
    }))
    let results: StatusChangeResult[]
    try {
      results = await changeStatus.mutateAsync({
        targets: targets.map(sheet => ({ uuid: sheet.uuid, version: sheet.version })),
        status,
      })
    } catch (error) {
      results = failAll(targets, error)
    } finally {
      setOptimisticStatuses(prev =>
        Object.fromEntries(Object.entries(prev).filter(([id]) => !targetIds.includes(id))),
      )
    }
    setActionResult(toActionResult(status, targets, results))
  }

  const deleteShift = async (shiftId: string) => {
    const sheet = pageSheets.find(pageSheet => pageSheet.uuid === shiftId)
    if (!sheet) return
    setSelectedSheets(prev => {
      const next = new Map(prev)
      next.delete(shiftId)
      return next
    })
    setActionResult(null)
    setOptimisticallyDeletedIds(prev => [...prev, shiftId])
    let results: StatusChangeResult[]
    try {
      results = await deleteTimeSheets.mutateAsync([{ uuid: sheet.uuid, version: sheet.version }])
    } catch (error) {
      results = failAll([sheet], error)
    } finally {
      setOptimisticallyDeletedIds(prev => prev.filter(id => id !== shiftId))
    }
    setActionResult(toActionResult('deleted', [sheet], results))
  }

  if (!shiftsQuery.data && shiftsQuery.isPending) {
    return (
      <Flex flexDirection="column" gap={16} alignItems="stretch">
        <Skeleton width="30%" height={32} />
        <Skeleton width="60%" height={48} />
        <Skeleton width="100%" height={320} />
      </Flex>
    )
  }

  return (
    <ShiftList
      rows={rows}
      dateRangeFilter={dateRangeFilter}
      statusFilter={statusFilter}
      employeeOptions={employeeOptions}
      employeeFilter={employeeFilter}
      selectedShiftIds={[...selectedSheets.keys()]}
      canApproveSelection={approvableSelection.some(sheet => sheet.status !== 'approved')}
      canUnapproveSelection={approvableSelection.some(sheet => sheet.status === 'approved')}
      actionResult={actionResult}
      isFetching={shiftsQuery.isFetching}
      errorMessage={shiftsQuery.error ? errorMessages(shiftsQuery.error).join(' ') : null}
      pagination={
        shiftsQuery.data
          ? getPaginationProps(shiftsQuery.data.headers, shiftsQuery.isFetching)
          : undefined
      }
      onStatusFilterChange={status => {
        setStatusFilter(status)
        handleFilterChange()
      }}
      onEmployeeFilterChange={employeeUuid => {
        setEmployeeFilter(employeeUuid)
        handleFilterChange()
      }}
      onSelectedShiftIdsChange={shiftIds => {
        const pageSheetsById = new Map(pageSheets.map(sheet => [sheet.uuid, sheet]))
        setSelectedSheets(
          prev =>
            new Map(
              shiftIds.flatMap(id => {
                const sheet = pageSheetsById.get(id) ?? prev.get(id)
                return sheet ? [[id, sheet] as const] : []
              }),
            ),
        )
      }}
      onApproveSelected={() => {
        void applyStatus('approved')
      }}
      onUnapproveSelected={() => {
        void applyStatus('pending')
      }}
      onAddShift={() => {
        setActionResult(null)
        onAddShift({ initialEmployeeUuid: employeeFilter, knownSheets: pageSheets })
      }}
      onEditShift={shiftId => {
        const sheet = pageSheets.find(pageSheet => pageSheet.uuid === shiftId)
        if (!sheet) return
        setActionResult(null)
        onEditShift({ sheet, employee: employeesByUuid.get(sheet.entity_uuid) })
      }}
      onDeleteShift={shiftId => {
        void deleteShift(shiftId)
      }}
      onDismissActionResult={() => {
        setActionResult(null)
      }}
    />
  )
}
