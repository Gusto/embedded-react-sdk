import { useState } from 'react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { contractorName } from '../../common/contractorName'
import { Skeleton } from '../../common/Skeleton'
import { SkeletonDataView } from './SkeletonDataView'
import { EmptyData, Flex } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import { ContractorOnboardingStatusBadge } from '@/components/Common/OnboardingStatusBadge'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ContractorOnboardingStatus } from '@/shared/constants'

export type ContractorListTab = 'active' | 'onboarding' | 'dismissed'

export interface ContractorListProps {
  /** Contractors visible on the currently selected tab. */
  contractors: Contractor[]
  /** True while the container is fetching data for the selected tab. */
  isFetching?: boolean

  /** Currently selected tab; controlled by the container. */
  selectedTab: ContractorListTab
  /** Fires when the user clicks a tab. */
  onSelectTab: (tab: ContractorListTab) => void

  successMessage?: string | null
  errorMessage?: string | null
  onDismissSuccess?: () => void
  onDismissError?: () => void

  // Navigation actions. Defaults to no-op so state demos render without
  // wiring anything up.
  onAddContractor?: () => void
  onViewContractor?: (contractor: Contractor) => void
  onDismissContractor?: (contractor: Contractor) => void
  onRehireContractor?: (contractor: Contractor) => void
  onEditOnboardingContractor?: (contractor: Contractor) => void

  // Async confirm callbacks. The View manages the dialog open/loading
  // state and awaits these when the user confirms; container performs
  // the actual mutation + invalidation.
  onConfirmCancelDismissal?: (contractor: Contractor) => Promise<void>
  onConfirmCancelRehire?: (contractor: Contractor) => Promise<void>
  onConfirmRemoveContractor?: (contractor: Contractor) => Promise<void>
  onConfirmCancelSelfOnboarding?: (contractor: Contractor) => Promise<void>
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const sameYear = date.getFullYear() === now.getFullYear()
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const day = date.getDate()
  return sameYear ? `${month} ${day}` : `${month} ${day}, ${date.getFullYear()}`
}

function formatRate(contractor: Contractor) {
  if (contractor.wageType === 'Hourly' && contractor.hourlyRate) {
    return `Hourly — $${contractor.hourlyRate}/hr`
  }
  return contractor.wageType ?? '–'
}

function ContractorNameCell({ contractor }: { contractor: Contractor }) {
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={0}>
      <Components.Text size="sm" weight="medium">
        {contractorName(contractor)}
      </Components.Text>
      <Components.Text variant="supporting" size="sm">
        {contractor.type ?? '–'}
      </Components.Text>
    </Flex>
  )
}

function ContractorStatusBadge({
  contractor,
  isLoading,
}: {
  contractor: Contractor
  isLoading?: boolean
}) {
  const Components = useComponentContext()
  if (isLoading) return <Skeleton width={120} height={16} />
  if (contractor.upcomingEmployment?.startDate) {
    return (
      <Components.Badge status="info">
        Starts {formatDate(contractor.upcomingEmployment.startDate)}
      </Components.Badge>
    )
  }
  if (contractor.dismissalDate) {
    return (
      <Components.Badge status="warning">
        Last day {formatDate(contractor.dismissalDate)}
      </Components.Badge>
    )
  }
  return null
}

function activeContractorActions(
  contractor: Contractor,
  callbacks: {
    onViewDetails: (contractor: Contractor) => void
    onDismiss: (contractor: Contractor) => void
    onCancelDismissal: (contractor: Contractor) => void
    onCancelRehire: (contractor: Contractor) => void
  },
) {
  const actions: { label: string; onClick: () => void }[] = [
    { label: 'View details', onClick: () => { callbacks.onViewDetails(contractor); } },
  ]
  if (contractor.upcomingEmployment && contractor.rehireCancellationEligible) {
    actions.push({
      label: 'Cancel rehire',
      onClick: () => { callbacks.onCancelRehire(contractor); },
    })
  } else if (contractor.dismissalDate && contractor.dismissalCancellationEligible) {
    actions.push({
      label: 'Cancel dismissal',
      onClick: () => { callbacks.onCancelDismissal(contractor); },
    })
  } else if (!contractor.dismissalDate && !contractor.upcomingEmployment) {
    actions.push({
      label: 'Dismiss contractor',
      onClick: () => { callbacks.onDismiss(contractor); },
    })
  }
  return actions
}

function ActiveContractorsTable({
  contractors,
  isFetching,
  cancellingId,
  onViewDetails,
  onDismiss,
  onCancelDismissal,
  onCancelRehire,
}: {
  contractors: Contractor[]
  isFetching: boolean
  cancellingId: string | null
  onViewDetails: (contractor: Contractor) => void
  onDismiss: (contractor: Contractor) => void
  onCancelDismissal: (contractor: Contractor) => void
  onCancelRehire: (contractor: Contractor) => void
}) {
  return (
    <SkeletonDataView
      label="Active contractors"
      data={contractors}
      isFetching={isFetching}
      columns={[
        {
          title: 'Name',
          render: contractor => <ContractorNameCell contractor={contractor} />,
          skeletonWidth: 120,
        },
        {
          title: 'Rate',
          render: contractor => formatRate(contractor),
          skeletonWidth: 100,
        },
        {
          title: '',
          render: contractor => (
            <ContractorStatusBadge
              contractor={contractor}
              isLoading={cancellingId === contractor.uuid}
            />
          ),
          skeletonWidth: 120,
        },
      ]}
      itemMenu={contractor => (
        <HamburgerMenu
          items={activeContractorActions(contractor, {
            onViewDetails,
            onDismiss,
            onCancelDismissal,
            onCancelRehire,
          })}
          triggerLabel="Actions"
        />
      )}
      emptyState={() => <EmptyData title="No active contractors found." />}
    />
  )
}

function onboardingContractorActions(
  contractor: Contractor,
  callbacks: {
    onEdit: (contractor: Contractor) => void
    onViewDetails: (contractor: Contractor) => void
    onRemove: (contractor: Contractor) => void
    onCancelSelfOnboarding: (contractor: Contractor) => void
  },
) {
  const actions: { label: string; onClick: () => void }[] = []
  const status = contractor.onboardingStatus

  if (
    status === ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE ||
    status === ContractorOnboardingStatus.SELF_ONBOARDING_NOT_INVITED
  ) {
    actions.push({ label: 'Remove', onClick: () => { callbacks.onRemove(contractor); } })
  } else if (
    status === ContractorOnboardingStatus.SELF_ONBOARDING_INVITED ||
    status === ContractorOnboardingStatus.SELF_ONBOARDING_STARTED
  ) {
    actions.push(
      {
        label: 'Cancel self-onboarding',
        onClick: () => { callbacks.onCancelSelfOnboarding(contractor); },
      },
      { label: 'Remove', onClick: () => { callbacks.onRemove(contractor); } },
    )
  } else if (
    status === ContractorOnboardingStatus.ADMIN_ONBOARDING_REVIEW ||
    status === ContractorOnboardingStatus.SELF_ONBOARDING_REVIEW
  ) {
    actions.push({ label: 'Remove', onClick: () => { callbacks.onRemove(contractor); } })
  } else if (status === ContractorOnboardingStatus.ONBOARDING_COMPLETED) {
    actions.push(
      { label: 'View details', onClick: () => { callbacks.onViewDetails(contractor); } },
      { label: 'Remove', onClick: () => { callbacks.onRemove(contractor); } },
    )
  }
  return actions
}

function OnboardingActionButton({
  contractor,
  onEdit,
}: {
  contractor: Contractor
  onEdit: (contractor: Contractor) => void
}) {
  const Components = useComponentContext()
  const status = contractor.onboardingStatus
  if (
    status === ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE ||
    status === ContractorOnboardingStatus.SELF_ONBOARDING_NOT_INVITED
  ) {
    return (
      <Components.Button variant="secondary" onClick={() => { onEdit(contractor); }}>
        Continue
      </Components.Button>
    )
  }
  if (
    status === ContractorOnboardingStatus.ADMIN_ONBOARDING_REVIEW ||
    status === ContractorOnboardingStatus.SELF_ONBOARDING_REVIEW
  ) {
    return (
      <Components.Button variant="secondary" onClick={() => { onEdit(contractor); }}>
        Review
      </Components.Button>
    )
  }
  return null
}

function OnboardingContractorsTable({
  contractors,
  isFetching,
  onEdit,
  onViewDetails,
  onRemove,
  onCancelSelfOnboarding,
}: {
  contractors: Contractor[]
  isFetching: boolean
  onEdit: (contractor: Contractor) => void
  onViewDetails: (contractor: Contractor) => void
  onRemove: (contractor: Contractor) => void
  onCancelSelfOnboarding: (contractor: Contractor) => void
}) {
  const Components = useComponentContext()
  return (
    <SkeletonDataView
      label="Onboarding contractors"
      data={contractors}
      isFetching={isFetching}
      columns={[
        {
          title: 'Name',
          render: contractor => <ContractorNameCell contractor={contractor} />,
          skeletonWidth: 120,
        },
        {
          title: 'Onboarding status',
          render: contractor => (
            <Flex alignItems="center" gap={8}>
              <ContractorOnboardingStatusBadge
                onboarded={contractor.onboarded}
                onboardingStatus={contractor.onboardingStatus}
              />
              {contractor.onboardingStatus === ContractorOnboardingStatus.ONBOARDING_COMPLETED &&
                contractor.upcomingEmployment?.startDate && (
                  <Components.Badge status="info">
                    Starts {formatDate(contractor.upcomingEmployment.startDate)}
                  </Components.Badge>
                )}
            </Flex>
          ),
          skeletonWidth: 90,
        },
      ]}
      itemMenu={contractor => (
        <Flex alignItems="center" justifyContent="flex-end" gap={4}>
          <OnboardingActionButton contractor={contractor} onEdit={onEdit} />
          <HamburgerMenu
            items={onboardingContractorActions(contractor, {
              onEdit,
              onViewDetails,
              onRemove,
              onCancelSelfOnboarding,
            })}
            triggerLabel="Actions"
          />
        </Flex>
      )}
      emptyState={() => <EmptyData title="No contractors currently onboarding." />}
    />
  )
}

function dismissedContractorActions(
  contractor: Contractor,
  callbacks: {
    onViewDetails: (contractor: Contractor) => void
    onCancelDismissal: (contractor: Contractor) => void
    onRehire: (contractor: Contractor) => void
  },
) {
  const actions: { label: string; onClick: () => void }[] = [
    { label: 'View details', onClick: () => { callbacks.onViewDetails(contractor); } },
  ]
  if (contractor.upcomingEmployment) {
    if (contractor.rehireCancellationEligible) {
      actions.push({
        label: 'Cancel rehire',
        onClick: () => { callbacks.onCancelDismissal(contractor); },
      })
    }
  } else if (contractor.dismissalCancellationEligible) {
    actions.push({
      label: 'Cancel dismissal',
      onClick: () => { callbacks.onCancelDismissal(contractor); },
    })
  } else if (!contractor.isActive) {
    actions.push({ label: 'Rehire contractor', onClick: () => { callbacks.onRehire(contractor); } })
  }
  return actions
}

function DismissedContractorsTable({
  contractors,
  isFetching,
  onViewDetails,
  onCancelDismissal,
  onRehire,
}: {
  contractors: Contractor[]
  isFetching: boolean
  onViewDetails: (contractor: Contractor) => void
  onCancelDismissal: (contractor: Contractor) => void
  onRehire: (contractor: Contractor) => void
}) {
  return (
    <SkeletonDataView
      label="Dismissed contractors"
      data={contractors}
      isFetching={isFetching}
      columns={[
        {
          title: 'Name',
          render: contractor => <ContractorNameCell contractor={contractor} />,
          skeletonWidth: 120,
        },
        {
          title: 'Dismissal date',
          render: contractor =>
            contractor.dismissalDate ? formatDate(contractor.dismissalDate) : '–',
          skeletonWidth: 80,
        },
      ]}
      itemMenu={contractor => (
        <HamburgerMenu
          items={dismissedContractorActions(contractor, {
            onViewDetails,
            onCancelDismissal,
            onRehire,
          })}
          triggerLabel="Actions"
        />
      )}
      emptyState={() => <EmptyData title="No dismissed contractors found." />}
    />
  )
}

const noop = () => {}
const asyncNoop = async () => {}

export function ContractorList({
  contractors,
  isFetching = false,
  selectedTab,
  onSelectTab,
  successMessage,
  errorMessage,
  onDismissSuccess,
  onDismissError,
  onAddContractor = noop,
  onViewContractor = noop,
  onDismissContractor = noop,
  onRehireContractor = noop,
  onEditOnboardingContractor = noop,
  onConfirmCancelDismissal = asyncNoop,
  onConfirmCancelRehire = asyncNoop,
  onConfirmRemoveContractor = asyncNoop,
  onConfirmCancelSelfOnboarding = asyncNoop,
}: ContractorListProps) {
  const Components = useComponentContext()

  // Cancel dismissal/rehire dialog state
  const [confirmCancelContractor, setConfirmCancelContractor] = useState<Contractor | null>(null)
  const [confirmCancelType, setConfirmCancelType] = useState<'dismissal' | 'rehire'>('dismissal')
  const [isCancelPending, setIsCancelPending] = useState(false)
  const cancellingId = isCancelPending ? (confirmCancelContractor?.uuid ?? null) : null

  // Onboarding remove / cancel-self-onboarding dialog state
  const [onboardingAction, setOnboardingAction] = useState<{
    contractor: Contractor
    type: 'remove' | 'cancelSelfOnboarding'
  } | null>(null)
  const [isOnboardingActionPending, setIsOnboardingActionPending] = useState(false)

  const cancelContractorName = confirmCancelContractor
    ? contractorName(confirmCancelContractor)
    : ''

  const tabs = [
    { id: 'active', label: 'Active', content: null },
    { id: 'onboarding', label: 'Onboarding', content: null },
    { id: 'dismissed', label: 'Dismissed', content: null },
  ]

  const handleConfirmCancel = async () => {
    const contractor = confirmCancelContractor
    if (!contractor) return
    setIsCancelPending(true)
    try {
      if (confirmCancelType === 'rehire') {
        await onConfirmCancelRehire(contractor)
      } else {
        await onConfirmCancelDismissal(contractor)
      }
      setConfirmCancelContractor(null)
    } finally {
      setIsCancelPending(false)
    }
  }

  const handleConfirmOnboardingAction = async () => {
    if (!onboardingAction) return
    setIsOnboardingActionPending(true)
    try {
      if (onboardingAction.type === 'remove') {
        await onConfirmRemoveContractor(onboardingAction.contractor)
      } else {
        await onConfirmCancelSelfOnboarding(onboardingAction.contractor)
      }
      setOnboardingAction(null)
    } finally {
      setIsOnboardingActionPending(false)
    }
  }

  const renderTable = () => {
    switch (selectedTab) {
      case 'active':
        return (
          <ActiveContractorsTable
            contractors={contractors}
            isFetching={isFetching}
            cancellingId={cancellingId}
            onViewDetails={onViewContractor}
            onDismiss={onDismissContractor}
            onCancelDismissal={contractor => {
              setConfirmCancelType('dismissal')
              setConfirmCancelContractor(contractor)
            }}
            onCancelRehire={contractor => {
              setConfirmCancelType('rehire')
              setConfirmCancelContractor(contractor)
            }}
          />
        )
      case 'onboarding':
        return (
          <OnboardingContractorsTable
            contractors={contractors}
            isFetching={isFetching}
            onViewDetails={onViewContractor}
            onEdit={onEditOnboardingContractor}
            onRemove={contractor => {
              setOnboardingAction({ contractor, type: 'remove' })
            }}
            onCancelSelfOnboarding={contractor => {
              setOnboardingAction({ contractor, type: 'cancelSelfOnboarding' })
            }}
          />
        )
      case 'dismissed':
        return (
          <DismissedContractorsTable
            contractors={contractors.filter(c => !c.upcomingEmployment)}
            isFetching={isFetching}
            onViewDetails={onViewContractor}
            onCancelDismissal={contractor => {
              setConfirmCancelType('dismissal')
              setConfirmCancelContractor(contractor)
            }}
            onRehire={onRehireContractor}
          />
        )
    }
  }

  return (
    <Flex flexDirection="column" gap={24}>
      {successMessage && (
        <Components.Alert label={successMessage} status="success" onDismiss={onDismissSuccess} />
      )}
      {errorMessage && (
        <Components.Alert label={errorMessage} status="error" onDismiss={onDismissError} />
      )}
      <Flex justifyContent="space-between" alignItems="center">
        <Components.Heading as="h1" styledAs="h2">
          Contractors
        </Components.Heading>
        <Components.Button variant="primary" onClick={onAddContractor}>
          Add contractor
        </Components.Button>
      </Flex>
      <Flex flexDirection="column" gap={0}>
        <Components.Tabs
          onSelectionChange={tab => { onSelectTab(tab as ContractorListTab); }}
          tabs={tabs}
          selectedId={selectedTab}
        />
        {renderTable()}
      </Flex>
      <Components.Dialog
        isOpen={confirmCancelContractor !== null}
        onClose={() => {
          setConfirmCancelContractor(null)
        }}
        onPrimaryActionClick={() => {
          void handleConfirmCancel()
        }}
        isPrimaryActionLoading={isCancelPending}
        primaryActionLabel="Yes, cancel"
        closeActionLabel="No, go back"
        title={confirmCancelType === 'rehire' ? 'Cancel rehire' : 'Cancel dismissal'}
      >
        <Components.Text>
          {confirmCancelType === 'rehire' ? (
            <>
              Cancel {cancelContractorName}&apos;s rehire? Their scheduled start date of{' '}
              {confirmCancelContractor?.upcomingEmployment?.startDate &&
                formatDate(confirmCancelContractor.upcomingEmployment.startDate)}{' '}
              will be removed.
            </>
          ) : (
            <>
              Cancel {cancelContractorName}&apos;s dismissal? Their dismissal on{' '}
              {confirmCancelContractor?.dismissalDate &&
                formatDate(confirmCancelContractor.dismissalDate)}{' '}
              will be removed and this contractor will remain active.
            </>
          )}
        </Components.Text>
      </Components.Dialog>
      <Components.Dialog
        isOpen={onboardingAction !== null}
        onClose={() => {
          setOnboardingAction(null)
        }}
        onPrimaryActionClick={() => {
          void handleConfirmOnboardingAction()
        }}
        isPrimaryActionLoading={isOnboardingActionPending}
        primaryActionLabel={
          onboardingAction?.type === 'remove' ? 'Yes, remove' : 'Cancel self-onboarding'
        }
        closeActionLabel="No, go back"
        title={onboardingAction?.type === 'remove' ? 'Remove contractor' : 'Cancel self-onboarding'}
      >
        <Components.Text>
          {onboardingAction?.type === 'remove' ? (
            <>Remove {contractorName(onboardingAction.contractor)}? This action cannot be undone.</>
          ) : onboardingAction ? (
            <>
              Self-onboarding for {contractorName(onboardingAction.contractor)} will be cancelled.
              You will need to fill out the contractor&apos;s information yourself.
            </>
          ) : null}
        </Components.Text>
      </Components.Dialog>
    </Flex>
  )
}
