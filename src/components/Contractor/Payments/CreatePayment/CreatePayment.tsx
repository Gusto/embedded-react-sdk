import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorPaymentGroupsCreateMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsCreate'
import type {
  ContractorPayments,
  PostV1CompaniesCompanyIdContractorPaymentGroupsRequestBody,
  SubmissionBlockers,
} from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import { useContractorPaymentGroupsPreviewMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsPreview'
import { useMemo, useState } from 'react'
import DOMPurify from 'dompurify'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { ContractorPaymentGroupPreview } from '@gusto/embedded-api/models/components/contractorpaymentgrouppreview'
import { useBankAccountsGet } from '@gusto/embedded-api/react-query/bankAccountsGet'
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0] || '',
  )
  const { baseSubmitHandler } = useBase()
  const [alerts, setAlerts] = useState<Record<string, InternalAlert>>({})
  const [previewData, setPreviewData] = useState<ContractorPaymentGroupPreview | null>(null)
  const [selectedUnblockOptions, setSelectedUnblockOptions] = useState<Record<string, string>>({})

  const { mutateAsync: createContractorPaymentGroup, isPending: isCreatingContractorPaymentGroup } =
    useContractorPaymentGroupsCreateMutation()
  const {
    mutateAsync: previewContractorPaymentGroup,
    isPending: isPreviewingContractorPaymentGroup,
  } = useContractorPaymentGroupsPreviewMutation()

  const { data: contractorList } = useContractorsListSuspense({ companyUuid: companyId })
  const contractors = (contractorList.contractorList || []).filter(
    contractor =>
      contractor.isActive &&
      contractor.onboardingStatus === ContractorOnboardingStatus.ONBOARDING_COMPLETED,
  )
  const { data: bankAccounts } = useBankAccountsGet({ companyId })
  // Currently, we only support a single default bank account per company.
  const bankAccount = bankAccounts?.companyBankAccounts?.[0]

  const initialContractorPayments: (ContractorPayments & { isTouched: boolean })[] = useMemo(
    () =>
      contractors.map(contractor => {
        const paymentMethod = contractor.paymentMethod ? contractor.paymentMethod : 'Direct Deposit'

        return {
          contractorUuid: contractor.uuid,
          paymentMethod,
          wage: 0,
          hours: 0,
          bonus: 0,
          reimbursement: 0,
          isTouched: false,
        }
      }),
    [contractors],
  )
  const [virtualContractorPayments, setVirtualContractorPayments] =
    useState<(ContractorPayments & { isTouched: boolean })[]>(initialContractorPayments)
  const totals = useMemo(
    () =>
      virtualContractorPayments.reduce<{
        wage: number
        bonus: number
        reimbursement: number
        total: number
      }>(
        (acc, payment) => {
          const contractor = contractors.find(c => c.uuid === payment.contractorUuid)
          const isHourly = contractor?.wageType === 'Hourly'
          const hourlyAmount = isHourly
            ? (payment.hours || 0) * Number(contractor.hourlyRate || 0)
            : 0
          const fixedWage = isHourly ? 0 : payment.wage || 0

          return {
            wage: acc.wage + fixedWage,
            bonus: acc.bonus + (payment.bonus || 0),
            reimbursement: acc.reimbursement + (payment.reimbursement || 0),
            total:
              acc.total +
              hourlyAmount +
              fixedWage +
              (payment.bonus || 0) +
              (payment.reimbursement || 0),
          }
        },
        { wage: 0, bonus: 0, reimbursement: 0, total: 0 },
      ),
    [virtualContractorPayments, contractors],
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

  const onCreatePaymentGroup = async () => {
    await baseSubmitHandler(null, async () => {
      const contractorPayments = virtualContractorPayments.filter(payment => payment.isTouched)
      if (contractorPayments.length === 0 || !previewData?.creationToken) {
        return
      }
      const creationToken = previewData.creationToken

      const submissionBlockers: SubmissionBlockers[] = Object.entries(selectedUnblockOptions).map(
        ([blockerType, selectedOption]) => ({
          blockerType,
          selectedOption,
        }),
      )

      const requestBody: PostV1CompaniesCompanyIdContractorPaymentGroupsRequestBody = {
        checkDate: new RFCDate(paymentDate),
        contractorPayments: contractorPayments,
        creationToken,
        ...(submissionBlockers.length > 0 && { submissionBlockers }),
      }

      const response = await createContractorPaymentGroup({
        request: {
          companyId,
          requestBody,
        },
      })

      onEvent(componentEvents.CONTRACTOR_PAYMENT_CREATED, response.contractorPaymentGroup || {})
    })
  }

  const onUnblockOptionChange = (blockerType: string, value: string) => {
    setSelectedUnblockOptions(prev => ({
      ...prev,
      [blockerType]: value,
    }))
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
    const displayName = DOMPurify.sanitize(
      contractor?.type === 'Individual'
        ? firstLastName({ first_name: contractor.firstName, last_name: contractor.lastName })
        : contractor?.businessName || '',
    )
    setAlerts(prevAlerts => ({
      ...prevAlerts,
      [data.contractorUuid]: {
        type: 'success',
        title: t('alerts.contractorPaymentUpdated', {
          contractorName: displayName,
          interpolation: { escapeValue: false },
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

  const onContinueToPreview = async () => {
    await baseSubmitHandler(null, async () => {
      const contractorPayments = virtualContractorPayments.filter(payment => payment.isTouched)
      if (contractorPayments.length === 0) {
        setAlerts({
          ...alerts,
          error: {
            type: 'error',
            title: t('alerts.noContractorPayments'),
          },
        })
        return
      }
      setAlerts({})
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

      setPreviewData(response.contractorPaymentGroupPreview || null)
      onEvent(componentEvents.CONTRACTOR_PAYMENT_PREVIEW, response.contractorPaymentGroupPreview)
    })
  }
  const onBackToEdit = () => {
    setPreviewData(null)
    setSelectedUnblockOptions({})
    onEvent(componentEvents.CONTRACTOR_PAYMENT_BACK_TO_EDIT)
  }

  return (
    <>
      {previewData && (
        <PreviewPresentation
          contractorPaymentGroup={previewData}
          contractors={contractors}
          onBackToEdit={onBackToEdit}
          onSubmit={onCreatePaymentGroup}
          isLoading={isCreatingContractorPaymentGroup || isPreviewingContractorPaymentGroup}
          bankAccount={bankAccount}
          selectedUnblockOptions={selectedUnblockOptions}
          onUnblockOptionChange={onUnblockOptionChange}
        />
      )}
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
          isLoading={isCreatingContractorPaymentGroup || isPreviewingContractorPaymentGroup}
        />
      )}
      <EditContractorPaymentPresentation
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
        }}
        formMethods={formMethods}
        onSubmit={onEditContractorSubmit}
      />
    </>
  )
}
