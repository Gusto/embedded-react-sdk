import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useEmployeeTaxSetupGetFederalTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetFederalTaxes'
import { useEmployeeTaxSetupUpdateFederalTaxesMutation } from '@gusto/embedded-api/react-query/employeeTaxSetupUpdateFederalTaxes'
import { useTranslation } from 'react-i18next'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlow'
import {
  FederalTaxesProvider,
  type FederalTaxFormInputs,
  FederalTaxFormSchema,
} from './useFederalTaxes'
import { Form } from './Form'
import { Actions } from './Actions'
import { Head } from './Head'
import { Form as HtmlForm } from '@/components/Common/Form'
import { useI18n } from '@/i18n'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { Flex } from '@/components/Common'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n'
import { useFlow } from '@/components/Flow/useFlow'

interface FederalTaxesProps extends CommonComponentInterface<'Employee.Taxes'> {
  employeeId: string
  isAdmin?: boolean
}

export function FederalTaxes(props: FederalTaxesProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ employeeId, children, className, isAdmin, dictionary }: FederalTaxesProps) {
  useI18n('Employee.Taxes')
  useComponentDictionary('Employee.Taxes', dictionary)
  const { onEvent, baseSubmitHandler } = useBase()

  const { data } = useEmployeeTaxSetupGetFederalTaxesSuspense({
    employeeUuid: employeeId,
  })
  const employeeFederalTax = data.employeeFederalTax!

  const { mutateAsync: updateFederalTaxes, isPending } =
    useEmployeeTaxSetupUpdateFederalTaxesMutation()

  const formMethods = useForm<FederalTaxFormInputs>({
    resolver: zodResolver(FederalTaxFormSchema),
    defaultValues: {
      filingStatus: employeeFederalTax.filingStatus || '',
      twoJobs: employeeFederalTax.twoJobs ? 'true' : 'false',
      dependentsAmount: employeeFederalTax.dependentsAmount
        ? Number(employeeFederalTax.dependentsAmount)
        : 0,
      otherIncome: employeeFederalTax.otherIncome ? Number(employeeFederalTax.otherIncome) : 0,
      deductions: employeeFederalTax.deductions ? Number(employeeFederalTax.deductions) : 0,
      extraWithholding: employeeFederalTax.extraWithholding
        ? Number(employeeFederalTax.extraWithholding)
        : 0,
      w4DataType: employeeFederalTax.w4DataType,
    },
  })

  const handleSubmit = async (data: FederalTaxFormInputs) => {
    await baseSubmitHandler(data, async payload => {
      const federalTaxesResponse = await updateFederalTaxes({
        request: {
          employeeUuid: employeeId,
          requestBody: {
            filingStatus: payload.filingStatus,
            twoJobs: payload.twoJobs === 'true',
            dependentsAmount: String(payload.dependentsAmount),
            otherIncome: String(payload.otherIncome),
            deductions: String(payload.deductions),
            extraWithholding: String(payload.extraWithholding),
            w4DataType: payload.w4DataType,
            version: employeeFederalTax.version,
          },
        },
      })

      onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED, federalTaxesResponse)
      onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE)
    })
  }

  return (
    <section className={className}>
      <FederalTaxesProvider
        value={{
          employeeFederalTax,
          isPending,
          isAdmin,
        }}
      >
        <FormProvider {...formMethods}>
          <HtmlForm onSubmit={formMethods.handleSubmit(handleSubmit)}>
            <Flex flexDirection="column" gap={32}>
              {children ? (
                children
              ) : (
                <>
                  <Head />
                  <Form />
                  <Actions />
                </>
              )}
            </Flex>
          </HtmlForm>
        </FormProvider>
      </FederalTaxesProvider>
    </section>
  )
}

export const FederalTaxesContextual = () => {
  const { employeeId, onEvent, isAdmin } = useFlow<OnboardingContextInterface>()
  const { t } = useTranslation()
  if (!employeeId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'EmployeeFederalTaxes',
        param: 'employeeId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <FederalTaxes employeeId={employeeId} onEvent={onEvent} isAdmin={isAdmin ?? false} />
}
