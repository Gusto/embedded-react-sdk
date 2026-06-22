import { Suspense, useMemo, useState } from 'react'
import { useContractorsListSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorsList'
import { useContractorPaymentGroupsCreateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorPaymentGroupsCreate'
import { useContractorPaymentGroupsPreviewMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorPaymentGroupsPreview'
import { RFCDate } from '@gusto/embedded-api-v-2025-11-15/types/rfcdate'
import { SelectContractors } from '../../../components/contractor/payments/SelectContractors/SelectContractors'
import { HistoricalPaymentConfiguration } from '../../../components/contractor/payments/HistoricalPaymentConfiguration/HistoricalPaymentConfiguration'
import { HistoricalPaymentSummary } from '../../../components/contractor/payments/HistoricalPaymentSummary/HistoricalPaymentSummary'
import {
  emptyPaymentFor,
  type ContractorOption,
  type HistoricalContractorPayment,
} from '../../../components/contractor/payments/types'
import { toContractorOptions } from './states'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import { BaseComponent } from '@/components/Base'

export interface CreateHistoricalPaymentProps {
  companyId: string
  onDone?: () => void
}

type Step = 'select' | 'configure' | 'review'

function Root({ companyId, onDone }: CreateHistoricalPaymentProps) {
  const Components = useComponentContext()
  const { data } = useContractorsListSuspense({ companyUuid: companyId })
  const previewMutation = useContractorPaymentGroupsPreviewMutation()
  const createMutation = useContractorPaymentGroupsCreateMutation()

  const contractors = useMemo(() => toContractorOptions(data.contractors ?? []), [data.contractors])

  const [step, setStep] = useState<Step>('select')
  const [paidDate, setPaidDate] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [payments, setPayments] = useState<HistoricalContractorPayment[]>([])
  const [submittedCount, setSubmittedCount] = useState<number | null>(null)

  const selectedContractors = useMemo(
    () => contractors.filter(c => selectedIds.includes(c.id)),
    [contractors, selectedIds],
  )

  const toggleContractor = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const selectAllContractors = (checked: boolean, visibleContractors: ContractorOption[]) => {
    const visibleIds = visibleContractors.map(c => c.id)
    setSelectedIds(prev =>
      checked
        ? Array.from(new Set([...prev, ...visibleIds]))
        : prev.filter(id => !visibleIds.includes(id)),
    )
  }

  const handleSelectContinue = () => {
    setPayments(
      selectedContractors.map(c => {
        const existing = payments.find(p => p.contractorId === c.id)
        return existing ?? emptyPaymentFor(c)
      }),
    )
    setStep('configure')
  }

  const handleUpdatePayment = (updated: HistoricalContractorPayment) => {
    setPayments(prev => prev.map(p => (p.contractorId === updated.contractorId ? updated : p)))
  }

  const handleSubmit = async () => {
    const touched = payments.filter(p => {
      const contractor = contractors.find(c => c.id === p.contractorId)
      if (!contractor) return false
      const wage =
        contractor.wageType === 'Hourly'
          ? Number(p.hours || '0') * Number(contractor.hourlyRate || '0')
          : Number(p.wage || '0')
      return wage + Number(p.bonus || '0') + Number(p.reimbursement || '0') > 0
    })

    if (touched.length === 0 || !paidDate) return

    const contractorPayments = touched.map(payment => {
      const contractor = contractors.find(c => c.id === payment.contractorId)!
      return {
        contractorUuid: payment.contractorId,
        paymentMethod: 'Historical Payment' as const,
        ...(contractor.wageType === 'Hourly'
          ? { hours: payment.hours || '0', bonus: payment.bonus || '0' }
          : { wage: payment.wage || '0' }),
        reimbursement: payment.reimbursement || '0',
      }
    })

    const previewResult = await previewMutation.mutateAsync({
      request: {
        companyId,
        requestBody: {
          checkDate: new RFCDate(paidDate),
          contractorPayments,
        },
      },
    })

    const creationToken = previewResult.contractorPaymentGroupPreview?.creationToken
    if (!creationToken) return

    await createMutation.mutateAsync({
      request: {
        companyId,
        requestBody: {
          checkDate: new RFCDate(paidDate),
          creationToken,
          contractorPayments,
        },
      },
    })

    setSubmittedCount(touched.length)
    onDone?.()
  }

  if (submittedCount !== null) {
    return (
      <Components.Alert label="Historical payment recorded" status="success">
        Submitted {submittedCount} payment(s) for {paidDate}.
      </Components.Alert>
    )
  }

  if (step === 'select') {
    return (
      <SelectContractors
        contractors={contractors}
        paidDate={paidDate}
        selectedContractorIds={selectedIds}
        onPaidDateChange={setPaidDate}
        onToggleContractor={toggleContractor}
        onSelectAllContractors={selectAllContractors}
        onContinue={handleSelectContinue}
      />
    )
  }

  if (step === 'configure') {
    const selected = contractorsByIds(contractors, selectedIds)
    return (
      <HistoricalPaymentConfiguration
        contractors={selected}
        payments={payments}
        onUpdatePayment={handleUpdatePayment}
        onContinue={() => {
          setStep('review')
        }}
        onBack={() => {
          setStep('select')
        }}
      />
    )
  }

  return (
    <HistoricalPaymentSummary
      contractors={contractorsByIds(contractors, selectedIds)}
      payments={payments}
      paidDate={paidDate}
      isSubmitting={previewMutation.isPending || createMutation.isPending}
      onSubmit={handleSubmit}
      onBack={() => {
        setStep('configure')
      }}
    />
  )
}

function contractorsByIds(contractors: ContractorOption[], ids: string[]) {
  return contractors.filter(c => ids.includes(c.id))
}

export function CreateHistoricalPayment(props: CreateHistoricalPaymentProps) {
  return (
    <BaseComponent onEvent={() => {}}>
      <Flex flexDirection="column" gap={32} alignItems="stretch">
        <Suspense fallback={<div>Loading contractors…</div>}>
          <Root {...props} />
        </Suspense>
      </Flex>
    </BaseComponent>
  )
}
