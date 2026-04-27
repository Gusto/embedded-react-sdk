import { Suspense, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { contractorName } from '../components/contractorName'
import { ContractorRehireForm } from '../components/ContractorRehireForm'
import { Skeleton } from '../components/Skeleton'
import { Flex } from '@/components/Common'
import { BaseComponent } from '@/components/Base'

function RehireSkeleton() {
  return (
    <Flex flexDirection="column" gap={24}>
      <Skeleton width={250} height={28} />
      <Skeleton width="100%" height={60} />
      <Skeleton width={200} height={40} />
    </Flex>
  )
}

function ContractorRehireContent() {
  const { contractorId } = useParams<{ contractorId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const { data } = useContractorsGetSuspense({ contractorUuid: contractorId! })
  const contractor = data.contractor

  if (!contractor) return null

  const handleRehire = async ({ startDate }: { startDate: string }) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/v1/contractors/${contractor.uuid}/rehire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: startDate }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to rehire contractor (${res.status})`)
      }

      const name = contractorName(contractor)
      queryClient.removeQueries({ queryKey: ['@gusto/embedded-api', 'Contractors', 'list'] })
      void navigate(`..?success=${encodeURIComponent(`Rehire scheduled for ${name}`)}`, {
        replace: true,
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <ContractorRehireForm
      contractor={contractor}
      isPending={isPending}
      onCancel={() => {
        void navigate('..')
      }}
      onRehire={handleRehire}
    />
  )
}

export function ContractorRehire() {
  return (
    <BaseComponent onEvent={() => {}}>
      <Suspense fallback={<RehireSkeleton />}>
        <ContractorRehireContent />
      </Suspense>
    </BaseComponent>
  )
}
