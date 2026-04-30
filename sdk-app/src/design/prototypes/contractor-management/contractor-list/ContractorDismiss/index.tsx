import { Suspense, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { ContractorDismissalForm } from '../../contractor-profile/components/ContractorDismissalForm'
import { contractorName } from '../../contractor-profile/components/contractorName'
import { Skeleton } from '../../contractor-profile/components/Skeleton'
import { Flex } from '@/components/Common'
import { BaseComponent } from '@/components/Base'

function DismissSkeleton() {
  return (
    <Flex flexDirection="column" gap={24}>
      <Skeleton width={250} height={28} />
      <Skeleton width="100%" height={60} />
      <Skeleton width={200} height={40} />
    </Flex>
  )
}

function ContractorDismissContent() {
  const { contractorId } = useParams<{ contractorId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const { data } = useContractorsGetSuspense({ contractorUuid: contractorId! })
  const contractor = data.contractor

  if (!contractor) return null

  const handleDismiss = async ({ endDate }: { endDate: string }) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/v1/contractors/${contractor.uuid}/termination`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ end_date: endDate }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to dismiss contractor (${res.status})`)
      }

      const name = contractorName(contractor)
      const today = new Date().toISOString().slice(0, 10)
      const message =
        endDate <= today ? `${name} has been dismissed` : `Dismissal scheduled for ${name}`
      queryClient.removeQueries({ queryKey: ['@gusto/embedded-api', 'Contractors'] })
      void navigate(`..?success=${encodeURIComponent(message)}`, {
        replace: true,
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <ContractorDismissalForm
      contractor={contractor}
      isPending={isPending}
      onCancel={() => {
        void navigate('..')
      }}
      onDismiss={handleDismiss}
    />
  )
}

export function ContractorDismiss() {
  return (
    <BaseComponent onEvent={() => {}}>
      <Suspense fallback={<DismissSkeleton />}>
        <ContractorDismissContent />
      </Suspense>
    </BaseComponent>
  )
}
