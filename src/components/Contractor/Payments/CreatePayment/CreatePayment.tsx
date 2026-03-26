import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorPaymentGroupsCreateMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsCreate'
import type {
  ContractorPayments,
  PostV1CompaniesCompanyIdContractorPaymentGroupsRequestBody,
  SubmissionBlockers,
} from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import { useContractorPaymentGroupsPreviewMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsPreview'
import { useEffect, useMemo, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { ContractorPaymentGroupPreview } from '@gusto/embedded-api/models/components/contractorpaymentgrouppreview'
import { useBankAccountsGet } from '@gusto/embedded-api/react-query/bankAccountsGet'
import { usePaymentConfigsGet } from '@gusto/embedded-api/react-query/paymentConfigsGet'
import type { InternalAlert } from '../types'
import { CreatePaymentPresentation } from './CreatePaymentPresentation'
import { EditContractorPaymentPresentation } from './EditContractorPaymentPresentation'
import {
  createEditContractorPaymentFormSchema,
  type EditContractorPaymentFormValues,
} from './EditContractorPaymentFormSchema'
import { PreviewPresentation } from './PreviewPresentation'
import {
  payrollSubmitHandler,
  type ApiPayrollBlocker,
} from '@/components/Payroll/PayrollBlocker/payrollHelpers'
import { useComponentDictionary } from '@/i18n'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'

interface CreatePaymentProps extends BaseComponentInterface<'Contractor.Payments.CreatePayment'> {
  companyId: string
}

export function CreatePayment(props: CreatePaymentProps) {
  return (
    <BaseComponent {...props} componentName="Contractor.Payments.CreatePayment">
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ companyId, dictionary, onEvent }: CreatePaymentProps) => {
  useComponentDictionary('Contractor.Payments.CreatePayment', dictionary)
  const { t } = useTranslation('Contractor.Payments.CreatePayment')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { baseSubmitHandler } = useBase()
  const [alerts, setAlerts] = useState<Record<string, InternalAlert>>({})
  const [previewData, setPreviewData] = useState<ContractorPaymentGroupPreview | null>(null)
  const [payrollBlockers, setPayrollBlockers] = useState<ApiPayrollBlocker[]>([])
  const [selectedUnblockOptions, setSelectedUnblockOptions] = useState<Record<string, string>>({})

  const { mutateAsync: createContractorPaymentGroup, isPending: isCreatingContractorPaymentGroup } =
    useContractorPaymentGroupsCreateMutation()
  const {
    mutateAsync: previewContractorPaymentGroup,
    isPending: isPreviewingContractorPaymentGroup,
  } = useContractorPaymentGroupsPreviewMutation()

  const { data: contractorList } = useContractorsListSuspense({ companyUuid: companyId })
  const contractors = (contractorList.contractors || []).filter(
    contractor =>
      contractor.isActive &&
      contractor.onboardingStatus === ContractorOnboardingStatus.ONBOARDING_COMPLETED,
  )
  const { data: bankAccounts } = useBankAccountsGet({ companyId })
  const { data: paymentConfigs } = usePaymentConfigsGet({ companyUuid: companyId })
  const bankAccount = bankAccounts?.companyBankAccounts?.[0]
  const paymentSpeed = paymentConfigs?.paymentConfigs?.paymentSpeed

  const calculateInitialPaymentDate = (speed: string | undefined): string => {
    const today = new Date()
    let daysToAdd = 0

    if (speed === '1-day') {
      daysToAdd = 1
    } else if (speed === '2-day') {
      daysToAdd = 2
    } else if (speed === '4-day') {
      daysToAdd = 4
    }

    today.setDate(today.getDate() + daysToAdd)
    return today.toISOString().split('T')[0] || ''
  }

  const [paymentDate, setPaymentDate] = useState(calculateInitialPaymentDate(paymentSpeed))
  const hasInitializedPaymentDateRef = useRef(false)

  useEffect(() => {
    if (paymentSpeed && !hasInitializedPaymentDateRef.current) {
      setPaymentDate(calculateInitialPaymentDate(paymentSpeed))
      hasInitializedPaymentDateRef.current = true
    }
  }, [paymentSpeed])

  const initialContractorPayments: (ContractorPayments & { isTouched: boolean })[] = useMemo(
    () =>
      contractors.map(contractor => {
        const paymentMethod = contractor.paymentMethod ? contractor.paymentMethod : 'Direct Deposit'

        return {
          contractorUuid: contractor.uuid,
          paymentMethod,
          wage: '0',
          hours: '0',
          bonus: '0',
          reimbursement: '0',
          isTouched: false,
        }
      }),
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
        contractorPayments: contractorPayments.map(({ isTouched, ...rest }) => rest),
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

    const rawPaymentMethod = contractorPayment?.paymentMethod || 'Direct Deposit'
    const sanitizedPaymentMethod = ['Check', 'Direct Deposit'].includes(rawPaymentMethod)
      ? (rawPaymentMethod as 'Check' | 'Direct Deposit')
      : 'Check'

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
        contractorPaymentMethod: contractor?.paymentMethod || undefined,
      },
      { keepDirty: false, keepValues: false },
    )
    setAlerts({})
    setIsModalOpen(true)
    onEvent(componentEvents.CONTRACTOR_PAYMENT_EDIT)
  }

  const onEditContractorSubmit = (data: EditContractorPaymentFormValues) => {
    const currentContractor = contractors.find(c => c.uuid === data.contractorUuid)
    const currentContractorPaymentMethod = currentContractor?.paymentMethod

    if (!['Check', 'Direct Deposit'].includes(data.paymentMethod)) {
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

    setVirtualContractorPayments(prevPayments =>
      prevPayments.map(payment =>
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
    const displayContractor = contractors.find(
      contractor => contractor.uuid === data.contractorUuid,
    )
    const displayName = DOMPurify.sanitize(
      displayContractor?.type === 'Individual'
        ? firstLastName({
            first_name: displayContractor.firstName,
            last_name: displayContractor.lastName,
          })
        : displayContractor?.businessName || '',
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
      setPayrollBlockers([])

      const result = await payrollSubmitHandler(async () => {
        const response = await previewContractorPaymentGroup({
          request: {
            companyId,
            requestBody: {
              contractorPayments: contractorPayments.map(({ isTouched, ...rest }) => rest),
              checkDate: new RFCDate(paymentDate),
            },
          },
        })
        setPreviewData(response.contractorPaymentGroupPreview || null)
        onEvent(componentEvents.CONTRACTOR_PAYMENT_PREVIEW, response.contractorPaymentGroupPreview)
      })

      if (!result.success && result.blockers.length > 0) {
        setPayrollBlockers(result.blockers)
      }
    })
  }
  const onBackToEdit = () => {
    setPreviewData(null)
    setPayrollBlockers([])
    setSelectedUnblockOptions({})
    onEvent(componentEvents.CONTRACTOR_PAYMENT_BACK_TO_EDIT)
  }
  const onViewBlockers = () => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_RFI_RESPOND)
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
          paymentSpeed={paymentSpeed}
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
          payrollBlockers={payrollBlockers}
          onViewBlockers={onViewBlockers}
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
        contractorPaymentMethod={
          contractors.find(c => c.uuid === formMethods.getValues('contractorUuid'))
            ?.paymentMethod ?? undefined
        }
      />
    </>
  )
}
