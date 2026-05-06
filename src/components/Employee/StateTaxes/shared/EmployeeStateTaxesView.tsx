import { Fragment, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { type useEmployeeStateTaxesForm } from './useEmployeeStateTaxesForm'
import { BaseLayout } from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type ReadyEmployeeStateTaxesForm = Extract<
  ReturnType<typeof useEmployeeStateTaxesForm>,
  { isLoading: false }
>

export interface EmployeeStateTaxesViewProps {
  stateTaxes: ReadyEmployeeStateTaxesForm
  onSubmit: () => void | Promise<void>
  actions: ReactNode
  alert?: ReactNode
  className?: string
  children?: ReactNode
}

export function EmployeeStateTaxesView({
  stateTaxes,
  onSubmit,
  actions,
  alert,
  className,
  children,
}: EmployeeStateTaxesViewProps) {
  const { t } = useTranslation('Employee.StateTaxes')
  const { t: tCommon } = useTranslation('common')
  const Components = useComponentContext()
  const groups = stateTaxes.form.Fields

  return (
    <section className={className}>
      <BaseLayout error={stateTaxes.errorHandling.errors}>
        <SDKFormProvider formHookResult={stateTaxes}>
          <Form onSubmit={onSubmit}>
            {children ?? (
              <>
                {alert}

                {groups.map(group => {
                  const stateName = tCommon(`statesHash.${group.state}`, group.state)
                  return (
                    <Fragment key={group.state}>
                      <Components.Heading as="h2">
                        {t('stateTaxesTitle', { state: stateName })}
                      </Components.Heading>

                      {group.questions.map(({ id, Field }) => (
                        <Field key={id} />
                      ))}
                    </Fragment>
                  )
                })}

                {actions}
              </>
            )}
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}
