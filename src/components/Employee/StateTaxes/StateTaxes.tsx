import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useEmployeeTaxSetupGetStateTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetStateTaxes'
import { useEmployeeTaxSetupUpdateStateTaxesMutation } from '@gusto/embedded-api/react-query/employeeTaxSetupUpdateStateTaxes'
import { useTranslation } from 'react-i18next'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlow'
import {
  StateTaxesProvider,
  type StateTaxFormInputs,
  StateTaxFormSchema,
  type StateTaxFormPayload,
} from './useStateTaxes'
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
import { snakeCaseToCamelCase } from '@/helpers/formattedStrings'
import { useFlow } from '@/components/Flow/useFlow'

const DEFAULT_TAX_VALID_FROM = '2010-01-01'

interface StateTaxesProps extends CommonComponentInterface<'Employee.Taxes'> {
  employeeId: string
  isAdmin?: boolean
}

export function StateTaxes(props: StateTaxesProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ employeeId, children, className, isAdmin, dictionary }: StateTaxesProps) {
  useI18n('Employee.Taxes')
  useComponentDictionary('Employee.Taxes', dictionary)
  const { onEvent, baseSubmitHandler } = useBase()

  const { data: stateData } = useEmployeeTaxSetupGetStateTaxesSuspense({
    employeeUuid: employeeId,
  })
  const employeeStateTaxes = stateData.employeeStateTaxesList!

  const { mutateAsync: updateStateTaxes, isPending } = useEmployeeTaxSetupUpdateStateTaxesMutation()

  // Build default values from existing state tax data
  const defaultValues = {
    states: employeeStateTaxes.reduce((acc: Record<string, Record<string, unknown>>, state) => {
      if (state.state) {
        acc[state.state] =
          state.questions?.reduce((acc: Record<string, unknown>, question) => {
            const value = question.answers[0]?.value
            const key = snakeCaseToCamelCase(question.key)
            // Default new hire report to true if not specified
            if (key === 'fileNewHireReport') {
              acc[key] = typeof value === 'undefined' ? true : value
            } else {
              acc[key] = value
            }
            return acc
          }, {}) || {}
      }
      return acc
    }, {}),
  }

  const formMethods = useForm<StateTaxFormInputs>({
    resolver: zodResolver(StateTaxFormSchema),
    defaultValues,
  })

  const handleSubmit = async (data: StateTaxFormPayload) => {
    await baseSubmitHandler(data, async payload => {
      const { states: statesPayload } = payload

      // Process state taxes if data exists
      if (statesPayload && Object.keys(statesPayload).length > 0) {
        const states = []

        for (const state of employeeStateTaxes) {
          const stateName = state.state

          if (stateName && state.questions !== undefined) {
            states.push({
              state: stateName,
              questions: state.questions
                .map(question => {
                  if (question.isQuestionForAdminOnly && !isAdmin) {
                    return null
                  }
                  const formValue = statesPayload[stateName]?.[snakeCaseToCamelCase(question.key)]
                  return {
                    key: question.key,
                    answers: [
                      {
                        validFrom: question.answers[0]?.validFrom ?? DEFAULT_TAX_VALID_FROM,
                        validUpTo: question.answers[0]?.validUpTo ?? null,
                        value:
                          formValue == null || (typeof formValue === 'number' && isNaN(formValue))
                            ? ''
                            : (formValue as string | number | boolean),
                      },
                    ],
                  }
                })
                .filter(q => q !== null), // Filtering out questions in non-admin setup
            })
          }
        }

        const stateTaxesResponse = await updateStateTaxes({
          request: { employeeUuid: employeeId, employeeStateTaxesRequest: { states } },
        })
        onEvent(componentEvents.EMPLOYEE_STATE_TAXES_UPDATED, stateTaxesResponse)
      }

      onEvent(componentEvents.EMPLOYEE_STATE_TAXES_DONE)
    })
  }

  return (
    <section className={className}>
      <StateTaxesProvider
        value={{
          employeeStateTaxes,
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
      </StateTaxesProvider>
    </section>
  )
}

export const StateTaxesContextual = () => {
  const { employeeId, onEvent, isAdmin } = useFlow<OnboardingContextInterface>()
  const { t } = useTranslation()
  if (!employeeId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'EmployeeStateTaxes',
        param: 'employeeId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <StateTaxes employeeId={employeeId} onEvent={onEvent} isAdmin={isAdmin ?? false} />
}
