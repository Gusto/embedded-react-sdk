import { useTranslation } from 'react-i18next'
import type { GetV1EmployeesEmployeeIdFederalTaxesResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidfederaltaxes'
import type { GetV1EmployeesEmployeeIdStateTaxesResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidstatetaxes'
import type { EmployeeStateTaxQuestion } from '@gusto/embedded-api/models/components/employeestatetaxquestion'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Loading } from '@/components/Common'
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
  isLoading?: boolean
  onEditFederalTaxes?: () => void
  onEditStateTaxes?: (state: string) => void
}

export function TaxesView({
  federalTaxes,
  stateTaxes,
  isLoading = false,
  onEditFederalTaxes,
  onEditStateTaxes,
}: TaxesViewProps) {
  const { t } = useTranslation('Employee.Dashboard')
  const Components = useComponentContext()
  const formatCurrency = useNumberFormatter('currency')

  if (isLoading) {
    return <Loading />
  }

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

    // For currency values
    if (typeof answer === 'number') {
      return formatCurrency(answer)
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
      <Components.Box>
        <Flex flexDirection="column" gap={16}>
          <Flex justifyContent="space-between" alignItems="center">
            <Components.Heading as="h3">{t('taxes.federal.title')}</Components.Heading>
            <Components.Button variant="secondary" onClick={onEditFederalTaxes}>
              {t('taxes.federal.editCta')}
            </Components.Button>
          </Flex>

          {federalTaxes && (
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
          )}
        </Flex>
      </Components.Box>

      <Components.Box>
        <Flex flexDirection="column" gap={16}>
          <Flex justifyContent="space-between" alignItems="center">
            <Components.Heading as="h3">{t('taxes.state.title')}</Components.Heading>
          </Flex>

          {stateTaxes && stateTaxes.length > 0 ? (
            <Flex flexDirection="column" gap={24}>
              {stateTaxes.map((stateTax, index) => (
                <Flex key={stateTax.state || index} flexDirection="column" gap={16}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Components.Heading as="h4">{stateTax.state}</Components.Heading>
                    <Components.Button
                      variant="secondary"
                      onClick={() => onEditStateTaxes?.(stateTax.state || '')}
                    >
                      {t('taxes.state.editCta')}
                    </Components.Button>
                  </Flex>

                  {stateTax.questions && stateTax.questions.length > 0 && (
                    <Flex flexDirection="column" gap={12}>
                      {stateTax.questions.map((question, qIndex) => {
                        const answer = question.answers[0]?.value
                        if (answer === null || answer === undefined) return null

                        return (
                          <Flex key={question.key || qIndex} flexDirection="column" gap={0}>
                            <Components.Text variant="supporting">{question.label}</Components.Text>
                            <Components.Text>
                              {formatStateTaxAnswer(question, answer)}
                            </Components.Text>
                          </Flex>
                        )
                      })}
                    </Flex>
                  )}
                </Flex>
              ))}
            </Flex>
          ) : (
            <Components.Text>{t('taxes.state.noStateTaxes')}</Components.Text>
          )}
        </Flex>
      </Components.Box>
    </Flex>
  )
}
