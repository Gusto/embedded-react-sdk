import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  PostV1CompaniesCompanyIdContractorPaymentGroupsContractorPayments as ContractorPayments,
  PostV1CompaniesCompanyIdContractorPaymentGroupsPaymentMethod as ContractorPaymentMethod,
} from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import {
  createEditContractorPaymentFormSchema,
  type EditContractorPaymentFormValues,
} from '../CreatePayment/EditContractorPaymentFormSchema'

/** @internal */
export interface UsePaymentAmountsEditorParams {
  contractors: Contractor[]
  allowedPaymentMethods: ContractorPaymentMethod[]
  onEditOpen?: () => void
  onEditSave?: (data: EditContractorPaymentFormValues) => void
}

/** @internal */
export interface UsePaymentAmountsEditorReturn {
  virtualContractorPayments: (ContractorPayments & { isTouched: boolean })[]
  totals: { wage: number; bonus: number; reimbursement: number; total: number }
  formMethods: ReturnType<typeof useForm<EditContractorPaymentFormValues>>
  isModalOpen: boolean
  onCloseModal: () => void
  onEditContractor: (contractorUuid: string) => void
  onEditContractorSubmit: (data: EditContractorPaymentFormValues) => void
}

/** @internal */
export function usePaymentAmountsEditor({
  contractors,
  allowedPaymentMethods,
  onEditOpen,
  onEditSave,
}: UsePaymentAmountsEditorParams): UsePaymentAmountsEditorReturn {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const initialContractorPayments: (ContractorPayments & { isTouched: boolean })[] = useMemo(
    () =>
      contractors.map(contractor => ({
        contractorUuid: contractor.uuid,
        paymentMethod: contractor.paymentMethod ?? 'Direct Deposit',
        wage: '0',
        hours: '0',
        bonus: '0',
        reimbursement: '0',
        isTouched: false,
      })),
    [contractors],
  )

  const [virtualContractorPayments, setVirtualContractorPayments] =
    useState(initialContractorPayments)

  const totals = useMemo(
    () =>
      virtualContractorPayments.reduce(
        (acc, payment) => {
          const contractor = contractors.find(c => c.uuid === payment.contractorUuid)
          const isHourly = contractor?.wageType === 'Hourly'
          const hours = Number(payment.hours || '0')
          const wage = Number(payment.wage || '0')
          const bonus = Number(payment.bonus || '0')
          const reimbursement = Number(payment.reimbursement || '0')
          const hourlyAmount = isHourly ? hours * Number(contractor.hourlyRate || '0') : 0
          const fixedWage = isHourly ? 0 : wage

          return {
            wage: acc.wage + fixedWage,
            bonus: acc.bonus + bonus,
            reimbursement: acc.reimbursement + reimbursement,
            total: acc.total + hourlyAmount + fixedWage + bonus + reimbursement,
          }
        },
        { wage: 0, bonus: 0, reimbursement: 0, total: 0 },
      ),
    [virtualContractorPayments, contractors],
  )

  const formMethods = useForm<EditContractorPaymentFormValues>({
    resolver: zodResolver(createEditContractorPaymentFormSchema()),
    defaultValues: {
      wageType: 'Hourly',
      hours: 0,
      wage: 0,
      bonus: 0,
      reimbursement: 0,
      paymentMethod: 'Direct Deposit',
      hourlyRate: 0,
      contractorUuid: '',
      contractorPaymentMethod: undefined,
    },
  })

  const onCloseModal = () => {
    setIsModalOpen(false)
  }

  const onEditContractor = (contractorUuid: string) => {
    const contractor = contractors.find(c => c.uuid === contractorUuid)
    const contractorPayment = virtualContractorPayments.find(
      p => p.contractorUuid === contractorUuid,
    )

    const rawPaymentMethod = contractorPayment?.paymentMethod || 'Direct Deposit'
    const sanitizedPaymentMethod = allowedPaymentMethods.includes(rawPaymentMethod)
      ? rawPaymentMethod
      : (allowedPaymentMethods[0] ?? 'Check')

    formMethods.reset(
      {
        wageType: contractor?.wageType || 'Hourly',
        hours: Number(contractorPayment?.hours || '0'),
        wage: Number(contractorPayment?.wage || '0'),
        bonus: Number(contractorPayment?.bonus || '0'),
        reimbursement: Number(contractorPayment?.reimbursement || '0'),
        paymentMethod: sanitizedPaymentMethod,
        hourlyRate: Number(contractor?.hourlyRate || '0'),
        contractorUuid: contractorUuid,
        contractorPaymentMethod: contractor?.paymentMethod ?? undefined,
      },
      { keepDirty: false, keepValues: false },
    )
    setIsModalOpen(true)
    onEditOpen?.()
  }

  const onEditContractorSubmit = (data: EditContractorPaymentFormValues) => {
    if (!allowedPaymentMethods.includes(data.paymentMethod)) {
      formMethods.setError('paymentMethod', {
        type: 'manual',
        message: 'unsupportedPaymentMethod',
      })
      return
    }

    const hasAnyPayment =
      (data.wage ?? 0) > 0 ||
      (data.hours ?? 0) > 0 ||
      (data.bonus ?? 0) > 0 ||
      (data.reimbursement ?? 0) > 0

    setVirtualContractorPayments(prev =>
      prev.map(payment =>
        payment.contractorUuid === data.contractorUuid
          ? {
              contractorUuid: payment.contractorUuid,
              wage: String(data.wage ?? 0),
              hours: String(data.hours ?? 0),
              bonus: String(data.bonus ?? 0),
              reimbursement: String(data.reimbursement ?? 0),
              paymentMethod: data.paymentMethod,
              isTouched: hasAnyPayment,
            }
          : payment,
      ),
    )

    setIsModalOpen(false)
    onEditSave?.(data)
  }

  return {
    virtualContractorPayments,
    totals,
    formMethods,
    isModalOpen,
    onCloseModal,
    onEditContractor,
    onEditContractorSubmit,
  }
}
