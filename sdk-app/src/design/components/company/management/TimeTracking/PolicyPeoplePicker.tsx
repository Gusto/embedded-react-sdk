import type { PolicyKind, TimeTrackingPerson } from './types'
import { MultiSelectComboBoxField } from '@/components/Common'

const HELPER_TEXT: Record<PolicyKind, string> = {
  overtime: 'Only US-based, overtime-eligible, W-2 employees can be assigned.',
  break:
    'US-based, overtime eligible, W-2 employees can be assigned to one break policy at a time.',
}

const GROUP_ORDER = { none: 0, this: 1, other: 2 } as const

export interface PolicyPeoplePickerProps {
  name: string
  kind: PolicyKind
  policyId: string | null
  people: TimeTrackingPerson[]
  policyNames: Record<string, string>
}

/**
 * Gusto's people picker groups people by their current assignment. MultiSelectComboBox has no
 * option groups, so the group is carried in each option's description and drives the sort order.
 */
export function PolicyPeoplePicker({
  name,
  kind,
  policyId,
  people,
  policyNames,
}: PolicyPeoplePickerProps) {
  const options = people
    .filter(person => person.ineligibleReason === null)
    .map(person => {
      const currentPolicyId = kind === 'overtime' ? person.overtimePolicyId : person.breakPolicyId
      const group: keyof typeof GROUP_ORDER =
        currentPolicyId === null ? 'none' : currentPolicyId === policyId ? 'this' : 'other'
      const description =
        group === 'none'
          ? 'No policy assigned'
          : group === 'this'
            ? 'Currently assigned to this policy'
            : `“${policyNames[currentPolicyId!] ?? 'Another'}” policy`
      return { value: person.uuid, label: person.name, description, group }
    })
    .sort((a, b) => GROUP_ORDER[a.group] - GROUP_ORDER[b.group] || a.label.localeCompare(b.label))

  return (
    <MultiSelectComboBoxField
      name={name}
      label="Team members"
      placeholder="Search team members"
      description={HELPER_TEXT[kind]}
      options={options.map(({ value, label, description }) => ({ value, label, description }))}
    />
  )
}
