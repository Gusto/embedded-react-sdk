import { useMemo, useState } from 'react'
import { ShiftModal } from '../../../components/company/management/TimeTracking/ShiftModal'
import { formatDayWithWeekday } from '../../../components/company/management/TimeTracking/formatters'
import { toZonedParts } from '../../../components/company/management/TimeTracking/timeZones'
import type {
  AppliedBreakPolicy,
  SelectOption,
} from '../../../components/company/management/TimeTracking/types'
import {
  employeeName,
  jobsOf,
  primaryJobId,
  toBreakPolicy,
  toShiftCreateBody,
  type TimeTrackingEmployee,
} from '../TimeTracking/adapters'
import {
  errorMessages,
  useBreakPolicies,
  useCreateTimeSheet,
  type ApiTimeSheet,
} from '../TimeTracking/timeTrackingApi'
import { Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { formatDateToStringDate, normalizeToDate } from '@/helpers/dateFormatting'

export interface AddShiftModalProps {
  companyId: string
  employees: TimeTrackingEmployee[]
  employeeOptions: SelectOption[]
  initialEmployeeUuid: string | null
  knownSheets: ApiTimeSheet[]
  onClose: () => void
  onCreated: (message: string) => void
}

export function AddShiftModal({
  companyId,
  employees,
  employeeOptions,
  initialEmployeeUuid,
  knownSheets,
  onClose,
  onCreated,
}: AddShiftModalProps) {
  const Components = useComponentContext()
  const [employeeUuid, setEmployeeUuid] = useState<string | null>(initialEmployeeUuid)
  const [date, setDate] = useState(() => formatDateToStringDate(new Date()) ?? '')
  const [showMissingFields, setShowMissingFields] = useState(false)
  const [serverErrors, setServerErrors] = useState<string[]>([])
  const [overlapDate, setOverlapDate] = useState<string | null>(null)

  const breakQuery = useBreakPolicies(companyId)
  const createTimeSheet = useCreateTimeSheet(companyId)

  const employee = employees.find(candidate => candidate.uuid === employeeUuid)
  const jobs = useMemo(() => jobsOf(employee), [employee])
  const employeeSheets = knownSheets.filter(sheet => sheet.entity_uuid === employeeUuid)
  const timeZone = employeeSheets[0]?.time_zone ?? Intl.DateTimeFormat().resolvedOptions().timeZone

  const breakPolicy = (breakQuery.data ?? [])
    .map(toBreakPolicy)
    .find(policy => employeeUuid !== null && policy.employeeUuids.includes(employeeUuid))
  // The API doesn't expose assignment dates, and rules are rejected on shifts dated before the
  // assignment. Today is always covered; earlier dates only once a prior shift shows the policy.
  const isBreakPolicyInEffect =
    breakPolicy !== undefined &&
    (date >= toZonedParts(new Date().toISOString(), timeZone).date ||
      employeeSheets.some(
        sheet =>
          toZonedParts(sheet.shift_started_at, sheet.time_zone).date <= date &&
          sheet.effective_break_policy?.name === breakPolicy.name,
      ))
  const appliedBreakPolicy: AppliedBreakPolicy | null =
    breakPolicy && isBreakPolicyInEffect
      ? {
          name: breakPolicy.name,
          jurisdiction: breakPolicy.jurisdiction,
          payPremium: breakPolicy.payPremium,
          rules: breakPolicy.rules,
        }
      : null

  const selectedDate = date ? normalizeToDate(date) : null

  return (
    <ShiftModal
      target={{ kind: 'add', date, timeZone, breakPolicy: appliedBreakPolicy }}
      employeeName={employee ? employeeName(employee) : ''}
      jobs={jobs}
      serverErrors={serverErrors}
      overlapDate={overlapDate}
      isSubmitting={createTimeSheet.isPending}
      onClose={onClose}
      leadingFields={
        <Grid gap={16} gridTemplateColumns={{ base: '1fr', small: '1fr 1fr' }}>
          <Components.ComboBox
            label="Employee"
            placeholder="Select an employee"
            isRequired
            options={employeeOptions}
            value={employeeUuid}
            isInvalid={showMissingFields && !employeeUuid}
            errorMessage={showMissingFields && !employeeUuid ? 'Select an employee' : undefined}
            onChange={value => {
              setEmployeeUuid(value || null)
              setOverlapDate(null)
            }}
          />
          <Components.DatePicker
            label="Date"
            isRequired
            value={selectedDate}
            maxDate={new Date()}
            isInvalid={showMissingFields && !date}
            errorMessage={showMissingFields && !date ? 'Select a date' : undefined}
            onChange={value => {
              setDate(value ? (formatDateToStringDate(value) ?? '') : '')
              setOverlapDate(null)
            }}
          />
        </Grid>
      }
      onSubmit={values => {
        if (!employeeUuid || !date) {
          setShowMissingFields(true)
          return
        }
        setServerErrors([])
        setOverlapDate(null)
        createTimeSheet
          .mutateAsync(
            toShiftCreateBody(employeeUuid, date, timeZone, {
              ...values,
              jobId: values.jobId || primaryJobId(employee) || '',
            }),
          )
          .then(() => {
            onCreated(
              `Shift added for ${employee ? employeeName(employee) : 'employee'} on ${formatDayWithWeekday(date)}.`,
            )
          })
          .catch((error: unknown) => {
            const messages = errorMessages(error)
            if (messages.some(message => /overlap/i.test(message))) setOverlapDate(date)
            else setServerErrors(messages)
          })
      }}
    />
  )
}
