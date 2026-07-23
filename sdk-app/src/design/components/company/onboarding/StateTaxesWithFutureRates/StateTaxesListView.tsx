import {
  SetupStatus,
  type TaxRequirementStatesList,
} from '@gusto/embedded-api/models/components/taxrequirementstateslist'
import { DataView, EmptyData, Flex, HamburgerMenu, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type BadgeStatus = 'success' | 'warning' | 'info'

const badgeStatusMap: Record<SetupStatus, BadgeStatus> = {
  [SetupStatus.NotStarted]: 'info',
  [SetupStatus.InProgress]: 'warning',
  [SetupStatus.Complete]: 'success',
}

const badgeLabelMap: Record<SetupStatus, string> = {
  [SetupStatus.NotStarted]: 'Not started',
  [SetupStatus.InProgress]: 'In progress',
  [SetupStatus.Complete]: 'Complete',
}

const editCtaLabelMap: Record<SetupStatus, string> = {
  [SetupStatus.NotStarted]: 'Start setup',
  [SetupStatus.InProgress]: 'Continue setup',
  [SetupStatus.Complete]: 'Edit current tax rate',
}

function getSetupStatus(req: TaxRequirementStatesList): SetupStatus {
  return req.setupStatus ?? SetupStatus.InProgress
}

interface StateTaxesListViewProps {
  stateTaxRequirements: TaxRequirementStatesList[]
  onEditCurrent: (state: string) => void
  onManageRates: (state: string) => void
}

export function StateTaxesListView({
  stateTaxRequirements,
  onEditCurrent,
  onManageRates,
}: StateTaxesListViewProps) {
  const Components = useComponentContext()

  const { ...dataViewProps } = useDataView<TaxRequirementStatesList>({
    data: stateTaxRequirements,
    columns: [
      {
        key: 'state',
        title: 'State',
        render: requirement => (
          <Flex flexDirection="column" gap={4}>
            <Components.Text as="span">{requirement.state}</Components.Text>
            {requirement.defaultRatesApplied && (
              <Components.Text size="sm">Default rates applied</Components.Text>
            )}
          </Flex>
        ),
      },
      {
        key: 'status',
        title: 'Status',
        render: requirement => {
          const status = getSetupStatus(requirement)
          return (
            <Flex gap={8} alignItems="center" flexWrap="wrap">
              <Components.Badge status={badgeStatusMap[status]}>
                {badgeLabelMap[status]}
              </Components.Badge>
              {requirement.readyToRunPayroll && (
                <Components.Badge status="success">Ready to run payroll</Components.Badge>
              )}
            </Flex>
          )
        },
      },
    ],
    itemMenu: requirement => {
      const status = getSetupStatus(requirement)
      const state = requirement.state
      if (!state) return null
      return (
        <HamburgerMenu
          triggerLabel={`Actions for ${state}`}
          items={[
            {
              label: editCtaLabelMap[status],
              onClick: () => {
                onEditCurrent(state)
              },
            },
            {
              label: 'Manage tax rates',
              onClick: () => {
                onManageRates(state)
              },
            },
          ]}
        />
      )
    },
    emptyState: () => (
      <EmptyData
        title="No state tax requirements yet"
        description="Add a work address to a state to see its tax requirements here."
      />
    ),
  })

  return (
    <Flex flexDirection="column" gap={16} alignItems="stretch">
      <Components.Heading as="h2">State tax setup</Components.Heading>
      <DataView label="State tax requirements" {...dataViewProps} />
    </Flex>
  )
}
