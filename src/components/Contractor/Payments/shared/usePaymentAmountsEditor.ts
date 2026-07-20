import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import DOMPurify from 'dompurify'
import type { PostV1CompaniesCompanyIdContractorPaymentGroupsContractorPayments as ContractorPayments } from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import {
  createEditContractorPaymentFormSchema,
  type EditContractorPaymentFormValues,
} from '../CreatePayment/EditContractorPaymentFormSchema'
import type { InternalAlert } from '../types'
import { componentEvents } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'
import type { OnEventType } from '@/components/Base'
import type { EventType } from '@/shared/constants'

/** @internal */
export interface UsePaymentAmountsEditorParams {
  contractors: Contractor[]
  onEvent: OnEventType<EventType, unknown>
  allowedPaymentMethods: Array<'Check' | 'Direct Deposit'>
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
  alerts: Record<string, InternalAlert>
  setAlert: (key: string, alert: InternalAlert) => void
  clearAlerts: () => void
}

/** @internal */
export function usePaymentAmountsEditor({
  contractors,
  onEvent,
  allowedPaymentMethods,
}: UsePaymentAmountsEditorParams): UsePaymentAmountsEditorReturn {
  const { t } = useTranslation('Contractor.Payments.CreatePayment')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [alerts, setAlertsState] = useState<Record<string, InternalAlert>>({})

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

  const setAlert = (key: string, alert: InternalAlert) => {
    setAlertsState(prev => ({ ...prev, [key]: alert }))
  }

  const clearAlerts = () => {
    setAlertsState({})
  }

  const onCloseModal = () => {
    setIsModalOpen(false)
  }

  const onEditContractor = (contractorUuid: string) => {
    const contractor = contractors.find(c => c.uuid === contractorUuid)
    const contractorPayment = virtualContractorPayments.find(
      p => p.contractorUuid === contractorUuid,
    )

    const rawPaymentMethod = contractorPayment?.paymentMethod || 'Direct Deposit'
    const sanitizedPaymentMethod = allowedPaymentMethods.includes(
      rawPaymentMethod as 'Check' | 'Direct Deposit',
    )
      ? (rawPaymentMethod as 'Check' | 'Direct Deposit')
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
    clearAlerts()
    setIsModalOpen(true)
    onEvent(componentEvents.CONTRACTOR_PAYMENT_EDIT)
  }

  const onEditContractorSubmit = (data: EditContractorPaymentFormValues) => {
    const currentContractor = contractors.find(c => c.uuid === data.contractorUuid)
    const currentContractorPaymentMethod = currentContractor?.paymentMethod

    if (!allowedPaymentMethods.includes(data.paymentMethod)) {
      formMethods.setError('paymentMethod', {
        type: 'manual',
        message: t('editContractorPayment.errors.unsupportedPaymentMethod'),
      })
      return
    }

    if (currentContractorPaymentMethod === 'Check' && data.paymentMethod === 'Direct Deposit') {
      formMethods.setError('paymentMethod', {
        type: 'manual',
        message: t('editContractorPayment.errors.directDepositNotAvailable'),
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

    const displayContractor = contractors.find(c => c.uuid === data.contractorUuid)
    const displayName = DOMPurify.sanitize(
      displayContractor?.type === 'Individual'
        ? firstLastName({
            first_name: displayContractor.firstName,
            last_name: displayContractor.lastName,
          })
        : (displayContractor?.businessName ?? ''),
    )

    setAlert(data.contractorUuid, {
      type: 'success',
      title: t('alerts.contractorPaymentUpdated', {
        contractorName: displayName,
        interpolation: { escapeValue: false },
      }),
      onDismiss: () => {
        setAlertsState(prev => {
          const { [data.contractorUuid]: _, ...rest } = prev
          return rest
        })
      },
    })

    setIsModalOpen(false)
    onEvent(componentEvents.CONTRACTOR_PAYMENT_UPDATE, data)
  }

  return {
    virtualContractorPayments,
    totals,
    formMethods,
    isModalOpen,
    onCloseModal,
    onEditContractor,
    onEditContractorSubmit,
    alerts,
    setAlert,
    clearAlerts,
  }
}
