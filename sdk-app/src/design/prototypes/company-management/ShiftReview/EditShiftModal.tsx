import { useMemo, useState } from 'react'
import { ShiftModal } from '../../../components/company/management/TimeTracking/ShiftModal'
import { formatDayWithWeekday } from '../../../components/company/management/TimeTracking/formatters'
import {
  employeeName,
  jobsOf,
  toShift,
  toShiftUpdateBody,
  type TimeTrackingEmployee,
} from '../TimeTracking/adapters'
import {
  errorMessages,
  useUpdateTimeSheet,
  type ApiTimeSheet,
} from '../TimeTracking/timeTrackingApi'

export interface EditShiftModalProps {
  sheet: ApiTimeSheet
  employee: TimeTrackingEmployee | undefined
  onClose: () => void
  onSaved: (message: string) => void
}

export function EditShiftModal({ sheet, employee, onClose, onSaved }: EditShiftModalProps) {
  const [serverErrors, setServerErrors] = useState<string[]>([])
  const [overlapDate, setOverlapDate] = useState<string | null>(null)

  const updateTimeSheet = useUpdateTimeSheet()

  const shift = toShift(sheet)
  const jobs = useMemo(() => jobsOf(employee), [employee])
  const name = employee ? employeeName(employee) : 'Unknown employee'
  const shiftDay = formatDayWithWeekday(shift.date)

  return (
    <ShiftModal
      target={{ kind: 'edit', shift }}
      employeeName={name}
      jobs={jobs}
      serverErrors={serverErrors}
      overlapDate={overlapDate}
      isSubmitting={updateTimeSheet.isPending}
      onClose={onClose}
      onSubmit={values => {
        setServerErrors([])
        setOverlapDate(null)
        updateTimeSheet
          .mutateAsync({ uuid: shift.id, body: toShiftUpdateBody(shift, values) })
          .then(() => {
            onSaved(`Shift updated for ${name} on ${shiftDay}.`)
          })
          .catch((error: unknown) => {
            const messages = errorMessages(error)
            if (messages.some(message => /overlap/i.test(message))) setOverlapDate(shift.date)
            else setServerErrors(messages)
          })
      }}
    />
  )
}
