import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorPaymentGroupsCreateMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsCreate'
import type { ContractorPayments } from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import { useMemo, useState } from 'react'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { CreatePaymentPresentation } from './CreatePaymentPresentation'
import { useComponentDictionary } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'

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

  const virtualContractorPayments: ContractorPayments[] = contractors.map(contractor => ({
    contractorUuid: contractor.uuid,
    paymentMethod: contractor.paymentMethod || 'Direct Deposit',
    wage: 0,
    hours: 0,
    bonus: 0,
    reimbursement: 0,
  }))

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
  const onEditContractor = () => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_EDIT)
  }

  return (
    <CreatePaymentPresentation
      contractors={contractors}
      contractorPayments={virtualContractorPayments}
      paymentDate={paymentDate}
      onPaymentDateChange={setPaymentDate}
      onSaveAndContinue={onSaveAndContinue}
      onEditContractor={onEditContractor}
      totals={totals}
    />
  )
}
