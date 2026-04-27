import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useContractorsList } from '@gusto/embedded-api/react-query/contractorsList'
import type { EntityIds } from '../../../../useEntities'
import { Skeleton } from '../components/Skeleton'
import { SkeletonDataView } from './SkeletonDataView'
import { EmptyData, Flex } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import { ContractorOnboardingStatusBadge } from '@/components/Common/OnboardingStatusBadge'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { CONTRACTOR_TYPE } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'

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

function contractorName(contractor: Contractor) {
  return contractor.type === CONTRACTOR_TYPE.BUSINESS
    ? contractor.businessName
    : firstLastName({
        first_name: contractor.firstName,
        last_name: contractor.lastName,
      })
}

function contractorMenu(actions: { label: string; onClick: () => void }[]) {
  return function ContractorMenu() {
    return <HamburgerMenu items={actions} triggerLabel="Actions" />
  }
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
  },
) {
  const actions: { label: string; onClick: () => void }[] = [
    {
      label: 'View details',
      onClick: () => {
        callbacks.onViewDetails(contractor)
      },
    },
  ]

  if (contractor.dismissalDate && contractor.dismissalCancellationEligible) {
    actions.push({
      label: 'Cancel dismissal',
      onClick: () => {
        callbacks.onCancelDismissal(contractor)
      },
    })
  } else if (!contractor.dismissalDate) {
    actions.push({
      label: 'Dismiss contractor',
      onClick: () => {
        callbacks.onDismiss(contractor)
      },
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
}: {
  contractors: Contractor[]
  isFetching: boolean
  cancellingId: string | null
  onViewDetails: (contractor: Contractor) => void
  onDismiss: (contractor: Contractor) => void
  onCancelDismissal: (contractor: Contractor) => void
}) {
  return (
    <SkeletonDataView
      label="Active contractors"
      data={contractors}
      isFetching={isFetching}
      columns={[
        {
          title: 'Name',
          render: contractor => contractorName(contractor),
          skeletonWidth: 120,
        },
        {
          title: 'Type',
          render: contractor => contractor.type ?? '–',
          skeletonWidth: 80,
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
          })}
          triggerLabel="Actions"
        />
      )}
      emptyState={() => <EmptyData title="No active contractors found." />}
    />
  )
}

function OnboardingContractorsTable({
  contractors,
  isFetching,
}: {
  contractors: Contractor[]
  isFetching: boolean
}) {
  return (
    <SkeletonDataView
      label="Onboarding contractors"
      data={contractors}
      isFetching={isFetching}
      columns={[
        {
          title: 'Name',
          render: contractor => contractorName(contractor),
          skeletonWidth: 120,
        },
        {
          title: 'Type',
          render: contractor => contractor.type ?? '–',
          skeletonWidth: 80,
        },
        {
          title: 'Onboarding status',
          render: contractor => (
            <ContractorOnboardingStatusBadge
              onboarded={contractor.onboarded}
              onboardingStatus={contractor.onboardingStatus}
            />
          ),
          skeletonWidth: 90,
        },
      ]}
      itemMenu={contractorMenu([{ label: 'View details', onClick: () => {} }])}
      emptyState={() => <EmptyData title="No contractors currently onboarding." />}
    />
  )
}

function dismissedContractorActions(
  contractor: Contractor,
  callbacks: {
    onCancelDismissal: (contractor: Contractor) => void
    onRehire: (contractor: Contractor) => void
  },
) {
  const actions: { label: string; onClick: () => void }[] = [
    { label: 'View details', onClick: () => {} },
  ]

  if (contractor.upcomingEmployment) {
    if (contractor.rehireCancellationEligible) {
      actions.push({
        label: 'Cancel rehire',
        onClick: () => {
          callbacks.onCancelDismissal(contractor)
        },
      })
    }
  } else if (contractor.dismissalCancellationEligible) {
    actions.push({
      label: 'Cancel dismissal',
      onClick: () => {
        callbacks.onCancelDismissal(contractor)
      },
    })
  } else if (!contractor.isActive) {
    actions.push({
      label: 'Rehire contractor',
      onClick: () => {
        callbacks.onRehire(contractor)
      },
    })
  }

  return actions
}

function DismissedContractorsTable({
  contractors,
  isFetching,
  onCancelDismissal,
  onRehire,
}: {
  contractors: Contractor[]
  isFetching: boolean
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
          render: contractor => contractorName(contractor),
          skeletonWidth: 120,
        },
        {
          title: 'Type',
          render: contractor => contractor.type ?? '–',
          skeletonWidth: 80,
        },
        {
          title: 'Dismissal date',
          render: contractor => contractor.dismissalDate ?? '–',
          skeletonWidth: 80,
        },
      ]}
      itemMenu={contractor => (
        <HamburgerMenu
          items={dismissedContractorActions(contractor, { onCancelDismissal, onRehire })}
          triggerLabel="Actions"
        />
      )}
      emptyState={() => <EmptyData title="No dismissed contractors found." />}
    />
  )
}

function ContractorListContent() {
  const Components = useComponentContext()
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const companyId = entities.companyId
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmCancelContractor, setConfirmCancelContractor] = useState<Contractor | null>(null)
  const [isCancelPending, setIsCancelPending] = useState(false)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const msg = searchParams.get('success')
    if (msg) {
      setSuccessMessage(msg)
      setSearchParams({}, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [selectedTab, setSelectedTab] = useState('active')

  const queryParams = useMemo(() => {
    switch (selectedTab) {
      case 'active':
        return { companyUuid: companyId, onboardedActive: true }
      case 'onboarding':
        return { companyUuid: companyId, onboardedActive: false }
      case 'dismissed':
        return { companyUuid: companyId, terminatedToday: true }
      default:
        return { companyUuid: companyId, onboardedActive: true }
    }
  }, [companyId, selectedTab])

  const { data, isPending, refetch } = useContractorsList(queryParams)
  const contractors = data?.contractors ?? []

  const handleCancelDismissal = async () => {
    const contractor = confirmCancelContractor
    if (!contractor) return
    setIsCancelPending(true)
    setCancellingId(contractor.uuid)
    try {
      const res = await fetch(`/api/v1/contractors/${contractor.uuid}/termination`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to cancel dismissal (${res.status})`)
      }
      setConfirmCancelContractor(null)
      await refetch()
      const name = [contractor.firstName, contractor.lastName].filter(Boolean).join(' ')
      setSuccessMessage(`Dismissal cancelled for ${name}`)
    } finally {
      setIsCancelPending(false)
      setCancellingId(null)
    }
  }

  const cancelContractorName = confirmCancelContractor
    ? [confirmCancelContractor.firstName, confirmCancelContractor.lastName]
        .filter(Boolean)
        .join(' ')
    : ''

  const tabs = [
    {
      id: 'active',
      label: 'Active',
      content: null,
    },
    {
      id: 'onboarding',
      label: 'Onboarding',
      content: null,
    },
    {
      id: 'dismissed',
      label: 'Dismissed',
      content: null,
    },
  ]

  const renderTable = () => {
    switch (selectedTab) {
      case 'active':
        return (
          <ActiveContractorsTable
            contractors={contractors}
            isFetching={isPending}
            cancellingId={cancellingId}
            onViewDetails={contractor => {
              void navigate(contractor.uuid)
            }}
            onDismiss={contractor => {
              void navigate(`${contractor.uuid}/dismiss`)
            }}
            onCancelDismissal={contractor => {
              setConfirmCancelContractor(contractor)
            }}
          />
        )
      case 'onboarding':
        return <OnboardingContractorsTable contractors={contractors} isFetching={isPending} />
      case 'dismissed':
        return (
          <DismissedContractorsTable
            contractors={contractors}
            isFetching={isPending}
            onCancelDismissal={contractor => {
              setConfirmCancelContractor(contractor)
            }}
            onRehire={contractor => {
              void navigate(`${contractor.uuid}/rehire`)
            }}
          />
        )
    }
  }

  return (
    <Flex flexDirection="column" gap={24}>
      {successMessage && (
        <Components.Alert
          label={successMessage}
          status="success"
          onDismiss={() => {
            setSuccessMessage(null)
          }}
        />
      )}
      <Flex justifyContent="space-between" alignItems="center">
        <Components.Heading as="h1" styledAs="h2">
          Contractors
        </Components.Heading>
        <Components.Button variant="primary" onClick={() => {}}>
          Add contractor
        </Components.Button>
      </Flex>
      <Flex flexDirection="column" gap={0}>
        <Components.Tabs onSelectionChange={setSelectedTab} tabs={tabs} selectedId={selectedTab} />
        {renderTable()}
      </Flex>
      <Components.Dialog
        isOpen={confirmCancelContractor !== null}
        onClose={() => {
          setConfirmCancelContractor(null)
        }}
        onPrimaryActionClick={() => {
          void handleCancelDismissal()
        }}
        isPrimaryActionLoading={isCancelPending}
        primaryActionLabel="Yes, cancel"
        closeActionLabel="No, go back"
        title="Cancel dismissal"
      >
        <Components.Text>
          Cancel {cancelContractorName}&apos;s dismissal? Their dismissal on{' '}
          {confirmCancelContractor?.dismissalDate &&
            formatDate(confirmCancelContractor.dismissalDate)}{' '}
          will be removed and this contractor will remain active.
        </Components.Text>
      </Components.Dialog>
    </Flex>
  )
}

export default function ContractorList() {
  return <ContractorListContent />
}
