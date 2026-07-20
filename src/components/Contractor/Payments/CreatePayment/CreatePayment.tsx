import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorPaymentGroupsCreateMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsCreate'
import type {
  PostV1CompaniesCompanyIdContractorPaymentGroupsRequestBody,
  SubmissionBlockers,
} from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import { useContractorPaymentGroupsPreviewMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsPreview'
import { useEffect, useRef, useState } from 'react'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { useTranslation } from 'react-i18next'
import type { ContractorPaymentGroupPreview } from '@gusto/embedded-api/models/components/contractorpaymentgrouppreview'
import { useBankAccountsGet } from '@gusto/embedded-api/react-query/bankAccountsGet'
import { usePaymentAmountsEditor } from '../shared/usePaymentAmountsEditor'
import type { InternalAlert } from '../types'
import { CreatePaymentPresentation } from './CreatePaymentPresentation'
import { EditContractorPaymentPresentation } from './EditContractorPaymentPresentation'
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
 * Active, fully onboarded contractors are listed for the given company. Hours and bonuses apply to hourly contractors; wages apply to fixed contractors; reimbursements apply to both. The form previews the payment group before final submission and surfaces Fast ACH submission blockers when applicable.
 *
 * Features:
 *
 * - **Payment date selection** — choose the payment date; a notice shows the resulting payment speed.
 * - **Per-contractor editing** — edit hours and bonus (hourly contractors), wage (fixed contractors), and reimbursement (all) in a modal, with a running total.
 * - **Payment method** — choose Check or Direct Deposit per contractor.
 * - **Live totals** — wage, bonus, reimbursement, and overall totals update as amounts change.
 * - **Preview before submit** — review per-contractor amounts, debit amount, debit account, debit date, contractor pay date, and the submission deadline before finalizing.
 * - **Submission blockers** — Fast ACH blockers surface inline with selectable unblock options (wire transfer or slower direct deposit); submission stays disabled until every blocker is resolved.
 *
 * @events
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
  const { baseSubmitHandler } = useBase()
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

  const [alerts, setAlertsState] = useState<Record<string, InternalAlert>>({})
  const setAlert = (key: string, alert: InternalAlert) => {
    setAlertsState(prev => ({ ...prev, [key]: alert }))
  }
  const clearAlerts = () => {
    setAlertsState({})
  }

  const {
    virtualContractorPayments,
    totals,
    formMethods,
    isModalOpen,
    onCloseModal,
    onEditContractor,
    onEditContractorSubmit,
  } = usePaymentAmountsEditor({
    contractors,
    allowedPaymentMethods: ['Check', 'Direct Deposit'],
    onEditOpen: () => {
      clearAlerts()
      onEvent(componentEvents.CONTRACTOR_PAYMENT_EDIT)
    },
    onEditSave: data => {
      const displayContractor = contractors.find(c => c.uuid === data.contractorUuid)
      const displayName =
        displayContractor?.type === 'Individual'
          ? firstLastName({
              first_name: displayContractor.firstName,
              last_name: displayContractor.lastName,
            })
          : (displayContractor?.businessName ?? '')

      setAlert(data.contractorUuid, {
        type: 'success',
        title: t('alerts.contractorPaymentUpdated', { contractorName: displayName }),
        onDismiss: () => {
          setAlertsState(prev => {
            const { [data.contractorUuid]: _, ...rest } = prev
            return rest
          })
        },
      })
      onEvent(componentEvents.CONTRACTOR_PAYMENT_UPDATE, data)
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

  const onContinueToPreview = async () => {
    await baseSubmitHandler(null, async () => {
      const contractorPayments = virtualContractorPayments.filter(payment => payment.isTouched)
      if (contractorPayments.length === 0) {
        setAlert('error', {
          type: 'error',
          title: t('alerts.noContractorPayments'),
        })
        return
      }
      clearAlerts()
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
        onClose={onCloseModal}
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
