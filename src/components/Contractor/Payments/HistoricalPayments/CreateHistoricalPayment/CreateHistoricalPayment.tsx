import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorPaymentGroupsCreateMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsCreate'
import type {
  ContractorPayments,
  PostV1CompaniesCompanyIdContractorPaymentGroupsRequestBody,
} from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import { useContractorPaymentGroupsPreviewMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsPreview'
import { useMemo, useState } from 'react'
import DOMPurify from 'dompurify'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { ContractorPaymentGroupPreview } from '@gusto/embedded-api/models/components/contractorpaymentgrouppreview'
import type { InternalAlert } from '../types'
import { CreateHistoricalPaymentPresentation } from './CreateHistoricalPaymentPresentation'
import { EditHistoricalPaymentPresentation } from './EditHistoricalPaymentPresentation'
import {
  createEditHistoricalPaymentFormSchema,
  type EditHistoricalPaymentFormValues,
} from './EditHistoricalPaymentFormSchema'
import { HistoricalPreviewPresentation } from './HistoricalPreviewPresentation'
import { calculateDefaultHistoricalDate } from './helpers'
import { useComponentDictionary } from '@/i18n'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'

const HISTORICAL_PAYMENT_METHOD = 'Historical Payment'

interface CreateHistoricalPaymentProps extends BaseComponentInterface<'Contractor.Payments.HistoricalPayments.CreateHistoricalPayment'> {
  companyId: string
}

export function CreateHistoricalPayment(props: CreateHistoricalPaymentProps) {
  return (
    <BaseComponent
      {...props}
      componentName="Contractor.Payments.HistoricalPayments.CreateHistoricalPayment"
    >
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ companyId, dictionary, onEvent }: CreateHistoricalPaymentProps) => {
  useComponentDictionary(
    'Contractor.Payments.HistoricalPayments.CreateHistoricalPayment',
    dictionary,
  )
  const { t } = useTranslation('Contractor.Payments.HistoricalPayments.CreateHistoricalPayment')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { baseSubmitHandler } = useBase()
  const [alerts, setAlerts] = useState<Record<string, InternalAlert>>({})
  const [previewData, setPreviewData] = useState<ContractorPaymentGroupPreview | null>(null)

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

  const [paymentDate, setPaymentDate] = useState(calculateDefaultHistoricalDate())

  const initialContractorPayments: (ContractorPayments & { isTouched: boolean })[] = useMemo(
    () =>
      contractors.map(contractor => ({
        contractorUuid: contractor.uuid,
        paymentMethod: HISTORICAL_PAYMENT_METHOD,
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

  const formMethods = useForm<EditHistoricalPaymentFormValues>({
    resolver: zodResolver(createEditHistoricalPaymentFormSchema()),
    defaultValues: {
      wageType: 'Hourly',
      hours: 0,
      wage: 0,
      bonus: 0,
      reimbursement: 0,
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

      const requestBody: PostV1CompaniesCompanyIdContractorPaymentGroupsRequestBody = {
        checkDate: new RFCDate(paymentDate),
        contractorPayments: contractorPayments.map(({ isTouched, ...rest }) => rest),
        creationToken,
      }

      const response = await createContractorPaymentGroup({
        request: {
          companyId,
          requestBody,
        },
      })

      onEvent(
        componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CREATED,
        response.contractorPaymentGroup || {},
      )
    })
  }

  const onEditContractor = (contractorUuid: string) => {
    const contractor = contractors.find(contractor => contractor.uuid === contractorUuid)
    const contractorPayment = virtualContractorPayments.find(
      payment => payment.contractorUuid === contractorUuid,
    )

    formMethods.reset(
      {
        wageType: contractor?.wageType || 'Hourly',
        hours: Number(contractorPayment?.hours || '0'),
        wage: Number(contractorPayment?.wage || '0'),
        bonus: Number(contractorPayment?.bonus || '0'),
        reimbursement: Number(contractorPayment?.reimbursement || '0'),
        hourlyRate: Number(contractor?.hourlyRate || '0'),
        contractorUuid: contractorUuid,
      },
      { keepDirty: false, keepValues: false },
    )
    setAlerts({})
    setIsModalOpen(true)
    onEvent(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_EDIT)
  }

  const onEditContractorSubmit = (data: EditHistoricalPaymentFormValues) => {
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
              paymentMethod: HISTORICAL_PAYMENT_METHOD,
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
    onEvent(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_UPDATE, data)
  }

  const onContinueToPreview = async () => {
    await baseSubmitHandler(null, async () => {
      const today = new Date().toISOString().split('T')[0]
      if (paymentDate >= today!) {
        setAlerts({
          ...alerts,
          error: {
            type: 'error',
            title: t('alerts.dateMustBeInPast'),
          },
        })
        return
      }

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
            contractorPayments: contractorPayments.map(({ isTouched, ...rest }) => rest),
            checkDate: new RFCDate(paymentDate),
          },
        },
      })
      setPreviewData(response.contractorPaymentGroupPreview || null)
      onEvent(
        componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_PREVIEW,
        response.contractorPaymentGroupPreview,
      )
    })
  }

  const onBackToEdit = () => {
    setPreviewData(null)
    onEvent(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_BACK_TO_EDIT)
  }

  return (
    <>
      {previewData && (
        <HistoricalPreviewPresentation
          contractorPaymentGroup={previewData}
          contractors={contractors}
          onBackToEdit={onBackToEdit}
          onSubmit={onCreatePaymentGroup}
          isLoading={isCreatingContractorPaymentGroup || isPreviewingContractorPaymentGroup}
        />
      )}
      {!previewData && (
        <CreateHistoricalPaymentPresentation
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
      <EditHistoricalPaymentPresentation
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
