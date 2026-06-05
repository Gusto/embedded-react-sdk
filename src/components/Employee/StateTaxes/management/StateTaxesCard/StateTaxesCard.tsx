import { useTranslation } from 'react-i18next'
import type { EmployeeStateTaxQuestion } from '@gusto/embedded-api-v-2025-11-15/models/components/employeestatetaxquestion'
import { useStateTaxesSummary } from '../../shared/useStateTaxesSummary'
import { Flex } from '@/components/Common/Flex/Flex'
import { Loading } from '@/components/Common'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

export interface StateTaxesCardProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone "State taxes" card. Owns its own data fetch via
 * `useStateTaxesSummary` and emits
 * `EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED` when the Edit
 * button is clicked. The Edit button is hidden when no state on
 * record has any tax-withholding questions (e.g. WA), matching the
 * product rule that a state with no income tax has nothing to edit.
 */
export function StateTaxesCard(props: StateTaxesCardProps) {
  return (
    <BaseBoundaries componentName="Employee.Management.StateTaxes">
      <StateTaxesCardContent {...props} />
    </BaseBoundaries>
  )
}

function StateTaxesCardContent({ employeeId, onEvent }: StateTaxesCardProps) {
  useI18n('Employee.Management.StateTaxes')
  const { t } = useTranslation('Employee.Management.StateTaxes')
  const { t: tCommon } = useTranslation('common')
  const Components = useComponentContext()
  const formatCurrency = useNumberFormatter('currency')

  const summary = useStateTaxesSummary({ employeeId })
  const isLoading = summary.isLoading
  const stateTaxes = summary.isLoading ? [] : summary.data.employeeStateTaxesList

  const stateTaxesHaveAnyQuestions = stateTaxes.some(s => (s.questions?.length ?? 0) > 0)

  const formatStateTaxAnswer = (
    question: EmployeeStateTaxQuestion,
    answer: string | number | boolean,
  ) => {
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

    if (typeof answer === 'number') {
      if (question.inputQuestionFormat.type === 'Currency') {
        return formatCurrency(answer)
      }
      return answer
    }

    if (typeof answer === 'string' && !isNaN(parseFloat(answer))) {
      const numValue = parseFloat(answer)
      if (question.inputQuestionFormat.type === 'Currency') {
        return formatCurrency(numValue)
      }
      return answer
    }

    if (typeof answer === 'boolean') {
      return answer ? t('card.yes') : t('card.no')
    }

    return answer
  }

  const emptyPlaceholder = <span aria-label={t('card.listEmptyPlaceholder')}>–</span>

  const handleEdit = () => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED, { employeeId })
  }

  return (
    <BaseLayout error={summary.errorHandling.errors}>
      <Components.Box
        header={
          <Components.BoxHeader
            title={t('card.title')}
            action={
              isLoading || stateTaxesHaveAnyQuestions ? (
                <Components.Button variant="secondary" onClick={handleEdit} isDisabled={isLoading}>
                  {t('card.editCta')}
                </Components.Button>
              ) : undefined
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {isLoading ? (
            <Loading />
          ) : stateTaxes.length > 0 ? (
            <Flex flexDirection="column" gap={24}>
              {stateTaxes.map((stateTax, index) => {
                const stateName = stateTax.state
                  ? tCommon(`statesHash.${stateTax.state}`, stateTax.state)
                  : ''
                const hasQuestions = (stateTax.questions?.length ?? 0) > 0
                return (
                  <Flex key={stateTax.state ?? index} flexDirection="column" gap={16}>
                    {stateName ? (
                      <Components.Heading as="h4">{stateName}</Components.Heading>
                    ) : null}

                    {hasQuestions ? (
                      <Components.DescriptionList
                        items={stateTax.questions!.map(question => {
                          const answer = question.answers[0]?.value
                          return {
                            term: question.label,
                            description:
                              answer === null || answer === undefined
                                ? emptyPlaceholder
                                : formatStateTaxAnswer(question, answer),
                          }
                        })}
                      />
                    ) : (
                      <Components.Text variant="supporting">
                        {t('card.noWithholdingForState')}
                      </Components.Text>
                    )}
                  </Flex>
                )
              })}
            </Flex>
          ) : (
            <Components.Text>{t('card.noStateTaxes')}</Components.Text>
          )}
        </Flex>
      </Components.Box>
    </BaseLayout>
  )
}
