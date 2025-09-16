import { usePayrollsSubmitMutation } from '@gusto/embedded-api/react-query/payrollsSubmit'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { useTranslation } from 'react-i18next'
import { useBankAccountsGetSuspense } from '@gusto/embedded-api/react-query/bankAccountsGet'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { PayrollOverviewPresentation } from './PayrollOverviewPresentation'
import { componentEvents } from '@/shared/constants'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary, useI18n } from '@/i18n'

interface PayrollOverviewProps extends BaseComponentInterface<'Payroll.PayrollOverview'> {
  companyId: string
  payrollId: string
}

export function PayrollOverview(props: PayrollOverviewProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ companyId, payrollId, dictionary, onEvent }: PayrollOverviewProps) => {
  useComponentDictionary('Payroll.PayrollOverview', dictionary)
  useI18n('Payroll.PayrollOverview')
  const { t } = useTranslation('Payroll.PayrollOverview')

  const { data } = usePayrollsGetSuspense({
    companyId,
    payrollId: payrollId || '4f0ff388-a07b-4dab-97b3-2b98b570a4fa',
    include: ['taxes', 'benefits', 'deductions'],
  })
  const payrollData = data.payrollShow!

  const { data: bankAccountData } = useBankAccountsGetSuspense({
    companyId,
  })
  const bankAccount = bankAccountData.companyBankAccounts?.[0]

  const { data: employeeData } = useEmployeesListSuspense({
    companyId,
  })

  const { mutateAsync } = usePayrollsSubmitMutation()

  if (!payrollData.calculatedAt) {
    throw new Error(t('alerts.payrollNotCalculated'))
  }

  const onEdit = () => {
    onEvent(componentEvents.RUN_PAYROLL_EDITED)
  }
  const onSubmit = async () => {
    const result = await mutateAsync({
      request: {
        companyId,
        payrollId,
        requestBody: {
          submissionBlockers: [],
        },
      },
    })
    onEvent(componentEvents.RUN_PAYROLL_SUBMITTED, result)
  }
  return (
    <PayrollOverviewPresentation
      onEdit={onEdit}
      onSubmit={onSubmit}
      payrollData={payrollData}
      bankAccount={bankAccount}
      employeeDetails={employeeData.showEmployees || []}
    />
  )
}
