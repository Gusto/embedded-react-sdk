import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import styles from './IncludeDeductionsFormEmptyState.module.scss'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  useBase,
} from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { Grid } from '@/components/Common/Grid/Grid'
import { ActionsLayout, Flex } from '@/components/Common'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary } from '@/i18n/I18n'
import CoinsHandsIcon from '@/assets/icons/coins-hand.svg?react'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'

const IncludeDeductionsSchema = z.object({ includeDeductions: z.enum(['Yes', 'No']) })
export type IncludeDeductionsPayload = z.output<typeof IncludeDeductionsSchema>

interface IncludeDeductionsFormProps extends CommonComponentInterface<'Employee.Deductions'> {
  employeeId: string
}

export function IncludeDeductionsFormEmptyState(
  props: IncludeDeductionsFormProps & BaseComponentInterface,
) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ className, children, dictionary }: IncludeDeductionsFormProps) {
  const { onEvent } = useBase()
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()

  useComponentDictionary('Employee.Deductions', dictionary)
  useI18n('Employee.Deductions')

  const formMethods = useForm<IncludeDeductionsPayload>({
    resolver: zodResolver(IncludeDeductionsSchema),
    defaultValues: { includeDeductions: 'No' },
  })

  const handleAdd = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_YES)
  }

  const onSubmit: SubmitHandler<IncludeDeductionsPayload> = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_NO)
  }

  return (
    <section className={className}>
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          {children ? (
            children
          ) : (
            <Grid gridTemplateColumns="1fr">
              <Components.Heading as="h2">{t('pageTitle')}</Components.Heading>
              <Components.Text variant="supporting">
                {t('includeDeductionsDescriptionV2')}
              </Components.Text>
              <Components.Text weight="bold" size="lg">
                {t('includeDeductionsSubtitle')}
              </Components.Text>
              <section className={styles.emptyStateContainer}>
                <Flex flexDirection="column" gap={16} justifyContent="center" alignItems="center">
                  <section className={styles.coinHandsIconContainer}>
                    <CoinsHandsIcon width={36} height={36} />
                  </section>
                  <Components.Text weight="bold">
                    {t('includeDeductionsEmptyState')}
                  </Components.Text>
                  <Components.Button
                    type="button"
                    variant="secondary"
                    onClick={handleAdd}
                    className={styles.addDeductionButton}
                  >
                    <PlusCircleIcon width={24} height={24} className={styles.plusCircleIcon} />
                    {t('addDeductionButtonCta')}
                  </Components.Button>
                </Flex>
              </section>
              <ActionsLayout>
                <Components.Button type="submit">{t('continueCta')}</Components.Button>
              </ActionsLayout>
            </Grid>
          )}
        </Form>
      </FormProvider>
    </section>
  )
}
