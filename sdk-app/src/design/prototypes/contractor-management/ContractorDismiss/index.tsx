import { Suspense, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { ContractorDismissalForm } from '../components/ContractorDismissalForm'
import { Skeleton } from '../components/Skeleton'
import { Flex } from '@/components/Common'
import { BaseComponent } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import CaretLeftIcon from '@/assets/icons/caret-left.svg?react'

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

      const name = [contractor.firstName, contractor.lastName].filter(Boolean).join(' ')
      queryClient.removeQueries({ queryKey: ['@gusto/embedded-api', 'Contractors', 'list'] })
      void navigate(`..?success=${encodeURIComponent(`Dismissal scheduled for ${name}`)}`, {
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
  const navigate = useNavigate()
  const Components = useComponentContext()

  return (
    <BaseComponent onEvent={() => {}}>
      <Flex flexDirection="column" gap={32}>
        <div>
          <Components.Button
            variant="secondary"
            onClick={() => {
              void navigate('..')
            }}
          >
            <CaretLeftIcon /> Back to contractors
          </Components.Button>
        </div>
        <Suspense fallback={<DismissSkeleton />}>
          <ContractorDismissContent />
        </Suspense>
      </Flex>
    </BaseComponent>
  )
}
