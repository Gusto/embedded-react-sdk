import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import type { Contractor } from '@gusto/embedded-api-v-2026-06-15/models/components/contractor'
import { useContractorsList } from '@gusto/embedded-api-v-2026-06-15/react-query/contractorsList'
import { useContractorsDeleteMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/contractorsDelete'
import { useContractorsUpdateOnboardingStatusMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/contractorsUpdateOnboardingStatus'
import { useQueryClient } from '@tanstack/react-query'
import type { EntityIds } from '../../../useEntities'
import { contractorName } from '../../components/contractor/shared/contractorName'
import {
  ContractorList as ContractorListView,
  type ContractorListTab,
} from '../../components/contractor/management/ContractorList/ContractorList'
import { ContractorOnboardingStatus } from '@/shared/constants'

export function ContractorList() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const companyId = entities.companyId
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<ContractorListTab>('active')

  useEffect(() => {
    const msg = searchParams.get('success')
    if (msg) {
      setSuccessMessage(msg)
      setSearchParams({}, { replace: true })
      queryClient.removeQueries({ queryKey: ['@gusto/embedded-api-v-2026-06-15', 'Contractors'] })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Active tab also merges in upcoming-rehire contractors from the
  // dismissed-tab query so they show up alongside currently-active ones.
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

  const contractors = useMemo(() => {
    if (selectedTab !== 'active') return data?.contractors ?? []
    return [...(data?.contractors ?? []), ...pendingRehires]
  }, [data, pendingRehires, selectedTab])

  const cancelTermination = async (contractor: Contractor, type: 'dismissal' | 'rehire') => {
    try {
      const res = await fetch(
        `/api/v1/contractors/${contractor.uuid}/${type === 'rehire' ? 'rehire' : 'termination'}`,
        { method: 'DELETE' },
      )
      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as { message?: string }
        throw new Error(
          errorData.message ??
            `Failed to cancel ${type === 'rehire' ? 'rehire' : 'dismissal'} (${res.status})`,
        )
      }
      setSuccessMessage(
        type === 'rehire'
          ? `Rehire cancelled for ${contractorName(contractor)}`
          : `Dismissal cancelled for ${contractorName(contractor)}`,
      )
      queryClient.removeQueries({ queryKey: ['@gusto/embedded-api-v-2026-06-15', 'Contractors'] })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : `Failed to cancel ${type === 'rehire' ? 'rehire' : 'dismissal'}. Please try again.`,
      )
      throw error
    }
  }

  return (
    <ContractorListView
      contractors={contractors}
      isFetching={isPending}
      selectedTab={selectedTab}
      onSelectTab={setSelectedTab}
      successMessage={successMessage}
      errorMessage={errorMessage}
      onDismissSuccess={() => {
        setSuccessMessage(null)
      }}
      onDismissError={() => {
        setErrorMessage(null)
      }}
      onAddContractor={() => {
        void navigate('add')
      }}
      onViewContractor={contractor => {
        void navigate(contractor.uuid)
      }}
      onDismissContractor={contractor => {
        void navigate(`${contractor.uuid}/dismiss`)
      }}
      onRehireContractor={contractor => {
        void navigate(`${contractor.uuid}/rehire`)
      }}
      onEditOnboardingContractor={contractor => {
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
      onConfirmCancelDismissal={contractor => cancelTermination(contractor, 'dismissal')}
      onConfirmCancelRehire={contractor => cancelTermination(contractor, 'rehire')}
      onConfirmRemoveContractor={async contractor => {
        try {
          await deleteContractor({ request: { contractorUuid: contractor.uuid } })
          setSuccessMessage(`${contractorName(contractor)} has been removed`)
          queryClient.removeQueries({
            queryKey: ['@gusto/embedded-api-v-2026-06-15', 'Contractors'],
          })
        } catch (error) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Something went wrong. Please try again.',
          )
          throw error
        }
      }}
      onConfirmCancelSelfOnboarding={async contractor => {
        try {
          await updateOnboardingStatus({
            request: {
              contractorUuid: contractor.uuid,
              contractorOnboardingStatusUpdateRequestBody: {
                onboardingStatus: 'admin_onboarding_incomplete',
              },
            },
          })
          setSuccessMessage(`Self-onboarding cancelled for ${contractorName(contractor)}`)
          queryClient.removeQueries({
            queryKey: ['@gusto/embedded-api-v-2026-06-15', 'Contractors'],
          })
        } catch (error) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Something went wrong. Please try again.',
          )
          throw error
        }
      }}
    />
  )
}
