import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useContractorsList } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorsDeleteMutation } from '@gusto/embedded-api/react-query/contractorsDelete'
import { useContractorsUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/contractorsUpdateOnboardingStatus'
import { useQueryClient } from '@tanstack/react-query'
import type { EntityIds } from '../../../../useEntities'
import { contractorName } from '../components/contractorName'
import { Skeleton } from '../components/Skeleton'
import { SkeletonDataView } from './SkeletonDataView'
import { EmptyData, Flex } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import { ContractorOnboardingStatusBadge } from '@/components/Common/OnboardingStatusBadge'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ContractorOnboardingStatus } from '@/shared/constants'

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
    {
      label: 'View details',
      onClick: () => {
        callbacks.onViewDetails(contractor)
      },
    },
  ]

  if (contractor.upcomingEmployment && contractor.rehireCancellationEligible) {
    actions.push({
      label: 'Cancel rehire',
      onClick: () => {
        callbacks.onCancelRehire(contractor)
      },
    })
  } else if (contractor.dismissalDate && contractor.dismissalCancellationEligible) {
    actions.push({
      label: 'Cancel dismissal',
      onClick: () => {
        callbacks.onCancelDismissal(contractor)
      },
    })
  } else if (!contractor.dismissalDate && !contractor.upcomingEmployment) {
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
    actions.push({
      label: 'Remove',
      onClick: () => {
        callbacks.onRemove(contractor)
      },
    })
  } else if (
    status === ContractorOnboardingStatus.SELF_ONBOARDING_INVITED ||
    status === ContractorOnboardingStatus.SELF_ONBOARDING_STARTED
  ) {
    actions.push(
      {
        label: 'Cancel self-onboarding',
        onClick: () => {
          callbacks.onCancelSelfOnboarding(contractor)
        },
      },
      {
        label: 'Remove',
        onClick: () => {
          callbacks.onRemove(contractor)
        },
      },
    )
  } else if (
    status === ContractorOnboardingStatus.ADMIN_ONBOARDING_REVIEW ||
    status === ContractorOnboardingStatus.SELF_ONBOARDING_REVIEW
  ) {
    actions.push({
      label: 'Remove',
      onClick: () => {
        callbacks.onRemove(contractor)
      },
    })
  } else if (status === ContractorOnboardingStatus.ONBOARDING_COMPLETED) {
    actions.push(
      {
        label: 'View details',
        onClick: () => {
          callbacks.onViewDetails(contractor)
        },
      },
      {
        label: 'Remove',
        onClick: () => {
          callbacks.onRemove(contractor)
        },
      },
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
      <Components.Button
        variant="secondary"
        onClick={() => {
          onEdit(contractor)
        }}
      >
        Continue
      </Components.Button>
    )
  }

  if (
    status === ContractorOnboardingStatus.ADMIN_ONBOARDING_REVIEW ||
    status === ContractorOnboardingStatus.SELF_ONBOARDING_REVIEW
  ) {
    return (
      <Components.Button
        variant="secondary"
        onClick={() => {
          onEdit(contractor)
        }}
      >
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
    {
      label: 'View details',
      onClick: () => {
        callbacks.onViewDetails(contractor)
      },
    },
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

function ContractorListContent() {
  const Components = useComponentContext()
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const companyId = entities.companyId
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmCancelContractor, setConfirmCancelContractor] = useState<Contractor | null>(null)
  const [confirmCancelType, setConfirmCancelType] = useState<'dismissal' | 'rehire'>('dismissal')
  const [isCancelPending, setIsCancelPending] = useState(false)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const queryClient = useQueryClient()

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const msg = searchParams.get('success')
    if (msg) {
      setSuccessMessage(msg)
      setSearchParams({}, { replace: true })
      queryClient.removeQueries({ queryKey: ['@gusto/embedded-api', 'Contractors'] })
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

  const { data, isPending } = useContractorsList(queryParams)

  const { mutateAsync: deleteContractor } = useContractorsDeleteMutation()
  const { mutateAsync: updateOnboardingStatus } = useContractorsUpdateOnboardingStatusMutation()

  const [onboardingAction, setOnboardingAction] = useState<{
    contractor: Contractor
    type: 'remove' | 'cancelSelfOnboarding'
  } | null>(null)
  const [isOnboardingActionPending, setIsOnboardingActionPending] = useState(false)

  const { data: dismissedData } = useContractorsList(
    { companyUuid: companyId, terminatedToday: true },
    { enabled: selectedTab === 'active' },
  )
  const pendingRehires = useMemo(
    () =>
      (dismissedData?.contractors ?? [])
        .filter(c => c.upcomingEmployment?.startDate)
        .sort((a, b) =>
          (a.upcomingEmployment?.startDate ?? '').localeCompare(
            b.upcomingEmployment?.startDate ?? '',
          ),
        ),
    [dismissedData],
  )

  const activeContractors = useMemo(() => {
    if (selectedTab !== 'active') return data?.contractors ?? []
    return [...(data?.contractors ?? []), ...pendingRehires]
  }, [data, pendingRehires, selectedTab])

  const contractors = selectedTab === 'active' ? activeContractors : (data?.contractors ?? [])

  const handleConfirmCancel = async () => {
    const contractor = confirmCancelContractor
    if (!contractor) return
    setIsCancelPending(true)
    setCancellingId(contractor.uuid)
    const isRehire = confirmCancelType === 'rehire'
    try {
      const res = await fetch(
        `/api/v1/contractors/${contractor.uuid}/${isRehire ? 'rehire' : 'termination'}`,
        { method: 'DELETE' },
      )
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(
          errorData.message ||
            `Failed to cancel ${isRehire ? 'rehire' : 'dismissal'} (${res.status})`,
        )
      }
      setConfirmCancelContractor(null)
      setSuccessMessage(
        isRehire
          ? `Rehire cancelled for ${contractorName(contractor)}`
          : `Dismissal cancelled for ${contractorName(contractor)}`,
      )
      queryClient.removeQueries({ queryKey: ['@gusto/embedded-api', 'Contractors'] })
    } catch (error) {
      setConfirmCancelContractor(null)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : `Failed to cancel ${isRehire ? 'rehire' : 'dismissal'}. Please try again.`,
      )
    } finally {
      setIsCancelPending(false)
      setCancellingId(null)
    }
  }

  const handleConfirmOnboardingAction = async () => {
    if (!onboardingAction) return
    const { contractor, type } = onboardingAction
    setIsOnboardingActionPending(true)
    try {
      const name = contractorName(contractor)
      if (type === 'remove') {
        await deleteContractor({ request: { contractorUuid: contractor.uuid } })
        setSuccessMessage(`${name} has been removed`)
      } else {
        await updateOnboardingStatus({
          request: {
            contractorUuid: contractor.uuid,
            requestBody: { onboardingStatus: 'admin_onboarding_incomplete' },
          },
        })
        setSuccessMessage(`Self-onboarding cancelled for ${name}`)
      }
      setOnboardingAction(null)
      queryClient.removeQueries({ queryKey: ['@gusto/embedded-api', 'Contractors'] })
    } catch (error) {
      setOnboardingAction(null)
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      )
    } finally {
      setIsOnboardingActionPending(false)
    }
  }

  const cancelContractorName = confirmCancelContractor
    ? contractorName(confirmCancelContractor)
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
            isFetching={isPending}
            onViewDetails={contractor => {
              void navigate(contractor.uuid)
            }}
            onEdit={contractor => {
              const status = contractor.onboardingStatus
              if (
                status === ContractorOnboardingStatus.ADMIN_ONBOARDING_REVIEW ||
                status === ContractorOnboardingStatus.SELF_ONBOARDING_REVIEW
              ) {
                void navigate(contractor.uuid)
              } else {
                void navigate(`add/${contractor.uuid}`)
              }
            }}
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
            isFetching={isPending}
            onViewDetails={contractor => {
              void navigate(contractor.uuid)
            }}
            onCancelDismissal={contractor => {
              setConfirmCancelType('dismissal')
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
      {errorMessage && (
        <Components.Alert
          label={errorMessage}
          status="error"
          onDismiss={() => {
            setErrorMessage(null)
          }}
        />
      )}
      <Flex justifyContent="space-between" alignItems="center">
        <Components.Heading as="h1" styledAs="h2">
          Contractors
        </Components.Heading>
        <Components.Button
          variant="primary"
          onClick={() => {
            void navigate('add')
          }}
        >
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

export default function ContractorList() {
  return <ContractorListContent />
}
