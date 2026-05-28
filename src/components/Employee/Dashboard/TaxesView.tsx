import { useTranslation } from 'react-i18next'
import type { GetV1EmployeesEmployeeIdFederalTaxesResponse } from '@gusto/embedded-api-v-2025-11-15/models/operations/getv1employeesemployeeidfederaltaxes'
import type { GetV1EmployeesEmployeeIdStateTaxesResponse } from '@gusto/embedded-api-v-2025-11-15/models/operations/getv1employeesemployeeidstatetaxes'
import type { EmployeeStateTaxQuestion } from '@gusto/embedded-api-v-2025-11-15/models/components/employeestatetaxquestion'
import { useEmployeeTaxes } from './hooks'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Loading } from '@/components/Common'
import { BaseLayout } from '@/components/Base/Base'
import useNumberFormatter from '@/hooks/useNumberFormatter'

type EmployeeFederalTax = NonNullable<
  GetV1EmployeesEmployeeIdFederalTaxesResponse['employeeFederalTax']
>
type EmployeeStateTax = NonNullable<
  GetV1EmployeesEmployeeIdStateTaxesResponse['employeeStateTaxesList']
>[number]

export interface TaxesViewProps {
  federalTaxes?: EmployeeFederalTax
  stateTaxes?: EmployeeStateTax[]
  /** Loads both cards. Override per-card via `isFederalTaxesLoading` /
   *  `isStateTaxesLoading` when the queries resolve independently. */
  isLoading?: boolean
  isFederalTaxesLoading?: boolean
  isStateTaxesLoading?: boolean
  onEditFederalTaxes?: () => void
  onEditStateTaxes?: () => void
}

export interface TaxesViewWithDataProps {
  employeeId: string
  /** Receives the federal-tax record so the parent can preserve the
   *  existing event payload (`{ employeeId, federalTaxes }`). */
  onEditFederalTaxes?: (federalTaxes: EmployeeFederalTax | undefined) => void
  onEditStateTaxes?: () => void
}

/**
 * Tab-mounted container for the Taxes tab. Owns the `useEmployeeTaxes`
 * fetch so federal/state tax requests only fire when the tab is mounted.
 * Federal and state queries run independently — each card paints its
 * own skeleton + content as data arrives.
 */
export function TaxesViewWithData({
  employeeId,
  onEditFederalTaxes,
  onEditStateTaxes,
}: TaxesViewWithDataProps) {
  const taxes = useEmployeeTaxes({ employeeId })

  const federalTaxes = taxes.data.employeeFederalTax
  return (
    <BaseLayout error={taxes.errorHandling.errors}>
      <TaxesView
        federalTaxes={federalTaxes}
        stateTaxes={taxes.data.employeeStateTaxesList}
        isFederalTaxesLoading={taxes.status.isFederalTaxesLoading}
        isStateTaxesLoading={taxes.status.isStateTaxesLoading}
        onEditFederalTaxes={() => onEditFederalTaxes?.(federalTaxes)}
        onEditStateTaxes={onEditStateTaxes}
      />
    </BaseLayout>
  )
}

export function TaxesView({
  federalTaxes,
  stateTaxes,
  isLoading = false,
  isFederalTaxesLoading = isLoading,
  isStateTaxesLoading = isLoading,
  onEditFederalTaxes,
  onEditStateTaxes,
}: TaxesViewProps) {
  const { t } = useTranslation('Employee.Dashboard')
  const { t: tCommon } = useTranslation('common')
  const Components = useComponentContext()
  const formatCurrency = useNumberFormatter('currency')

  const stateTaxesHaveAnyQuestions = !!stateTaxes?.some(s => (s.questions?.length ?? 0) > 0)

  // Helper function to format state tax answer values
  const formatStateTaxAnswer = (
    question: EmployeeStateTaxQuestion,
    answer: string | number | boolean,
  ) => {
    // For Select type questions, look up the label from options
    if (
      question.inputQuestionFormat.type === 'Select' &&
      question.inputQuestionFormat.options &&
      question.inputQuestionFormat.options.length > 0
    ) {
      const option = question.inputQuestionFormat.options.find(opt => opt.value === answer)
      if (option?.label) {
        return option.label
      }
    }

    // For numeric values, only format as currency for Currency questions
    if (typeof answer === 'number') {
      if (question.inputQuestionFormat.type === 'Currency') {
        return formatCurrency(answer)
      }
      return answer
    }

    // For string currency values (like "0.0")
    if (typeof answer === 'string' && !isNaN(parseFloat(answer))) {
      const numValue = parseFloat(answer)
      // Check if this looks like a currency (has decimal point or question type is Currency)
      if (question.inputQuestionFormat.type === 'Currency') {
        return formatCurrency(numValue)
      }
      // For non-currency numeric strings, return as-is
      return answer
    }

    // For boolean values
    if (typeof answer === 'boolean') {
      return answer ? t('common.yes') : t('common.no')
    }

    // Default: return string value as-is
    return answer
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <Components.Box
        header={
          <Components.BoxHeader
            title={t('taxes.federal.title')}
            action={
              <Components.Button
                variant="secondary"
                onClick={onEditFederalTaxes}
                isDisabled={isFederalTaxesLoading}
              >
                {t('taxes.federal.editCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {isFederalTaxesLoading ? (
            <Loading />
          ) : federalTaxes ? (
            <Flex flexDirection="column" gap={12}>
              {federalTaxes.filingStatus && (
                <Flex flexDirection="column" gap={0}>
                  <Components.Text variant="supporting">
                    {t('taxes.federal.filingStatus')}
                  </Components.Text>
                  <Components.Text>{federalTaxes.filingStatus}</Components.Text>
                </Flex>
              )}

              {'twoJobs' in federalTaxes && federalTaxes.twoJobs !== null && (
                <Flex flexDirection="column" gap={0}>
                  <Components.Text variant="supporting">
                    {t('taxes.federal.multipleJobs')}
                  </Components.Text>
                  <Components.Text>
                    {federalTaxes.twoJobs ? t('common.yes') : t('common.no')}
                  </Components.Text>
                </Flex>
              )}

              {'dependentsAmount' in federalTaxes && federalTaxes.dependentsAmount && (
                <Flex flexDirection="column" gap={0}>
                  <Components.Text variant="supporting">
                    {t('taxes.federal.dependentsAndOtherCredits')}
                  </Components.Text>
                  <Components.Text>
                    {formatCurrency(parseFloat(federalTaxes.dependentsAmount))}
                  </Components.Text>
                </Flex>
              )}

              {'otherIncome' in federalTaxes && federalTaxes.otherIncome && (
                <Flex flexDirection="column" gap={0}>
                  <Components.Text variant="supporting">
                    {t('taxes.federal.otherIncome')}
                  </Components.Text>
                  <Components.Text>
                    {formatCurrency(parseFloat(federalTaxes.otherIncome))}
                  </Components.Text>
                </Flex>
              )}

              {'deductions' in federalTaxes && federalTaxes.deductions && (
                <Flex flexDirection="column" gap={0}>
                  <Components.Text variant="supporting">
                    {t('taxes.federal.deductions')}
                  </Components.Text>
                  <Components.Text>
                    {formatCurrency(parseFloat(federalTaxes.deductions))}
                  </Components.Text>
                </Flex>
              )}

              {'extraWithholding' in federalTaxes && federalTaxes.extraWithholding && (
                <Flex flexDirection="column" gap={0}>
                  <Components.Text variant="supporting">
                    {t('taxes.federal.extraWithholding')}
                  </Components.Text>
                  <Components.Text>
                    {formatCurrency(parseFloat(federalTaxes.extraWithholding))}
                  </Components.Text>
                </Flex>
              )}
            </Flex>
          ) : null}
        </Flex>
      </Components.Box>

      <Components.Box
        header={
          <Components.BoxHeader
            title={t('taxes.state.title')}
            action={
              isStateTaxesLoading || stateTaxesHaveAnyQuestions ? (
                <Components.Button
                  variant="secondary"
                  onClick={onEditStateTaxes}
                  isDisabled={isStateTaxesLoading}
                >
                  {t('taxes.state.editCta')}
                </Components.Button>
              ) : undefined
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {isStateTaxesLoading ? (
            <Loading />
          ) : stateTaxes && stateTaxes.length > 0 ? (
            <Flex flexDirection="column" gap={24}>
              {stateTaxes.map((stateTax, index) => {
                const stateName = stateTax.state
                  ? tCommon(`statesHash.${stateTax.state}`, stateTax.state)
                  : ''
                const hasQuestions = (stateTax.questions?.length ?? 0) > 0
                return (
                  <Flex key={stateTax.state || index} flexDirection="column" gap={16}>
                    {stateName ? (
                      <Components.Heading as="h4">{stateName}</Components.Heading>
                    ) : null}

                    {hasQuestions ? (
                      <Flex flexDirection="column" gap={12}>
                        {stateTax.questions!.map((question, qIndex) => {
                          const answer = question.answers[0]?.value
                          if (answer === null || answer === undefined) return null

                          return (
                            <Flex key={question.key || qIndex} flexDirection="column" gap={0}>
                              <Components.Text variant="supporting">
                                {question.label}
                              </Components.Text>
                              <Components.Text>
                                {formatStateTaxAnswer(question, answer)}
                              </Components.Text>
                            </Flex>
                          )
                        })}
                      </Flex>
                    ) : (
                      <Components.Text variant="supporting">
                        {t('taxes.state.noWithholdingForState')}
                      </Components.Text>
                    )}
                  </Flex>
                )
              })}
            </Flex>
          ) : (
            <Components.Text>{t('taxes.state.noStateTaxes')}</Components.Text>
          )}
        </Flex>
      </Components.Box>
    </Flex>
  )
}
