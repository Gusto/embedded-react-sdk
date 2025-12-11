import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorPaymentGroupsCreateMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsCreate'
import type { ContractorPayments } from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import { useMemo, useState } from 'react'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreatePaymentPresentation } from './CreatePaymentPresentation'
import {
  EditContractorPaymentPresentation,
  EditContractorPaymentFormSchema,
  type EditContractorPaymentFormValues,
} from './EditContractorPaymentPresentation'
import { useComponentDictionary } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface CreatePaymentProps extends BaseComponentInterface<'Contractor.Payments.CreatePayment'> {
  companyId: string
}

export function CreatePayment(props: CreatePaymentProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ companyId, dictionary, onEvent, children }: CreatePaymentProps) => {
  useComponentDictionary('Contractor.Payments.CreatePayment', dictionary)
  const { Modal } = useComponentContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0] || '',
  )

  const { mutateAsync: createContractorPaymentGroup } = useContractorPaymentGroupsCreateMutation()

  const { data: contractorList } = useContractorsListSuspense({ companyUuid: companyId })
  const contractors = (contractorList.contractorList || []).filter(
    contractor =>
      contractor.isActive &&
      contractor.onboardingStatus === ContractorOnboardingStatus.ONBOARDING_COMPLETED,
  )
  const initialContractorPayments: ContractorPayments[] = useMemo(
    () =>
      contractors.map(contractor => ({
        contractorUuid: contractor.uuid,
        paymentMethod: contractor.paymentMethod || 'Direct Deposit',
        wage: 0,
        hours: 0,
        bonus: 0,
        reimbursement: 0,
      })),
    [contractors],
  )
  const [virtualContractorPayments, setVirtualContractorPayments] =
    useState<ContractorPayments[]>(initialContractorPayments)

  const totals = useMemo(
    () =>
      virtualContractorPayments.reduce<{
        wage: number
        bonus: number
        reimbursement: number
        total: number
      }>(
        (acc, contractor) => {
          return {
            wage: acc.wage + contractor.wage!,
            bonus: acc.bonus + contractor.bonus!,
            reimbursement: acc.reimbursement + contractor.reimbursement!,
            total: acc.total + contractor.wage! + contractor.bonus! + contractor.reimbursement!,
          }
        },
        { wage: 0, bonus: 0, reimbursement: 0, total: 0 },
      ),
    [virtualContractorPayments],
  )

  const formMethods = useForm<EditContractorPaymentFormValues>({
    resolver: zodResolver(EditContractorPaymentFormSchema),
    defaultValues: {
      wageType: 'Hourly',
      hours: 0,
      wage: 0,
      bonus: 0,
      reimbursement: 0,
      paymentMethod: 'Direct Deposit',
      hourlyRate: 0,
      contractorUuid: '',
    },
  })

  const onSaveAndContinue = async () => {
    const response = await createContractorPaymentGroup({
      request: {
        companyId,
        requestBody: {
          checkDate: new RFCDate(paymentDate),
          contractorPayments: virtualContractorPayments,
          creationToken: crypto.randomUUID(),
        },
      },
    })
    onEvent(componentEvents.CONTRACTOR_PAYMENT_REVIEW, response)
  }
  const onEditContractor = (contractorUuid: string) => {
    const contractor = contractors.find(contractor => contractor.uuid === contractorUuid)
    const contractorPayment = virtualContractorPayments.find(
      payment => payment.contractorUuid === contractorUuid,
    )
    formMethods.reset(
      {
        wageType: contractor?.wageType || 'Hourly',
        hours: contractorPayment?.hours || 0,
        wage: contractorPayment?.wage || 0,
        bonus: contractorPayment?.bonus || 0,
        reimbursement: contractorPayment?.reimbursement || 0,
        paymentMethod: contractorPayment?.paymentMethod || 'Direct Deposit',
        hourlyRate: contractor?.hourlyRate ? Number(contractor.hourlyRate) : 0,
        contractorUuid: contractorUuid,
      },
      { keepDirty: false, keepValues: false },
    )
    setIsModalOpen(true)
    onEvent(componentEvents.CONTRACTOR_PAYMENT_EDIT)
  }

  const onEditContractorSubmit = (data: EditContractorPaymentFormValues) => {
    setVirtualContractorPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.contractorUuid === data.contractorUuid
          ? {
              contractorUuid: payment.contractorUuid,
              wage: data.wage,
              hours: data.hours,
              bonus: data.bonus,
              reimbursement: data.reimbursement,
              paymentMethod: data.paymentMethod,
            }
          : payment,
      ),
    )
    setIsModalOpen(false)
    onEvent(componentEvents.CONTRACTOR_PAYMENT_UPDATE, data)
  }

  return (
    <>
      <CreatePaymentPresentation
        contractors={contractors}
        contractorPayments={virtualContractorPayments}
        paymentDate={paymentDate}
        onPaymentDateChange={setPaymentDate}
        onSaveAndContinue={onSaveAndContinue}
        onEditContractor={onEditContractor}
        totals={totals}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
        }}
      >
        <FormProvider {...formMethods}>
          <EditContractorPaymentPresentation
            onSave={formMethods.handleSubmit(onEditContractorSubmit)}
            onCancel={() => {
              setIsModalOpen(false)
            }}
          />
        </FormProvider>
      </Modal>
    </>
  )
}
