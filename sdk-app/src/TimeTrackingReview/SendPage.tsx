import { useEffect, useState } from 'react'
import {
  EFFECT_LABEL,
  REVIEW_STATE_LABEL,
  formatDay,
  formatHours,
  formatPeriod,
  formatShortDate,
  localStartDate,
  reviewState,
  scheduleLabel,
  willSync,
  workedHours,
  type ApiPayPeriod,
  type ApiPaySchedule,
  type ApiShift,
  type Person,
} from './model'
import { ChangePin, GapPin, SubPage } from './parts'
import type { Preview } from './preview'
import { DataView, Flex, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface IncludedRow {
  person: Person
  count: number
  hours: number
}

interface SkippedRow {
  shift: ApiShift
  name: string
}

type Phase = 'review' | 'sending' | 'sent' | 'failed'

export function SendPage({
  companyId,
  schedule,
  period,
  people,
  shifts,
  isUpdate,
  onClose,
  onReview,
  onSent,
}: {
  companyId: string
  schedule: ApiPaySchedule
  period: ApiPayPeriod
  people: Person[]
  shifts: ApiShift[]
  isUpdate: boolean
  onClose: () => void
  onReview: (personUuid: string) => void
  onSent: (included: ApiShift[], preview: Preview) => void
}) {
  const Components = useComponentContext()
  const [phase, setPhase] = useState<Phase>('review')
  const included = shifts.filter(willSync)
  const skipped = shifts.filter(shift => !willSync(shift))
  const rows: IncludedRow[] = people
    .map(person => {
      const mine = included.filter(s => s.entity_uuid === person.employee.uuid)
      return { person, count: mine.length, hours: mine.reduce((sum, s) => sum + workedHours(s), 0) }
    })
    .filter(row => row.count > 0)
    .sort((a, b) => a.person.name.localeCompare(b.person.name))
  const totalHours = rows.reduce((sum, r) => sum + r.hours, 0)
  const nameOf = (uuid: string) => people.find(p => p.employee.uuid === uuid)?.name ?? uuid
  const payrollName = period.payroll
    ? `${formatShortDate(period.payroll.check_date)} payroll`
    : 'payroll'

  const [included0] = useState(included)
  const [wasUpdate] = useState(isUpdate)
  useEffect(() => {
    if (phase !== 'sending') return
    const timer = window.setTimeout(() => {
      if (period.payroll?.processed) {
        setPhase('failed')
        return
      }
      onSent(included0, {
        title: wasUpdate ? 'Update payroll' : 'Send to payroll',
        requests: [
          {
            method: 'POST',
            path: `/v1/companies/${companyId}/time_tracking/payroll_syncs`,
            body: {
              pay_schedule_uuid: schedule.uuid,
              start_date: period.start_date,
              end_date: period.end_date,
            },
            caption: 'Then poll the sync by its UUID until it finishes. The path is a best guess.',
          },
        ],
        gapIds: ['sync-limits', 'which-timesheets'],
      })
      setPhase('sent')
    }, 1500)
    return () => {
      window.clearTimeout(timer)
    }
  }, [phase, period, included0, wasUpdate, companyId, schedule, onSent])

  const dataView = useDataView<IncludedRow>({
    data: rows,
    columns: [
      { title: 'Person', render: ({ person }) => person.name },
      { title: 'Job', render: ({ person }) => person.title },
      { title: 'Shifts', justify: 'end', render: ({ count }) => count },
      { title: 'Hours', justify: 'end', render: ({ hours }) => formatHours(hours) },
      {
        title: <>Note</>,
        render: ({ person }) =>
          person.effect === 'all' ? (
            ''
          ) : (
            <Components.Badge status="warning">{EFFECT_LABEL[person.effect]}</Components.Badge>
          ),
      },
    ],
  })

  const skippedView = useDataView<SkippedRow>({
    data: skipped.map(shift => ({ shift, name: nameOf(shift.entity_uuid) })),
    columns: [
      { title: 'Person', render: ({ name }) => name },
      { title: 'Date', render: ({ shift }) => formatDay(localStartDate(shift)) },
      { title: 'Why', render: ({ shift }) => REVIEW_STATE_LABEL[reviewState(shift)] },
    ],
    itemMenu: ({ shift, name }) => (
      <Components.Button
        variant="tertiary"
        aria-label={`Review ${name}’s shifts`}
        onClick={() => {
          onReview(shift.entity_uuid)
        }}
      >
        Review
      </Components.Button>
    ),
  })

  const title = `${wasUpdate ? 'Update payroll' : 'Send to payroll'}: ${formatPeriod(period)}`

  if (phase === 'sent' || phase === 'failed') {
    return (
      <SubPage
        narrow
        backLabel="Timesheets"
        onBack={onClose}
        title={
          <>
            {title} <ChangePin id="send-page" />
          </>
        }
        footer={
          <Components.Button variant="secondary" onClick={onClose}>
            Back to timesheets
          </Components.Button>
        }
      >
        {phase === 'sent' ? (
          <Components.Alert status="success" label={`Hours sent to the ${payrollName}`}>
            {included0.length} shifts for {rows.length} people, {formatHours(totalHours)} hours. Run
            that payroll when you’re ready; sending again replaces these hours.
          </Components.Alert>
        ) : (
          <Components.Alert status="error" label="Couldn’t send hours">
            The {payrollName} was already processed, so its hours can’t change.
          </Components.Alert>
        )}
        {phase === 'sent' && (
          <Components.Text size="sm" variant="supporting">
            This receipt is built from what this page sent. The API can’t list what a sync included,
            or say which payroll it landed on. <GapPin id="which-timesheets" />
          </Components.Text>
        )}
      </SubPage>
    )
  }

  return (
    <SubPage
      backLabel="Timesheets"
      onBack={onClose}
      title={
        <>
          {title} <ChangePin id="send-page" />
        </>
      }
      description={`${scheduleLabel(schedule)} · ${included.length} approved, finished shifts · ${formatHours(totalHours)} hours → ${payrollName}`}
      footer={
        <Flex justifyContent="flex-end" gap={12}>
          <Components.Button variant="secondary" onClick={onClose} isDisabled={phase === 'sending'}>
            Cancel
          </Components.Button>
          <Components.Button
            isLoading={phase === 'sending'}
            isDisabled={included.length === 0}
            onClick={() => {
              setPhase('sending')
            }}
          >
            {wasUpdate ? 'Update payroll' : 'Send to payroll'}
          </Components.Button>
        </Flex>
      }
    >
      <Components.Alert status="warning" label="This replaces the hours on payroll">
        It recalculates everyone on {scheduleLabel(schedule)} for these dates, including hours fixed
        by hand in payroll. <GapPin id="sync-limits" />
      </Components.Alert>
      <DataView label="Included" {...dataView} />
      <Components.Text size="sm" variant="supporting">
        What each person has on payroll now can’t be read, so the change can’t be shown.{' '}
      </Components.Text>
      {skipped.length > 0 && (
        <Flex flexDirection="column" gap={8}>
          <Components.Heading as="h3" styledAs="h5">
            {skipped.length} won’t be sent
          </Components.Heading>
          <DataView label="Won’t be sent" {...skippedView} />
        </Flex>
      )}
    </SubPage>
  )
}
