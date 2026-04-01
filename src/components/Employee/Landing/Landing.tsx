import { useTranslation } from 'react-i18next'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useCompaniesGetSuspense } from '@gusto/embedded-api/react-query/companiesGet'
import DOMPurify from 'dompurify'
import { useMemo } from 'react'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n/I18n'
import ArrowRightIcon from '@/assets/icons/icon-arrow-right.svg?react'

interface SummaryProps extends CommonComponentInterface<'Employee.Landing'> {
  employeeId: string
  companyId: string
}

export function Landing(props: SummaryProps & BaseComponentInterface) {
  useI18n('Employee.Landing')
  useComponentDictionary('Employee.Landing', props.dictionary)

  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ employeeId, companyId, className }: SummaryProps) => {
  const { onEvent } = useBase()
  const Components = useComponentContext()

  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })
  const sanitizedFirstName = useMemo(() => DOMPurify.sanitize(employee!.firstName), [employee])

  const {
    data: { company },
  } = useCompaniesGetSuspense({ companyId })
  const sanitizedCompanyName = useMemo(() => DOMPurify.sanitize(company?.name ?? ''), [company])

  const { t } = useTranslation('Employee.Landing')

  return (
    <section className={className}>
      <Components.Box
        footer={
          <ActionsLayout>
            <Components.Button
              variant="secondary"
              onClick={() => {
                onEvent(componentEvents.EMPLOYEE_SELF_ONBOARDING_START)
              }}
            >
              {t('getStartedCta')}
              <ArrowRightIcon aria-hidden />
            </Components.Button>
          </ActionsLayout>
        }
      >
        <Flex alignItems="center" flexDirection="column" gap={32}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">
              {t('landingSubtitle', {
                firstName: sanitizedFirstName,
                companyName: sanitizedCompanyName,
                interpolation: { escapeValue: false },
              })}
            </Components.Heading>
            <Components.Text variant="supporting">{t('landingDescription')}</Components.Text>
          </Flex>
          <Flex flexDirection="column" gap={8}>
            <Components.Heading as="h3">{t('stepsSubtitle')}</Components.Heading>
            <Components.UnorderedList
              items={[t('steps.personalInfo'), t('steps.taxInfo'), t('steps.bankInfo')]}
            />
          </Flex>
        </Flex>
      </Components.Box>
    </section>
  )
}
