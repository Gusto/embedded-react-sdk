import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAllPages, withQuery } from './api'
import {
  addDays,
  breakRuleLabel,
  currentWorkweekStart,
  eligibility,
  formatDay,
  hoursLabel,
  localStartDate,
  scheduleLabel,
  type ApiBreakPolicy,
  type ApiOvertimePolicy,
  type ApiPaySchedule,
  type ApiShift,
  type Person,
} from './model'
import { ChangePin, GapPin, SubPage, type Crumb } from './parts'
import { simId, type Notify, type Preview, type PreviewRequest } from './preview'
import { DataView, Flex, Grid, HamburgerMenu, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type PolicyKind = 'overtime' | 'break'
type PolicyView = 'details' | 'edit' | 'assign'
type AnyPolicy = ApiOvertimePolicy | ApiBreakPolicy

const KIND_LABEL: Record<PolicyKind, string> = {
  overtime: 'Overtime policy',
  break: 'Break policy',
}

function overtimeRules(p: ApiOvertimePolicy) {
  return [
    `Weekly over ${p.weekly_overtime_hours_threshold ?? '—'}h`,
    p.daily_overtime_hours_threshold && `daily over ${p.daily_overtime_hours_threshold}h`,
    p.double_overtime_hours_threshold && `double over ${p.double_overtime_hours_threshold}h`,
    p.work_week_consecutive_days_threshold && '7th day rule',
  ]
    .filter(Boolean)
    .join(' · ')
}

function breakRules(p: ApiBreakPolicy) {
  return p.rules
    .map(r => `${breakRuleLabel(r)} per ${hoursLabel(r.for_hours_worked_in_minutes)}`)
    .join('; ')
}

export interface PolicyData {
  overtimePolicies: ApiOvertimePolicy[]
  breakPolicies: ApiBreakPolicy[]
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function PoliciesTab({
  companyId,
  people,
  schedules,
  overtimePolicies,
  breakPolicies,
  onPoliciesChange,
  onNotify,
}: {
  companyId: string
  people: Person[]
  schedules: ApiPaySchedule[]
  overtimePolicies: ApiOvertimePolicy[]
  breakPolicies: ApiBreakPolicy[]
  onPoliciesChange: (next: PolicyData) => void
  onNotify: Notify
}) {
  const Components = useComponentContext()
  const [todayShifts, setTodayShifts] = useState<ApiShift[]>([])
  const [deleting, setDeleting] = useState<{ kind: PolicyKind; policy: AnyPolicy } | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const [pageKind, pageUuid] = (searchParams.get('policy') ?? '').split(':') as [
    PolicyKind | '',
    string | undefined,
  ]
  const pageView = searchParams.get('view') as PolicyView | null
  const cameFromDetails = searchParams.get('from') === 'details'
  const pagePolicy: AnyPolicy | undefined =
    pageKind === 'overtime'
      ? overtimePolicies.find(p => p.uuid === pageUuid)
      : pageKind === 'break'
        ? breakPolicies.find(p => p.uuid === pageUuid)
        : undefined

  const policyHref = (kind: PolicyKind, uuid: string, view: PolicyView, from?: 'details') => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', 'policies')
    params.set('policy', `${kind}:${uuid}`)
    params.set('view', view)
    if (from) params.set('from', from)
    else params.delete('from')
    return `?${params.toString()}`
  }
  const openPage = (kind: PolicyKind, uuid: string, view: PolicyView, from?: 'details') => {
    setSearchParams(new URLSearchParams(policyHref(kind, uuid, view, from).slice(1)))
  }
  const openList = () => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev)
      params.delete('policy')
      params.delete('view')
      params.delete('from')
      return params
    })
  }
  const closePage = () => {
    if (cameFromDetails && pageKind && pageUuid && pageUuid !== 'new') {
      openPage(pageKind, pageUuid, 'details')
      return
    }
    openList()
  }

  useEffect(() => {
    const controller = new AbortController()
    const today = todayIso()
    const path = withQuery(`/v1/companies/${companyId}/time_tracking/time_sheets`, {
      entity_type: 'Employee',
      shift_started_after: `${addDays(today, -1)}T00:00:00Z`,
    })
    getAllPages<ApiShift>(path, 500, controller.signal)
      .then(all => {
        setTodayShifts(all.filter(s => localStartDate(s) === today))
      })
      .catch(() => {
        if (!controller.signal.aborted) setTodayShifts([])
      })
    return () => {
      controller.abort()
    }
  }, [companyId])

  const breakToday = useMemo(
    () => new Set(todayShifts.filter(s => s.breaks.length > 0).map(s => s.entity_uuid)),
    [todayShifts],
  )
  const nameOf = (uuid: string) => people.find(p => p.employee.uuid === uuid)?.name ?? 'Unknown'
  const eligiblePeople = people.filter(p => eligibility(p.employee).eligible)
  const uncovered = eligiblePeople.filter(p => !p.overtimePolicy || !p.breakPolicy)

  const today = todayIso()
  const workweeks = schedules.map(schedule => ({
    schedule,
    start: schedule.workweek_start_day
      ? currentWorkweekStart(schedule.workweek_start_day, today)
      : null,
  }))

  const current: PolicyData = { overtimePolicies, breakPolicies }

  const savePolicy = (
    kind: PolicyKind,
    policy: ApiOvertimePolicy | ApiBreakPolicy,
    preview: Preview,
  ) => {
    const isNew = !(kind === 'overtime' ? overtimePolicies : breakPolicies).some(
      p => p.uuid === policy.uuid,
    )
    const upsert = <T extends { uuid: string }>(list: T[], item: T) =>
      isNew ? [...list, item] : list.map(p => (p.uuid === item.uuid ? item : p))
    onPoliciesChange(
      kind === 'overtime'
        ? { ...current, overtimePolicies: upsert(overtimePolicies, policy as ApiOvertimePolicy) }
        : { ...current, breakPolicies: upsert(breakPolicies, policy as ApiBreakPolicy) },
    )
    onNotify(`${policy.name} ${isNew ? 'created' : 'saved'}.`, preview)
  }

  const assignPeople = (
    kind: PolicyKind,
    policy: ApiOvertimePolicy | ApiBreakPolicy,
    uuids: string[],
    preview: Preview,
  ) => {
    const chosen = new Set(uuids)
    const reassign = <T extends ApiOvertimePolicy | ApiBreakPolicy>(list: T[]) =>
      list.map(p =>
        p.uuid === policy.uuid
          ? { ...p, assigned_employees: uuids.map(uuid => ({ uuid })) }
          : { ...p, assigned_employees: p.assigned_employees.filter(a => !chosen.has(a.uuid)) },
      )
    onPoliciesChange(
      kind === 'overtime'
        ? { ...current, overtimePolicies: reassign(overtimePolicies) }
        : { ...current, breakPolicies: reassign(breakPolicies) },
    )
    onNotify(`${uuids.length} people are on ${policy.name}.`, preview)
  }

  const deletePolicy = (kind: PolicyKind, policy: ApiOvertimePolicy | ApiBreakPolicy) => {
    const blocked =
      kind === 'break' ? policy.assigned_employees.filter(a => breakToday.has(a.uuid)) : []
    const preview: Preview = {
      title: `Delete ${policy.name}`,
      requests: [
        {
          method: 'DELETE',
          path: `/v1/time_tracking/${kind === 'overtime' ? 'overtime_policies' : 'break_policies'}/${policy.uuid}?version=${policy.version}`,
        },
      ],
      gapIds: ['eligibility'],
    }
    setDeleting(null)
    if (blocked.length) {
      onNotify(
        `Couldn’t delete ${policy.name}: someone on it took a break today. (The API’s error doesn’t say who: ${blocked.map(b => nameOf(b.uuid)).join(', ')}.)`,
        preview,
        'error',
      )
      return
    }
    onPoliciesChange(
      kind === 'overtime'
        ? { ...current, overtimePolicies: overtimePolicies.filter(p => p.uuid !== policy.uuid) }
        : { ...current, breakPolicies: breakPolicies.filter(p => p.uuid !== policy.uuid) },
    )
    if (pageUuid === policy.uuid) {
      setSearchParams(prev => {
        const params = new URLSearchParams(prev)
        params.delete('policy')
        params.delete('view')
        params.delete('from')
        return params
      })
    }
    onNotify(`${policy.name} deleted.`, preview)
  }

  const menu = (kind: PolicyKind, policy: AnyPolicy) => (
    <HamburgerMenu
      triggerLabel={`Actions for ${policy.name}`}
      items={[
        {
          label: 'View details',
          onClick: () => {
            openPage(kind, policy.uuid, 'details')
          },
        },
        {
          label: 'Edit',
          onClick: () => {
            openPage(kind, policy.uuid, 'edit')
          },
        },
        {
          label: 'Assign people',
          onClick: () => {
            openPage(kind, policy.uuid, 'assign')
          },
        },
        {
          label: 'Delete',
          onClick: () => {
            setDeleting({ kind, policy })
          },
        },
      ]}
    />
  )

  const overtimeView = useDataView<ApiOvertimePolicy>({
    data: overtimePolicies,
    columns: [
      {
        title: (
          <>
            Name <ChangePin id="policy-pages" />
          </>
        ),
        render: p => (
          <Components.Link href={policyHref('overtime', p.uuid, 'details')}>
            {p.name}
          </Components.Link>
        ),
      },
      { title: 'Rules', render: overtimeRules },
      { title: 'People', justify: 'end', render: p => p.assigned_employees.length },
    ],
    itemMenu: p => menu('overtime', p),
  })

  const breakView = useDataView<ApiBreakPolicy>({
    data: breakPolicies,
    columns: [
      {
        title: (
          <>
            Name <ChangePin id="policy-pages" />
          </>
        ),
        render: p => (
          <Flex gap={8} alignItems="center">
            <Components.Link href={policyHref('break', p.uuid, 'details')}>
              {p.name}
            </Components.Link>
            {p.jurisdiction && <Components.Badge>{p.jurisdiction}</Components.Badge>}
          </Flex>
        ),
      },
      { title: 'Rules', render: breakRules },
      { title: 'People', justify: 'end', render: p => p.assigned_employees.length },
    ],
    itemMenu: p => menu('break', p),
  })

  const deleteDialog = deleting && (
    <Components.Dialog
      isOpen
      isDestructive
      title={`Delete ${deleting.policy.name}?`}
      primaryActionLabel="Delete policy"
      closeActionLabel="Cancel"
      onClose={() => {
        setDeleting(null)
      }}
      onPrimaryActionClick={() => {
        deletePolicy(deleting.kind, deleting.policy)
      }}
    >
      {deleting.policy.assigned_employees.length} people are on it.{' '}
      {deleting.kind === 'overtime'
        ? 'Eligible people need an overtime policy before their hours can be submitted, so move them first.'
        : 'It can’t be deleted if anyone on it took a break today.'}
    </Components.Dialog>
  )

  const policiesCrumb: Crumb = { label: 'Policies', onClick: openList }
  const trail: Crumb[] =
    pageKind && pagePolicy
      ? [
          policiesCrumb,
          {
            label: pagePolicy.name,
            onClick: () => {
              openPage(pageKind, pagePolicy.uuid, 'details')
            },
          },
        ]
      : [policiesCrumb]
  if (pageKind && pageView === 'edit' && (pagePolicy || pageUuid === 'new')) {
    const afterSave = (policy: AnyPolicy, preview: Preview) => {
      savePolicy(pageKind, policy, preview)
      if (pageUuid === 'new') openPage(pageKind, policy.uuid, 'details')
      else closePage()
    }
    return pageKind === 'overtime' ? (
      <OvertimeForm
        companyId={companyId}
        policy={(pagePolicy as ApiOvertimePolicy | undefined) ?? null}
        existingNames={overtimePolicies
          .filter(p => p !== pagePolicy)
          .map(p => p.name.toLowerCase())}
        workweeks={workweeks}
        trail={trail}
        onClose={closePage}
        onSave={afterSave}
      />
    ) : (
      <BreakForm
        companyId={companyId}
        policy={(pagePolicy as ApiBreakPolicy | undefined) ?? null}
        existingNames={breakPolicies.filter(p => p !== pagePolicy).map(p => p.name.toLowerCase())}
        trail={trail}
        onClose={closePage}
        onSave={afterSave}
      />
    )
  }
  if (pageKind && pageView === 'assign' && pagePolicy) {
    return (
      <AssignPeople
        kind={pageKind}
        policy={pagePolicy}
        people={people}
        breakToday={breakToday}
        trail={trail}
        onClose={closePage}
        onSave={(uuids, preview) => {
          assignPeople(pageKind, pagePolicy, uuids, preview)
          closePage()
        }}
      />
    )
  }
  if (pageKind && pageView === 'details' && pagePolicy) {
    return (
      <>
        <PolicyDetail
          kind={pageKind}
          policy={pagePolicy}
          people={people}
          trail={[policiesCrumb]}
          onEdit={() => {
            openPage(pageKind, pagePolicy.uuid, 'edit', 'details')
          }}
          onAssign={() => {
            openPage(pageKind, pagePolicy.uuid, 'assign', 'details')
          }}
          onDelete={() => {
            setDeleting({ kind: pageKind, policy: pagePolicy })
          }}
        />
        {deleteDialog}
      </>
    )
  }

  return (
    <Flex flexDirection="column" gap={24}>
      {uncovered.length > 0 && (
        <Components.Alert
          status="warning"
          label={`${uncovered.length} eligible people are missing a policy`}
        >
          {uncovered.map(p => p.name).join(', ')} <GapPin id="state-reminders" />
        </Components.Alert>
      )}

      <Components.Box
        header={
          <Components.BoxHeader
            title={
              <>
                Overtime policies <GapPin id="ot-state" />
              </>
            }
            action={
              <Components.Button
                variant="secondary"
                onClick={() => {
                  openPage('overtime', 'new', 'edit')
                }}
              >
                New overtime policy
              </Components.Button>
            }
          />
        }
      >
        <DataView label="Overtime policies" {...overtimeView} />
      </Components.Box>

      <Components.Box
        header={
          <Components.BoxHeader
            title={
              <>
                Break policies <GapPin id="state-reminders" />
              </>
            }
            action={
              <Components.Button
                variant="secondary"
                onClick={() => {
                  openPage('break', 'new', 'edit')
                }}
              >
                New break policy
              </Components.Button>
            }
          />
        }
      >
        <DataView label="Break policies" {...breakView} />
      </Components.Box>

      {deleteDialog}
    </Flex>
  )
}

function Problems({ problems }: { problems: string[] }) {
  const Components = useComponentContext()
  if (!problems.length) return null
  return (
    <Components.Alert status="error" label="The API would reject this">
      {problems.join(' ')}
    </Components.Alert>
  )
}

function OvertimeForm({
  companyId,
  policy,
  existingNames,
  workweeks,
  trail,
  onClose,
  onSave,
}: {
  companyId: string
  policy: ApiOvertimePolicy | null
  existingNames: string[]
  workweeks: Array<{ schedule: ApiPaySchedule; start: string | null }>
  trail: Crumb[]
  onClose: () => void
  onSave: (policy: ApiOvertimePolicy, preview: Preview) => void
}) {
  const Components = useComponentContext()
  const [name, setName] = useState(policy?.name ?? '')
  const [weekly, setWeekly] = useState(policy?.weekly_overtime_hours_threshold ?? 40)
  const [hasDaily, setHasDaily] = useState(
    Boolean(policy?.daily_overtime_hours_threshold ?? !policy),
  )
  const [daily, setDaily] = useState(policy?.daily_overtime_hours_threshold ?? 8)
  const [hasDouble, setHasDouble] = useState(Boolean(policy?.double_overtime_hours_threshold))
  const [double, setDouble] = useState(policy?.double_overtime_hours_threshold ?? 12)
  const [consecutive, setConsecutive] = useState(
    Boolean(policy?.work_week_consecutive_days_threshold),
  )

  const problems: string[] = []
  if (!name.trim()) problems.push('Policy name is required.')
  if (existingNames.includes(name.trim().toLowerCase()))
    problems.push('Another policy has this name.')
  if (!Number.isInteger(weekly) || weekly < 10 || weekly > 168)
    problems.push('Weekly overtime must be a whole number from 10 to 168 hours.')
  if (hasDaily && (daily < 1 || daily > 24)) problems.push('Daily overtime must be 1 to 24 hours.')
  if (hasDouble && (double < 1 || double > 24)) problems.push('Double time must be 1 to 24 hours.')
  if (hasDouble && !hasDaily) problems.push('Double time needs daily overtime.')
  if (hasDaily && hasDouble && daily >= double)
    problems.push('Daily overtime must be less than double time.')

  const body = {
    name: name.trim(),
    weekly_overtime_hours_threshold: weekly,
    daily_overtime_hours_threshold: hasDaily ? daily : null,
    double_overtime_hours_threshold: hasDouble ? double : null,
    work_week_consecutive_days_threshold: consecutive ? 7 : null,
    ...(policy ? { version: policy.version } : {}),
  }

  return (
    <SubPage
      narrow
      trail={trail}
      current={policy ? 'Edit' : 'New overtime policy'}
      title={policy ? `Edit ${policy.name}` : 'New overtime policy'}
      footer={
        <SaveFooter
          onCancel={onClose}
          isDisabled={problems.length > 0}
          onSave={() => {
            onSave(
              {
                uuid: policy?.uuid ?? simId(),
                version: 'simulated',
                assigned_employees: policy?.assigned_employees ?? [],
                ...body,
              },
              {
                title: policy ? `Edit ${policy.name}` : 'New overtime policy',
                requests: [
                  {
                    method: policy ? 'PATCH' : 'POST',
                    path: policy
                      ? `/v1/time_tracking/overtime_policies/${policy.uuid}`
                      : `/v1/companies/${companyId}/time_tracking/overtime_policies`,
                    body,
                  },
                ],
                gapIds: ['ot-state'],
              },
            )
          }}
        />
      }
    >
      <Components.TextInput label="Name" value={name} onChange={setName} />
      <Components.NumberInput
        label="Weekly overtime after (hours)"
        value={weekly}
        onChange={setWeekly}
      />
      <Grid gridTemplateColumns={{ base: '1fr', small: '1fr 1fr' }} gap={12}>
        <Components.Switch label="Daily overtime" value={hasDaily} onChange={setHasDaily} />
        <Components.NumberInput
          label="After (hours in a day)"
          value={daily}
          onChange={setDaily}
          isDisabled={!hasDaily}
        />
        <Components.Switch label="Double time" value={hasDouble} onChange={setHasDouble} />
        <Components.NumberInput
          label="After (hours in a day)"
          value={double}
          onChange={setDouble}
          isDisabled={!hasDouble}
        />
      </Grid>
      <Components.Switch
        label="Seventh consecutive day rule"
        value={consecutive}
        onChange={setConsecutive}
      />
      <Components.Text size="sm" variant="supporting">
        There’s no field for which state this is for, so it can’t be checked against state law.{' '}
        <GapPin id="ot-state" />
      </Components.Text>
      <Problems problems={problems} />
      {policy && (
        <Components.Alert status="warning" label="Changes apply to the current workweek">
          {workweeks
            .map(w => `${scheduleLabel(w.schedule)} from ${w.start ? formatDay(w.start) : '?'}`)
            .join('; ')}
          . A payroll that already covers part of that week may need a correction.{' '}
        </Components.Alert>
      )}
    </SubPage>
  )
}

interface RuleDraft {
  key: string
  uuid?: string
  break_type: 'meal' | 'rest'
  duration: number
  everyHours: number
  is_paid: boolean
}

const JURISDICTIONS = ['CA', 'CO', 'IL', 'KY', 'MN', 'NV', 'NY', 'OR', 'WA']

function BreakForm({
  companyId,
  policy,
  existingNames,
  trail,
  onClose,
  onSave,
}: {
  companyId: string
  policy: ApiBreakPolicy | null
  existingNames: string[]
  trail: Crumb[]
  onClose: () => void
  onSave: (policy: ApiBreakPolicy, preview: Preview) => void
}) {
  const Components = useComponentContext()
  const [name, setName] = useState(policy?.name ?? '')
  const [jurisdiction, setJurisdiction] = useState(policy?.jurisdiction ?? '')
  const [payPremium, setPayPremium] = useState(policy?.pay_premium ?? false)
  const [rules, setRules] = useState<RuleDraft[]>(
    policy?.rules.map(rule => ({
      key: rule.uuid,
      uuid: rule.uuid,
      break_type: rule.break_type,
      duration: rule.break_duration_in_minutes,
      everyHours: rule.for_hours_worked_in_minutes / 60,
      is_paid: rule.is_paid,
    })) ?? [{ key: 'new-meal', break_type: 'meal', duration: 30, everyHours: 5, is_paid: false }],
  )
  const update = (key: string, patch: Partial<RuleDraft>) => {
    setRules(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)))
  }

  const problems: string[] = []
  if (!name.trim()) problems.push('Policy name is required.')
  if (existingNames.includes(name.trim().toLowerCase()))
    problems.push('Break policy names must be unique.')
  if (rules.length === 0) problems.push('Add a meal or rest break.')
  if (rules.some(r => !Number.isInteger(r.duration) || r.duration < 1))
    problems.push('Break length must be a whole number of minutes.')
  if (rules.some(r => !(r.everyHours > 0))) problems.push('Enter how often each break is provided.')

  const body = {
    name: name.trim(),
    pay_premium: payPremium,
    ...(policy ? { version: policy.version } : jurisdiction ? { jurisdiction } : {}),
    rules: rules.map(rule => ({
      ...(rule.uuid ? { uuid: rule.uuid } : {}),
      break_type: rule.break_type,
      is_paid: rule.is_paid,
      break_duration_in_minutes: rule.duration,
      for_hours_worked_in_minutes: Math.round(rule.everyHours * 60),
    })),
  }

  return (
    <SubPage
      narrow
      trail={trail}
      current={policy ? 'Edit' : 'New break policy'}
      title={policy ? `Edit ${policy.name}` : 'New break policy'}
      footer={
        <SaveFooter
          onCancel={onClose}
          isDisabled={problems.length > 0}
          onSave={() => {
            onSave(
              {
                uuid: policy?.uuid ?? simId(),
                version: 'simulated',
                name: body.name,
                jurisdiction: policy?.jurisdiction ?? (jurisdiction || null),
                pay_premium: payPremium,
                assigned_employees: policy?.assigned_employees ?? [],
                rules: body.rules.map(rule => ({
                  ...rule,
                  uuid: rule.uuid ?? simId(),
                  minimum_time_required_in_minutes:
                    policy?.rules.find(r => r.uuid === rule.uuid)
                      ?.minimum_time_required_in_minutes ?? null,
                })),
              },
              {
                title: policy ? `Edit ${policy.name}` : 'New break policy',
                requests: [
                  {
                    method: policy ? 'PUT' : 'POST',
                    path: policy
                      ? `/v1/time_tracking/break_policies/${policy.uuid}`
                      : `/v1/companies/${companyId}/time_tracking/break_policies`,
                    body,
                  },
                ],
                gapIds: [],
              },
            )
          }}
        />
      }
    >
      <Components.TextInput label="Name" value={name} onChange={setName} />
      <Components.Select
        label="State"
        placeholder="No state"
        value={jurisdiction || null}
        isDisabled={Boolean(policy)}
        description={policy ? 'Can’t change after the policy is created.' : undefined}
        options={JURISDICTIONS.map(j => ({ value: j, label: j }))}
        onChange={setJurisdiction}
      />
      <Components.Switch
        label="Pay a premium when a break is missed"
        value={payPremium}
        onChange={setPayPremium}
      />
      {rules.map(rule => (
        <Grid key={rule.key} gridTemplateColumns={{ base: '1fr', small: '1fr 1fr 1fr' }} gap={12}>
          <Components.Select
            label="Break"
            placeholder="Type"
            value={rule.break_type}
            options={[
              { value: 'meal', label: 'Meal' },
              { value: 'rest', label: 'Rest' },
            ]}
            onChange={value => {
              update(rule.key, { break_type: value as 'meal' | 'rest' })
            }}
          />
          <Components.NumberInput
            label="Minutes"
            value={rule.duration}
            onChange={value => {
              update(rule.key, { duration: value })
            }}
          />
          <Components.NumberInput
            label="Every (hours worked)"
            value={rule.everyHours}
            onChange={value => {
              update(rule.key, { everyHours: value })
            }}
          />
          <Components.Checkbox
            label="Paid"
            value={rule.is_paid}
            onChange={value => {
              update(rule.key, { is_paid: value })
            }}
          />
          <Components.Button
            variant="tertiary"
            onClick={() => {
              setRules(prev => prev.filter(r => r.key !== rule.key))
            }}
          >
            Remove
          </Components.Button>
        </Grid>
      ))}
      <Flex gap={8}>
        {(['meal', 'rest'] as const).map(type => (
          <Components.Button
            key={type}
            variant="secondary"
            onClick={() => {
              setRules(prev => [
                ...prev,
                {
                  key: `new-${type}-${prev.length}`,
                  break_type: type,
                  duration: type === 'meal' ? 30 : 10,
                  everyHours: type === 'meal' ? 5 : 4,
                  is_paid: type === 'rest',
                },
              ])
            }}
          >
            Add {type} break
          </Components.Button>
        ))}
      </Flex>
      <Components.Text size="sm" variant="supporting">
        The API also returns a minimum shift length for each rule, which isn’t set here.{' '}
        {policy && ' Saving replaces the whole policy.'}
      </Components.Text>
      <Problems problems={problems} />
    </SubPage>
  )
}

interface AssignRow {
  person: Person
  eligible: boolean
  label: string
  note: string
  locked: boolean
}

function AssignPeople({
  kind,
  policy,
  people,
  breakToday,
  trail,
  onClose,
  onSave,
}: {
  kind: PolicyKind
  policy: AnyPolicy
  people: Person[]
  breakToday: Set<string>
  trail: Crumb[]
  onClose: () => void
  onSave: (uuids: string[], preview: Preview) => void
}) {
  const Components = useComponentContext()
  const initial = useMemo(() => new Set(policy.assigned_employees.map(a => a.uuid)), [policy])
  const [selected, setSelected] = useState<Set<string>>(initial)

  const rows: AssignRow[] = [...people]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(person => {
      const elig = eligibility(person.employee)
      const uuid = person.employee.uuid
      const locked = kind === 'overtime' && initial.has(uuid)
      const current = kind === 'overtime' ? person.overtimePolicy?.name : person.breakPolicy?.name
      let note = current && current !== policy.name ? `On ${current}` : ''
      if (!elig.eligible) note = `Not eligible: ${elig.reason ?? ''}`
      else if (locked) note = 'Move them to another overtime policy to take them off'
      else if (kind === 'break' && breakToday.has(uuid))
        note = 'Took a break today: can’t change until tomorrow'
      return { person, eligible: elig.eligible, label: elig.label, note, locked }
    })

  const dataView = useDataView<AssignRow>({
    data: rows,
    selectionMode: 'multiple',
    hideSelectAll: true,
    getIsItemSelected: row => selected.has(row.person.employee.uuid),
    onSelect: (row, checked) => {
      if (!row.eligible || row.locked) return
      setSelected(prev => {
        const next = new Set(prev)
        if (checked) next.add(row.person.employee.uuid)
        else next.delete(row.person.employee.uuid)
        return next
      })
    },
    columns: [
      { title: 'Person', render: row => row.person.name },
      { title: 'Pay type', render: row => row.label },
      { title: 'Note', render: row => row.note },
    ],
  })

  const toAssign = [...selected].filter(uuid => !initial.has(uuid))
  const toRemove = [...initial].filter(uuid => !selected.has(uuid))
  const resource = kind === 'overtime' ? 'overtime_policies' : 'break_policies'
  const requests: PreviewRequest[] = []
  if (toAssign.length)
    requests.push({
      method: 'PUT',
      path: `/v1/time_tracking/${resource}/${policy.uuid}/assign_employees`,
      body: { version: policy.version, employees: toAssign.map(uuid => ({ uuid })) },
    })
  if (toRemove.length && kind === 'break')
    requests.push({
      method: 'PUT',
      path: `/v1/time_tracking/break_policies/${policy.uuid}/remove_employees`,
      body: {
        version: toAssign.length ? '<version returned by the assign request>' : policy.version,
        employees: toRemove.map(uuid => ({ uuid })),
      },
    })
  const blocked = kind === 'break' && [...toAssign, ...toRemove].some(uuid => breakToday.has(uuid))

  return (
    <SubPage
      trail={trail}
      current="Assign people"
      title={
        <>
          Assign people to {policy.name} <ChangePin id="policy-pages" />
        </>
      }
      description={`Each person can be on one ${kind} policy, so picking someone moves them here. Ineligible people can’t be picked.`}
      actions={
        <Components.Button
          variant="secondary"
          onClick={() => {
            setSelected(
              new Set([
                ...initial,
                ...rows.filter(r => r.eligible && !r.locked).map(r => r.person.employee.uuid),
              ]),
            )
          }}
        >
          Select all eligible
        </Components.Button>
      }
      footer={
        <SaveFooter
          onCancel={onClose}
          isDisabled={blocked || requests.length === 0}
          onSave={() => {
            onSave([...selected], {
              title: `Assign people to ${policy.name}`,
              requests,
              gapIds: ['eligibility'],
            })
          }}
        />
      }
    >
      <Components.Text size="sm" variant="supporting">
        {selected.size} selected · {toAssign.length} to add
        {kind === 'break' && ` · ${toRemove.length} to remove`} <GapPin id="eligibility" />
      </Components.Text>
      <DataView label="People" {...dataView} />
      {blocked && (
        <Components.Alert status="warning" label="This would fail">
          Someone you changed took a break today, so the API would reject this, without saying who.
        </Components.Alert>
      )}
    </SubPage>
  )
}

function PolicyDetail({
  kind,
  policy,
  people,
  trail,
  onEdit,
  onAssign,
  onDelete,
}: {
  kind: PolicyKind
  policy: AnyPolicy
  people: Person[]
  trail: Crumb[]
  onEdit: () => void
  onAssign: () => void
  onDelete: () => void
}) {
  const Components = useComponentContext()
  const [section, setSection] = useState('details')
  const assigned = new Set(policy.assigned_employees.map(a => a.uuid))
  const onPolicy = people
    .filter(p => assigned.has(p.employee.uuid))
    .sort((a, b) => a.name.localeCompare(b.name))
  const peopleView = useDataView<Person>({
    data: onPolicy,
    columns: [
      { title: 'Person', render: p => p.name },
      { title: 'Job', render: p => p.title },
      { title: 'Pay type', render: p => eligibility(p.employee).label },
    ],
  })

  const facts: Array<[string, string]> =
    kind === 'overtime'
      ? (() => {
          const p = policy as ApiOvertimePolicy
          return [
            ['Weekly overtime', `After ${p.weekly_overtime_hours_threshold ?? '—'} hours`],
            [
              'Daily overtime',
              p.daily_overtime_hours_threshold
                ? `After ${p.daily_overtime_hours_threshold} hours in a day`
                : 'None',
            ],
            [
              'Double time',
              p.double_overtime_hours_threshold
                ? `After ${p.double_overtime_hours_threshold} hours in a day`
                : 'None',
            ],
            [
              'Seventh consecutive day',
              p.work_week_consecutive_days_threshold ? 'Applies' : 'Doesn’t apply',
            ],
          ]
        })()
      : (() => {
          const p = policy as ApiBreakPolicy
          return [
            ['State', p.jurisdiction ?? 'None'],
            ['Missed break premium', p.pay_premium ? 'Paid' : 'Not paid'],
            ...p.rules.map((r): [string, string] => [
              r.break_type === 'meal' ? 'Meal break' : 'Rest break',
              `${breakRuleLabel(r)} per ${hoursLabel(r.for_hours_worked_in_minutes)}`,
            ]),
          ]
        })()

  return (
    <SubPage
      trail={trail}
      current={policy.name}
      title={
        <>
          {policy.name} <ChangePin id="policy-pages" />
        </>
      }
      description={KIND_LABEL[kind]}
      actions={
        <>
          <Components.Button variant="secondary" onClick={onAssign}>
            Assign people
          </Components.Button>
          <Components.Button variant="secondary" onClick={onEdit}>
            Edit policy
          </Components.Button>
          <Components.Button variant="tertiary" onClick={onDelete}>
            Delete
          </Components.Button>
        </>
      }
    >
      <Components.Tabs
        aria-label={`${policy.name} sections`}
        selectedId={section}
        onSelectionChange={setSection}
        tabs={[
          {
            id: 'details',
            label: 'Policy details',
            content: (
              <Components.Box header={<Components.BoxHeader title="Details" />}>
                <Flex flexDirection="column" gap={12}>
                  {facts.map(([label, value]) => (
                    <Flex key={label} flexDirection="column" gap={0}>
                      <Components.Text weight="medium">{label}</Components.Text>
                      <Components.Text variant="supporting">{value}</Components.Text>
                    </Flex>
                  ))}
                  {kind === 'overtime' && (
                    <Components.Text size="sm" variant="supporting">
                      No state is recorded for overtime policies. <GapPin id="ot-state" />
                    </Components.Text>
                  )}
                </Flex>
              </Components.Box>
            ),
          },
          {
            id: 'people',
            label: `People (${onPolicy.length})`,
            content: onPolicy.length ? (
              <DataView label={`People on ${policy.name}`} {...peopleView} />
            ) : (
              <Components.Text variant="supporting">No one is on this policy yet.</Components.Text>
            ),
          },
        ]}
      />
    </SubPage>
  )
}

function SaveFooter({
  onCancel,
  onSave,
  isDisabled,
}: {
  onCancel: () => void
  onSave: () => void
  isDisabled: boolean
}) {
  const Components = useComponentContext()
  return (
    <Flex justifyContent="flex-end" gap={12}>
      <Components.Button variant="secondary" onClick={onCancel}>
        Cancel
      </Components.Button>
      <Components.Button isDisabled={isDisabled} onClick={onSave}>
        Save
      </Components.Button>
    </Flex>
  )
}
