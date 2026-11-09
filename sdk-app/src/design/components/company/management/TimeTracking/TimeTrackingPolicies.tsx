import type { ReactNode } from 'react'
import type { BreakPolicy, OvertimePolicy } from './types'
import {
  formatEmployeeCount,
  summarizeBreakRule,
  summarizeConsecutiveDays,
  summarizeDailyOvertime,
  summarizeDoubleOvertime,
  summarizeWeeklyOvertime,
} from './formatters'
import { useStateName } from './useStateName'
import cellStyles from './TableCell.module.scss'
import {
  ActionsLayout,
  DataView,
  EmptyData,
  Flex,
  HamburgerMenu,
  useDataView,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface TimeTrackingPoliciesProps {
  overtimePolicies: OvertimePolicy[]
  breakPolicies: BreakPolicy[]
  overtimePoliciesError?: string | null
  breakPoliciesError?: string | null
  onAddOvertimePolicy: () => void
  onEditOvertimePolicy: (policyId: string) => void
  onAddBreakPolicy: () => void
  onEditBreakPolicy: (policyId: string) => void
}

export function TimeTrackingPolicies({
  overtimePolicies,
  breakPolicies,
  overtimePoliciesError,
  breakPoliciesError,
  onAddOvertimePolicy,
  onEditOvertimePolicy,
  onAddBreakPolicy,
  onEditBreakPolicy,
}: TimeTrackingPoliciesProps) {
  const Components = useComponentContext()
  const stateName = useStateName()

  const breakView = useDataView<BreakPolicy>({
    data: breakPolicies,
    columns: [
      { key: 'name', title: 'Policy', render: policy => policy.name },
      {
        key: 'state',
        title: 'State',
        render: policy => (policy.jurisdiction ? stateName(policy.jurisdiction) : '—'),
      },
      {
        key: 'rules',
        title: 'Provided breaks',
        render: policy => (
          <div className={cellStyles.stack}>
            {policy.rules.map((rule, index) => (
              <Components.Text key={`${rule.breakType}-${index}`} size="sm">
                {summarizeBreakRule(rule)}
              </Components.Text>
            ))}
          </div>
        ),
      },
      {
        key: 'premium',
        title: 'Break premiums',
        render: policy => (policy.payPremium ? 'Added to timesheets' : 'Not added'),
      },
      {
        key: 'assigned',
        title: 'Assigned',
        render: policy => formatEmployeeCount(policy.employeeUuids.length),
      },
    ],
    itemMenu: policy => (
      <HamburgerMenu
        triggerLabel={`Actions for ${policy.name}`}
        items={[
          {
            label: 'Edit policy',
            onClick: () => {
              onEditBreakPolicy(policy.id)
            },
          },
        ]}
      />
    ),
    emptyState: () => (
      <EmptyData
        title="No break policies yet"
        description="Break laws vary by state. Add a policy for each state your employees work in."
      >
        <ActionsLayout justifyContent="center">
          <Components.Button variant="secondary" onClick={onAddBreakPolicy}>
            Add a break policy
          </Components.Button>
        </ActionsLayout>
      </EmptyData>
    ),
  })

  const overtimeView = useDataView<OvertimePolicy>({
    data: overtimePolicies,
    columns: [
      { key: 'name', title: 'Policy', render: policy => policy.name },
      { key: 'weekly', title: 'Weekly overtime', render: summarizeWeeklyOvertime },
      { key: 'daily', title: 'Daily overtime', render: summarizeDailyOvertime },
      { key: 'double', title: 'Daily double overtime', render: summarizeDoubleOvertime },
      { key: 'consecutive', title: 'Consecutive day', render: summarizeConsecutiveDays },
      {
        key: 'assigned',
        title: 'Assigned',
        render: policy => formatEmployeeCount(policy.employeeUuids.length),
      },
    ],
    itemMenu: policy => (
      <HamburgerMenu
        triggerLabel={`Actions for ${policy.name}`}
        items={[
          {
            label: 'Edit policy',
            onClick: () => {
              onEditOvertimePolicy(policy.id)
            },
          },
        ]}
      />
    ),
    emptyState: () => (
      <EmptyData
        title="No overtime policies yet"
        description="Overtime-eligible employees must be assigned an overtime policy before their hours can be submitted."
      >
        <ActionsLayout justifyContent="center">
          <Components.Button onClick={onAddOvertimePolicy}>
            Add an overtime policy
          </Components.Button>
        </ActionsLayout>
      </EmptyData>
    ),
  })

  return (
    <Flex flexDirection="column" gap={32} alignItems="stretch">
      <PolicySection
        hasError={Boolean(breakPoliciesError)}
        title="Break policies"
        description="If someone misses or shortens a required break, the break will be flagged on their timesheet for review. These policies don’t apply to contractors or overtime-exempt W-2 employees."
        action={
          breakPolicies.length > 0 ? (
            <Components.Button variant="secondary" onClick={onAddBreakPolicy}>
              Add a break policy
            </Components.Button>
          ) : null
        }
      >
        {breakPoliciesError ? (
          <PoliciesUnavailable message={breakPoliciesError} />
        ) : (
          <DataView label="Break policies" isWithinBox {...breakView} />
        )}
      </PolicySection>

      <PolicySection
        hasError={Boolean(overtimePoliciesError)}
        title="Overtime policies"
        description="Set when hours count as overtime (1.5x) or double overtime (2x)."
        action={
          overtimePolicies.length > 0 ? (
            <Components.Button variant="secondary" onClick={onAddOvertimePolicy}>
              Add an overtime policy
            </Components.Button>
          ) : null
        }
      >
        {overtimePoliciesError ? (
          <PoliciesUnavailable message={overtimePoliciesError} />
        ) : (
          <DataView label="Overtime policies" isWithinBox {...overtimeView} />
        )}
      </PolicySection>
    </Flex>
  )
}

function PolicySection({
  title,
  description,
  action,
  hasError,
  children,
}: {
  title: string
  description: string
  action: ReactNode
  hasError: boolean
  children: ReactNode
}) {
  const Components = useComponentContext()
  return (
    <Components.Box
      withPadding={hasError}
      header={<Components.BoxHeader title={title} description={description} action={action} />}
    >
      {children}
    </Components.Box>
  )
}

function PoliciesUnavailable({ message }: { message: string }) {
  const Components = useComponentContext()
  return (
    <Components.Alert status="warning" label="Policies couldn’t be loaded">
      <Components.Text>{message}</Components.Text>
    </Components.Alert>
  )
}
