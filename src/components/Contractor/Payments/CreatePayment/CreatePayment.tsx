import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorPaymentGroupsCreateMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsCreate'
import type { ContractorPayments } from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import { useContractorPaymentGroupsPreviewMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsPreview'
import { useMemo, useState } from 'react'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { ContractorPaymentGroupPreview } from '@gusto/embedded-api/models/components/contractorpaymentgrouppreview'
import type { InternalAlert } from '../types'
import { CreatePaymentPresentation } from './CreatePaymentPresentation'
import {
  EditContractorPaymentPresentation,
  EditContractorPaymentFormSchema,
  type EditContractorPaymentFormValues,
} from './EditContractorPaymentPresentation'
import { PreviewPresentation } from './PreviewPresentation'
import { useComponentDictionary } from '@/i18n'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { firstLastName } from '@/helpers/formattedStrings'

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

export const Root = ({ companyId, dictionary, onEvent }: CreatePaymentProps) => {
  useComponentDictionary('Contractor.Payments.CreatePayment', dictionary)
  const { t } = useTranslation('Contractor.Payments.CreatePayment')
  const { Modal } = useComponentContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0] || '',
  )
  const { baseSubmitHandler } = useBase()
  const [alerts, setAlerts] = useState<Record<string, InternalAlert>>({})
  const [previewData, setPreviewData] = useState<ContractorPaymentGroupPreview | null>({
    uuid: null,
    companyUuid: '948d671f-0301-4f84-9cf1-a9ef0911d195',
    checkDate: '2025-12-24',
    debitDate: '2025-12-22',
    status: 'Unfunded',
    creationToken: 'f3f2706a-3ee1-4334-b30f-8f1d72a9967f',
    partnerOwnedDisbursement: null,
    submissionBlockers: [],
    creditBlockers: [],
    contractorPayments: [
      {
        uuid: null,
        contractorUuid: '69ff2cd6-3bd8-48e3-acfe-cfe45b3d5d88',
        bonus: '0.0',
        hours: '12.0',
        hourlyRate: '18.0',
        mayCancel: true,
        paymentMethod: 'Direct Deposit',
        reimbursement: '0.0',
        status: 'Unfunded',
        wage: '0.0',
        wageType: 'Hourly',
        wageTotal: '216.0',
      },
    ],
    totals: {
      amount: '216.00',
      debitAmount: '216.00',
      wageAmount: '216.00',
      reimbursementAmount: '0.00',
      checkAmount: '0.00',
    },
  })

  const { mutateAsync: createContractorPaymentGroup } = useContractorPaymentGroupsCreateMutation()
  const { mutateAsync: previewContractorPaymentGroup } = useContractorPaymentGroupsPreviewMutation()

  const { data: contractorList } = useContractorsListSuspense({ companyUuid: companyId })
  const contractors = (contractorList.contractorList || []).filter(
    contractor =>
      contractor.isActive &&
      contractor.onboardingStatus === ContractorOnboardingStatus.ONBOARDING_COMPLETED,
  )
  const initialContractorPayments: (ContractorPayments & { isTouched: boolean })[] = useMemo(
    () =>
      contractors.map(contractor => ({
        contractorUuid: contractor.uuid,
        paymentMethod: contractor.paymentMethod || 'Direct Deposit',
        wage: 0,
        hours: 0,
        bonus: 0,
        reimbursement: 0,
        isTouched: false,
      })),
    [contractors],
  )
  const [virtualContractorPayments, setVirtualContractorPayments] =
    useState<(ContractorPayments & { isTouched: boolean })[]>(initialContractorPayments)
  //TODO: fix totals - they are not correct
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
    onEvent(componentEvents.CONTRACTOR_PAYMENT_CREATED, response)
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
    setAlerts({})
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
              isTouched: true,
            }
          : payment,
      ),
    )
    const contractor = contractors.find(contractor => contractor.uuid === data.contractorUuid)
    const displayName =
      contractor?.type === 'Individual'
        ? firstLastName({ first_name: contractor.firstName, last_name: contractor.lastName })
        : contractor?.businessName
    setAlerts(prevAlerts => ({
      ...prevAlerts,
      [data.contractorUuid]: {
        type: 'success',
        title: t('alerts.contractorPaymentUpdated', {
          contractorName: displayName,
        }),
        onDismiss: () => {
          setAlerts(prevAlerts => {
            const { [data.contractorUuid]: _, ...rest } = prevAlerts
            return rest
          })
        },
      },
    }))
    setIsModalOpen(false)
    onEvent(componentEvents.CONTRACTOR_PAYMENT_UPDATE, data)
  }

  //TODO: historical payment - check date should be in the past
  const onContinueToPreview = async () => {
    await baseSubmitHandler(null, async () => {
      const contractorPayments = virtualContractorPayments.filter(payment => payment.isTouched)
      if (contractorPayments.length === 0) {
        return
      }
      //TODO: clear alerts
      //TODO: handle errors
      const response = await previewContractorPaymentGroup({
        request: {
          companyId,
          requestBody: {
            contractorPayments: contractorPayments.map(payment => {
              const { isTouched, ...rest } = payment
              return rest
            }),
            checkDate: new RFCDate(paymentDate),
          },
        },
      })
      setAlerts({})
      setPreviewData(response.contractorPaymentGroupPreview || null)
      onEvent(componentEvents.CONTRACTOR_PAYMENT_PREVIEW, response.contractorPaymentGroupPreview)
    })
  }

  return (
    <>
      {previewData && <PreviewPresentation contractorPaymentGroup={previewData} />}
      {!previewData && (
        <CreatePaymentPresentation
          contractors={contractors}
          contractorPayments={virtualContractorPayments}
          paymentDate={paymentDate}
          onPaymentDateChange={setPaymentDate}
          onSaveAndContinue={onContinueToPreview}
          onEditContractor={onEditContractor}
          totals={totals}
          alerts={alerts}
        />
      )}
      {/* TODO: see if moving actions to modal footer is possible */}
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
