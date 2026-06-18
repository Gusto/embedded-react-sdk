import { useContractorsListSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorsList'
import { useContractorPaymentGroupsCreateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorPaymentGroupsCreate'
import type {
  ContractorPayments,
  PostV1CompaniesCompanyIdContractorPaymentGroupsRequestBody,
  SubmissionBlockers,
} from '@gusto/embedded-api-v-2025-11-15/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import { useContractorPaymentGroupsPreviewMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorPaymentGroupsPreview'
import { useEffect, useMemo, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import { RFCDate } from '@gusto/embedded-api-v-2025-11-15/types/rfcdate'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { ContractorPaymentGroupPreview } from '@gusto/embedded-api-v-2025-11-15/models/components/contractorpaymentgrouppreview'
import { useBankAccountsGet } from '@gusto/embedded-api-v-2025-11-15/react-query/bankAccountsGet'
import type { InternalAlert } from '../types'
import { CreatePaymentPresentation } from './CreatePaymentPresentation'
import { EditContractorPaymentPresentation } from './EditContractorPaymentPresentation'
import {
  createEditContractorPaymentFormSchema,
  type EditContractorPaymentFormValues,
} from './EditContractorPaymentFormSchema'
import { PreviewPresentation } from './PreviewPresentation'
import { addBusinessDays } from '@/helpers/dateFormatting'
import { useCompanyPaymentSpeed } from '@/hooks/useCompanyPaymentSpeed'
import {
  payrollSubmitHandler,
  type ApiPayrollBlocker,
} from '@/components/Payroll/PayrollBlocker/payrollHelpers'
import { useComponentDictionary } from '@/i18n'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'

function formatLocalDate(date: Date): string {
  return [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function calculateInitialPaymentDate(speedDays: number): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return formatLocalDate(addBusinessDays(today, speedDays))
}

/**
 * Props for {@link CreatePayment}.
 *
 * @public
 */
export interface CreatePaymentProps extends BaseComponentInterface<'Contractor.Payments.CreatePayment'> {
  /** UUID of the company for which to create a contractor payment group. */
  companyId: string
}

/**
 * Form for creating a contractor payment group, including date selection, per-contractor edits, preview, and submission blockers.
 *
 * @remarks
 * Active, fully onboarded contractors are listed for the given company. Hours apply to hourly contractors; wages apply to fixed contractors; bonuses and reimbursements apply to both. The form previews the payment group before final submission and surfaces Fast ACH submission blockers when applicable.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/payments/edit` | The edit modal was opened for a contractor. | — |
 * | `contractor/payments/update` | A contractor's payment values were updated locally. | The updated form values (hours, wage, bonus, reimbursement, payment method, etc.). |
 * | `contractor/payments/preview` | The preview API call succeeded. | The contractor payment group preview response. |
 * | `contractor/payments/backToEdit` | The user returned from preview to continue editing. | — |
 * | `contractor/payments/created` | The payment group was successfully created. | The created contractor payment group response. |
 * | `contractor/payments/rfi/respond` | The user clicked to respond to a payment blocker. | — |
 *
 * @param props - Component props including the company identifier and event handler.
 * @returns The rendered create-payment form, preview, and edit modal.
 * @public
 *
 * @example
 * ```tsx
 * import { ContractorManagement } from '@gusto/embedded-react-sdk'
 *
 * function CreateContractorPayment() {
 *   return (
 *     <ContractorManagement.CreatePayment
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function CreatePayment(props: CreatePaymentProps) {
  return (
    <BaseComponent {...props} componentName="Contractor.Payments.CreatePayment">
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ companyId, dictionary, onEvent }: CreatePaymentProps) => {
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
  const { paymentSpeed, paymentSpeedDays } = useCompanyPaymentSpeed(companyId)
  const bankAccount = bankAccounts?.companyBankAccounts?.[0]

  const [paymentDate, setPaymentDate] = useState(calculateInitialPaymentDate(paymentSpeedDays))
  const hasInitializedPaymentDateRef = useRef(false)

  useEffect(() => {
    if (paymentSpeed && !hasInitializedPaymentDateRef.current) {
      setPaymentDate(calculateInitialPaymentDate(paymentSpeedDays))
      hasInitializedPaymentDateRef.current = true
    }
  }, [paymentSpeed, paymentSpeedDays])

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
          paymentSpeedDays={paymentSpeedDays}
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
