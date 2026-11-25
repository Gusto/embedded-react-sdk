import { useState } from 'react'
import { eligibility, type ApiBreakPolicy, type ApiOvertimePolicy, type Person } from './model'
import { ChangePin, GapPin } from './parts'
import type { Preview, PreviewRequest } from './preview'
import styles from './TimeTrackingReview.module.scss'
import { EmployeeTable } from '@/components/TimeOff/shared/EmployeeTable/EmployeeTable'
import type { EmployeeTableItem } from '@/components/TimeOff/shared/EmployeeTable/EmployeeTableTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const NO_BREAK_POLICY = 'none'

/** One person's target policies. `breakPolicy: null` takes them off every break policy. */
export interface PolicyMove {
  uuid: string
  overtimePolicy?: string
  breakPolicy?: string | null
}

interface Draft {
  overtimePolicy?: string
  breakPolicy?: string | null
}

interface PersonRow extends EmployeeTableItem {
  person: Person
}

function toRow(person: Person): PersonRow {
  return {
    uuid: person.employee.uuid,
    firstName: person.employee.first_name,
    lastName: person.employee.last_name,
    jobTitle: person.title,
    person,
  }
}

export function PeoplePolicies({
  people,
  overtimePolicies,
  breakPolicies,
  breakToday,
  onSave,
}: {
  people: Person[]
  overtimePolicies: ApiOvertimePolicy[]
  breakPolicies: ApiBreakPolicy[]
  breakToday: Set<string>
  onSave: (moves: PolicyMove[], preview: Preview) => void
}) {
  const Components = useComponentContext()
  const [search, setSearch] = useState('')
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})

  const eligiblePeople = people
    .filter(person => eligibility(person.employee).eligible)
    .sort((a, b) => a.name.localeCompare(b.name))
  const rows = eligiblePeople
    .filter(person => person.name.toLowerCase().includes(search.trim().toLowerCase()))
    .map(toRow)

  const currentOvertime = (person: Person) => person.overtimePolicy?.uuid ?? ''
  const currentBreak = (person: Person) => person.breakPolicy?.uuid ?? NO_BREAK_POLICY
  const overtimeValue = (person: Person) =>
    drafts[person.employee.uuid]?.overtimePolicy ?? currentOvertime(person)
  const breakValue = (person: Person) => {
    const draft = drafts[person.employee.uuid]?.breakPolicy
    if (draft === undefined) return currentBreak(person)
    return draft ?? NO_BREAK_POLICY
  }

  const setDraft = (person: Person, change: Draft) => {
    setDrafts(prev => {
      const uuid = person.employee.uuid
      const next: Draft = { ...prev[uuid], ...change }
      if (next.overtimePolicy === currentOvertime(person)) delete next.overtimePolicy
      if (
        next.breakPolicy !== undefined &&
        (next.breakPolicy ?? NO_BREAK_POLICY) === currentBreak(person)
      )
        delete next.breakPolicy
      const rest = Object.fromEntries(Object.entries(prev).filter(([key]) => key !== uuid))
      return Object.keys(next).length ? { ...rest, [uuid]: next } : rest
    })
  }

  const breakFromValue = (value: string) => (value === NO_BREAK_POLICY ? null : value)

  const overtimeOptions = overtimePolicies.map(policy => ({
    value: policy.uuid,
    label: policy.name,
  }))
  const breakOptions = [
    ...breakPolicies.map(policy => ({ value: policy.uuid, label: policy.name })),
    { value: NO_BREAK_POLICY, label: 'No break policy' },
  ]

  const changedCount = Object.keys(drafts).length
  const moves: PolicyMove[] = Object.entries(drafts).map(([uuid, draft]) => ({
    uuid,
    ...(draft.overtimePolicy !== undefined && { overtimePolicy: draft.overtimePolicy }),
    ...(draft.breakPolicy !== undefined && { breakPolicy: draft.breakPolicy }),
  }))

  const requests: PreviewRequest[] = []
  for (const policy of overtimePolicies) {
    const joining = moves.filter(move => move.overtimePolicy === policy.uuid)
    if (joining.length)
      requests.push({
        method: 'PUT',
        path: `/v1/time_tracking/overtime_policies/${policy.uuid}/assign_employees`,
        body: { version: policy.version, employees: joining.map(move => ({ uuid: move.uuid })) },
      })
  }
  for (const policy of breakPolicies) {
    const joining = moves.filter(move => move.breakPolicy === policy.uuid)
    if (joining.length)
      requests.push({
        method: 'PUT',
        path: `/v1/time_tracking/break_policies/${policy.uuid}/assign_employees`,
        body: { version: policy.version, employees: joining.map(move => ({ uuid: move.uuid })) },
      })
    const leaving = moves.filter(
      move =>
        move.breakPolicy === null &&
        policy.assigned_employees.some(assigned => assigned.uuid === move.uuid),
    )
    if (leaving.length)
      requests.push({
        method: 'PUT',
        path: `/v1/time_tracking/break_policies/${policy.uuid}/remove_employees`,
        body: { version: policy.version, employees: leaving.map(move => ({ uuid: move.uuid })) },
      })
  }

  const save = () => {
    onSave(moves, {
      title: 'Change people’s policies',
      requests,
      gapIds: ['eligibility'],
    })
    setDrafts({})
  }

  return (
    <div className={styles.peoplePolicies}>
      <div className={styles.assignBar}>
        <Components.Text size="sm" variant="supporting">
          {eligiblePeople.length} people can be on a policy.{' '}
          {changedCount > 0
            ? `${changedCount} ${changedCount === 1 ? 'person' : 'people'} changed. Changes apply when you save.`
            : 'Change a policy on a row.'}{' '}
          <GapPin id="eligibility" /> <ChangePin id="eligible-only" />
        </Components.Text>
        <div className={styles.assignControls}>
          <Components.Button
            variant="secondary"
            isDisabled={changedCount === 0}
            onClick={() => {
              setDrafts({})
            }}
          >
            Discard changes
          </Components.Button>
          <Components.Button isDisabled={changedCount === 0} onClick={save}>
            Save
          </Components.Button>
        </div>
      </div>

      <EmployeeTable<PersonRow>
        label="People and their policies"
        data={rows}
        searchValue={search}
        onSearchChange={setSearch}
        onSearchClear={() => {
          setSearch('')
        }}
        searchPlaceholder="Search people"
        additionalColumns={[
          {
            title: (
              <>
                Overtime policy <ChangePin id="people-policies" />
              </>
            ),
            render: row => (
              <div className={styles.policySelect}>
                <Components.Select
                  label={`${row.person.name}’s overtime policy`}
                  shouldVisuallyHideLabel
                  placeholder="Choose a policy"
                  isInvalid={overtimeValue(row.person) === ''}
                  value={overtimeValue(row.person)}
                  options={overtimeOptions}
                  onChange={value => {
                    setDraft(row.person, { overtimePolicy: value })
                  }}
                />
              </div>
            ),
          },
          {
            title: 'Break policy',
            render: row => (
              <div className={styles.policySelect}>
                <Components.Select
                  label={`${row.person.name}’s break policy`}
                  shouldVisuallyHideLabel
                  placeholder="Choose a policy"
                  isDisabled={breakToday.has(row.uuid)}
                  value={breakValue(row.person)}
                  options={breakOptions}
                  onChange={value => {
                    setDraft(row.person, { breakPolicy: breakFromValue(value) })
                  }}
                />
              </div>
            ),
          },
          {
            title: 'Note',
            render: row => {
              if (drafts[row.uuid])
                return <Components.Badge status="info">Changes not saved</Components.Badge>
              if (!row.person.overtimePolicy)
                return <Components.Badge status="error">No overtime policy</Components.Badge>
              if (breakToday.has(row.uuid))
                return 'Took a break today: break policy is fixed until tomorrow'
              return ''
            },
          },
        ]}
      />
      <Components.Text size="sm" variant="supporting">
        Overtime has no “none”: the API can move someone to another overtime policy but not take
        them off. People who are exempt, owners or commission-only aren’t listed.
      </Components.Text>
    </div>
  )
}
