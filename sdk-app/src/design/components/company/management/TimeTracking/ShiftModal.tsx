import { useEffect, useState, type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AppliedBreakPolicy, EmployeeJob, Shift } from './types'
import { formatDayWithWeekday, formatHoursWithUnit, formatTimeZoneAbbreviation } from './formatters'
import {
  calculateShiftHours,
  calculateWorkedHours,
  createShiftFormSchema,
  newShiftFormValues,
  toShiftFormValues,
  type ShiftFormInput,
  type ShiftFormValues,
  type ShiftSubmitValues,
} from './shiftForm'
import { resolveShiftTime, toZonedParts, zonedToUtcIso } from './timeZones'
import { ShiftBreaksBox } from './ShiftBreaksBox'
import { ActionsLayout, Flex, Grid, SelectField, TextInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type ShiftModalTarget =
  | { kind: 'edit'; shift: Shift }
  | { kind: 'add'; date: string; timeZone: string; breakPolicy: AppliedBreakPolicy | null }

export interface ShiftModalProps {
  target: ShiftModalTarget
  employeeName: string
  jobs: EmployeeJob[]
  serverErrors?: string[]
  overlapDate?: string | null
  isSubmitting?: boolean
  isDeleting?: boolean
  onSubmit: (values: ShiftSubmitValues) => void
  onDelete?: () => void
  onClose: () => void
  /** Rendered above the time fields, e.g. employee and date pickers when neither is known up front. */
  leadingFields?: ReactNode
}

function targetDetails(target: ShiftModalTarget) {
  if (target.kind === 'edit') {
    return {
      date: target.shift.date,
      timeZone: target.shift.timeZone,
      rules: target.shift.breakPolicy?.rules ?? [],
    }
  }
  return { date: target.date, timeZone: target.timeZone, rules: target.breakPolicy?.rules ?? [] }
}

/** Stands in for Gusto's shift drawer, since the SDK has no drawer primitive. */
export function ShiftModal({
  target,
  employeeName,
  jobs,
  serverErrors,
  overlapDate,
  isSubmitting,
  isDeleting,
  onSubmit,
  onDelete,
  onClose,
  leadingFields,
}: ShiftModalProps) {
  const Components = useComponentContext()
  const { date, timeZone, rules } = targetDetails(target)
  const isEdit = target.kind === 'edit'
  const [confirmation, setConfirmation] = useState<'discard' | 'delete' | null>(null)

  const formMethods = useForm<ShiftFormInput, unknown, ShiftFormValues>({
    resolver: zodResolver(createShiftFormSchema({ requiresBreakType: rules.length > 0 })),
    defaultValues: isEdit
      ? toShiftFormValues(target.shift)
      : todayAwareDefaults(newShiftFormValues({ jobId: jobs[0]?.id ?? null }), date, timeZone),
  })

  const values = formMethods.watch()

  // Jobs change when the employee is picked inside the modal, so a stale selection is replaced.
  useEffect(() => {
    const currentJobId = formMethods.getValues('jobId')
    if (!jobs.some(job => job.id === currentJobId)) {
      formMethods.setValue('jobId', jobs[0]?.id ?? '')
    }
  }, [jobs, formMethods])
  const shiftHours = calculateShiftHours(values)
  const workedHours = calculateWorkedHours(values, rules)
  const zone = formatTimeZoneAbbreviation(
    zonedToUtcIso(date, values.startTime || '12:00', timeZone),
    timeZone,
  )

  const requestClose = () => {
    if (formMethods.formState.isDirty) {
      setConfirmation('discard')
      return
    }
    onClose()
  }

  const footerActions = (
    <ActionsLayout>
      <Components.Button variant="secondary" onClick={requestClose} isDisabled={isSubmitting}>
        Cancel
      </Components.Button>
      <Components.Button
        isLoading={isSubmitting}
        onClick={() => {
          void formMethods.handleSubmit(data => {
            const now = Date.now()
            if (Date.parse(zonedToUtcIso(date, data.startTime, timeZone)) > now) {
              formMethods.setError('startTime', { message: 'Start time can’t be in the future.' })
              return
            }
            if (
              !data.isOngoing &&
              Date.parse(resolveShiftTime(date, data.startTime, data.endTime, timeZone)) > now
            ) {
              formMethods.setError('endTime', {
                message: 'End time can’t be in the future.',
              })
              return
            }
            const hoursWorked = calculateWorkedHours(data, rules)
            onSubmit({
              ...data,
              hoursWorked: hoursWorked === null ? null : Math.round(hoursWorked * 1000) / 1000,
            })
          })()
        }}
      >
        Save
      </Components.Button>
    </ActionsLayout>
  )

  return (
    <>
      <Components.Modal
        isOpen
        onClose={requestClose}
        footer={
          isEdit && onDelete ? (
            <Flex flexDirection="row" justifyContent="space-between" alignItems="center" gap={8}>
              <Components.Button
                variant="error"
                isLoading={isDeleting}
                isDisabled={isSubmitting}
                onClick={() => {
                  setConfirmation('delete')
                }}
              >
                Delete shift
              </Components.Button>
              {footerActions}
            </Flex>
          ) : (
            footerActions
          )
        }
      >
        <FormProvider {...formMethods}>
          <Flex flexDirection="column" gap={20} alignItems="stretch">
            <Flex flexDirection="column" gap={4}>
              <Components.Heading as="h3">{isEdit ? 'Edit shift' : 'Add shift'}</Components.Heading>
              <Components.Text variant="supporting">
                {leadingFields
                  ? `Times in ${zone}`
                  : `${employeeName} · ${formatDayWithWeekday(date)} · Times in ${zone}`}
              </Components.Text>
            </Flex>

            {leadingFields}

            {overlapDate ? (
              <Components.Alert status="error" label="Times overlap another shift">
                <Components.Text>
                  {`These times overlap another shift on ${formatDayWithWeekday(overlapDate)}. Adjust the start or end time to save.`}
                </Components.Text>
              </Components.Alert>
            ) : serverErrors && serverErrors.length > 0 ? (
              <Components.Alert status="error" label="Something went wrong.">
                <Flex flexDirection="column" gap={4}>
                  {serverErrors.map(message => (
                    <Components.Text key={message}>{message}</Components.Text>
                  ))}
                </Flex>
              </Components.Alert>
            ) : null}

            <Flex flexDirection="column" gap={8} alignItems="stretch">
              <Grid gap={16} gridTemplateColumns={{ base: '1fr', small: '1fr 1fr' }}>
                <TextInputField name="startTime" label="Start time" type="time" isRequired />
                {values.isOngoing ? (
                  <Flex flexDirection="column" gap={8} alignItems="flex-start">
                    <Components.Text weight="medium">End time</Components.Text>
                    <Components.Button
                      variant="secondary"
                      onClick={() => {
                        const now = new Date()
                        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
                        formMethods.setValue('isOngoing', false, { shouldDirty: true })
                        formMethods.setValue('endTime', time, { shouldDirty: true })
                      }}
                    >
                      Clock out
                    </Components.Button>
                  </Flex>
                ) : (
                  <TextInputField name="endTime" label="End time" type="time" isRequired />
                )}
              </Grid>
              <Components.Text size="sm" variant="supporting">
                {shiftHours === null
                  ? 'Shift in progress'
                  : workedHours !== null && workedHours < shiftHours
                    ? `Total: ${formatHoursWithUnit(shiftHours)} · ${formatHoursWithUnit(workedHours)} after unpaid breaks`
                    : `Total: ${formatHoursWithUnit(shiftHours)}`}
              </Components.Text>
            </Flex>

            <ShiftBreaksBox date={date} timeZone={timeZone} rules={rules} />

            {jobs.length > 1 ? (
              <SelectField
                name="jobId"
                label="Job"
                placeholder="Select a job"
                options={jobs.map(job => ({ value: job.id, label: job.title }))}
              />
            ) : null}
          </Flex>
        </FormProvider>
      </Components.Modal>

      <Components.Dialog
        isOpen={confirmation === 'discard'}
        title="Discard unsaved changes?"
        primaryActionLabel="Discard changes"
        closeActionLabel="Keep editing"
        isDestructive
        onClose={() => {
          setConfirmation(null)
        }}
        onPrimaryActionClick={() => {
          setConfirmation(null)
          onClose()
        }}
      >
        Your changes to this shift haven’t been saved.
      </Components.Dialog>

      <Components.Dialog
        isOpen={confirmation === 'delete'}
        title="Delete this shift?"
        primaryActionLabel="Delete shift"
        closeActionLabel="Cancel"
        isDestructive
        isPrimaryActionLoading={isDeleting}
        onClose={() => {
          setConfirmation(null)
        }}
        onPrimaryActionClick={() => {
          setConfirmation(null)
          onDelete?.()
        }}
      >
        {`This removes the shift and its breaks from ${employeeName}’s timesheet. This action cannot be undone.`}
      </Components.Dialog>
    </>
  )
}

/** Shifts can't end in the future, so a shift added for today defaults to ending now. */
function todayAwareDefaults(
  defaults: ShiftFormInput,
  date: string,
  timeZone: string,
): ShiftFormInput {
  const now = toZonedParts(new Date().toISOString(), timeZone)
  if (now.date !== date || defaults.endTime <= now.time) return defaults
  return {
    ...defaults,
    startTime: defaults.startTime < now.time ? defaults.startTime : '00:00',
    endTime: now.time,
  }
}
