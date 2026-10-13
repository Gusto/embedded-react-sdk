import { useMemo, useState } from 'react'
import type { AssignableEmployee, PolicyKind } from './types'
import { formatEmployeeCount } from './formatters'
import { ActionsLayout, DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface AssignmentChanges {
  assign: string[]
  remove: string[]
}

export interface PolicyEmployeeAssignmentProps {
  kind: PolicyKind
  policyId: string
  policyName: string
  employees: AssignableEmployee[]
  serverErrors?: string[]
  isSubmitting?: boolean
  onSave: (changes: AssignmentChanges) => void
  onCancel: () => void
}

const KIND_LABEL: Record<PolicyKind, string> = {
  overtime: 'overtime policy',
  break: 'break policy',
}

export function PolicyEmployeeAssignment({
  kind,
  policyId,
  policyName,
  employees,
  serverErrors,
  isSubmitting,
  onSave,
  onCancel,
}: PolicyEmployeeAssignmentProps) {
  const Components = useComponentContext()
  // The overtime API has no remove endpoint — employees leave a policy by joining another.
  const canRemove = kind === 'break'

  const eligible = useMemo(() => employees.filter(e => e.ineligibleReason === null), [employees])
  const ineligible = useMemo(() => employees.filter(e => e.ineligibleReason !== null), [employees])
  const initiallyAssigned = useMemo(
    () => new Set(eligible.filter(e => e.currentPolicyId === policyId).map(e => e.uuid)),
    [eligible, policyId],
  )
  const [selected, setSelected] = useState<Set<string>>(initiallyAssigned)

  const isLockedIn = (employee: AssignableEmployee) =>
    !canRemove && initiallyAssigned.has(employee.uuid)

  const assign = [...selected].filter(uuid => !initiallyAssigned.has(uuid))
  const remove = [...initiallyAssigned].filter(uuid => !selected.has(uuid))
  const moving = eligible.filter(
    e => assign.includes(e.uuid) && e.currentPolicyId !== null && e.currentPolicyId !== policyId,
  )
  const hasChanges = assign.length > 0 || remove.length > 0

  const eligibleView = useDataView<AssignableEmployee>({
    data: eligible,
    columns: [
      {
        title: 'Employee',
        render: employee => (
          <Flex flexDirection="column" gap={2}>
            <Components.Text weight="medium">{employee.name}</Components.Text>
            {employee.jobTitle ? (
              <Components.Text size="sm" variant="supporting">
                {employee.jobTitle}
              </Components.Text>
            ) : null}
          </Flex>
        ),
      },
      { title: 'Pay type', render: employee => employee.compensationLabel },
      {
        title: `Current ${KIND_LABEL[kind]}`,
        render: employee => {
          if (employee.currentPolicyId === policyId) {
            return <Components.Badge status="success">This policy</Components.Badge>
          }
          return employee.currentPolicyName ?? 'None'
        },
      },
    ],
    onSelect: (employee, checked) => {
      if (!checked && isLockedIn(employee)) return
      setSelected(prev => {
        const next = new Set(prev)
        if (checked) next.add(employee.uuid)
        else next.delete(employee.uuid)
        return next
      })
    },
    onSelectAll: (checked, visible) => {
      setSelected(
        checked
          ? new Set(visible.map(e => e.uuid))
          : new Set(canRemove ? [] : [...initiallyAssigned]),
      )
    },
    getIsItemSelected: employee => selected.has(employee.uuid),
    emptyState: () => (
      <EmptyData
        title="No eligible employees"
        description="Only hourly and salaried non-exempt employees can be assigned."
      />
    ),
  })

  const ineligibleView = useDataView<AssignableEmployee>({
    data: ineligible,
    columns: [
      { title: 'Employee', render: employee => employee.name },
      { title: 'Pay type', render: employee => employee.compensationLabel },
      { title: 'Why they can’t be assigned', render: employee => employee.ineligibleReason },
    ],
  })

  return (
    <Flex flexDirection="column" gap={24} alignItems="stretch">
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h2">{`Manage employees on ${policyName}`}</Components.Heading>
        <Components.Text variant="supporting">
          {`Select who this ${KIND_LABEL[kind]} applies to. Each employee can have one ${KIND_LABEL[kind]}, and changes take effect today.`}
        </Components.Text>
      </Flex>

      {!canRemove && initiallyAssigned.size > 0 ? (
        <Components.Alert status="info" label="Moving someone off this policy">
          <Components.Text>
            Employees always need an overtime policy. To take someone off this one, assign them to a
            different overtime policy.
          </Components.Text>
        </Components.Alert>
      ) : null}

      {kind === 'break' ? (
        <Components.Alert status="info" label="Breaks already taken today">
          <Components.Text>
            If an employee has already recorded a break today, their break policy can’t change until
            tomorrow.
          </Components.Text>
        </Components.Alert>
      ) : null}

      {serverErrors && serverErrors.length > 0 ? (
        <Components.Alert status="error" label="Assignments couldn’t be saved">
          <Flex flexDirection="column" gap={4}>
            {serverErrors.map(message => (
              <Components.Text key={message}>{message}</Components.Text>
            ))}
          </Flex>
        </Components.Alert>
      ) : null}

      <Components.Box
        withPadding={false}
        header={
          <Flex flexDirection="column" gap={2}>
            <Components.Heading as="h3">Eligible employees</Components.Heading>
            <Components.Text variant="supporting">
              {`${formatEmployeeCount(selected.size)} selected`}
            </Components.Text>
          </Flex>
        }
      >
        <DataView label="Eligible employees" isWithinBox {...eligibleView} />
      </Components.Box>

      {ineligible.length > 0 ? (
        <Components.Box
          withPadding={false}
          header={
            <Flex flexDirection="column" gap={2}>
              <Components.Heading as="h3">Not eligible</Components.Heading>
              <Components.Text variant="supporting">
                {`Only hourly and salaried non-exempt employees can be assigned to a ${KIND_LABEL[kind]}.`}
              </Components.Text>
            </Flex>
          }
        >
          <DataView label="Ineligible employees" isWithinBox {...ineligibleView} />
        </Components.Box>
      ) : null}

      {hasChanges ? (
        <Components.Alert status="info" label="Review changes" disableScrollIntoView>
          <Flex flexDirection="column" gap={4}>
            {assign.length > 0 ? (
              <Components.Text>{`Adding ${formatEmployeeCount(assign.length)}`}</Components.Text>
            ) : null}
            {remove.length > 0 ? (
              <Components.Text>{`Removing ${formatEmployeeCount(remove.length)}`}</Components.Text>
            ) : null}
            {moving.map(employee => (
              <Components.Text key={employee.uuid} size="sm">
                {`${employee.name} will move from ${employee.currentPolicyName ?? 'their current policy'}`}
              </Components.Text>
            ))}
          </Flex>
        </Components.Alert>
      ) : null}

      <ActionsLayout>
        <Components.Button variant="secondary" onClick={onCancel} isDisabled={isSubmitting}>
          Cancel
        </Components.Button>
        <Components.Button
          isLoading={isSubmitting}
          isDisabled={!hasChanges}
          onClick={() => {
            onSave({ assign, remove })
          }}
        >
          Save assignments
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
