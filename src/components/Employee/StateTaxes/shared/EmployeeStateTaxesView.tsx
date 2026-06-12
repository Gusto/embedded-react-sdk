import { Fragment, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { type useEmployeeStateTaxesForm } from './useEmployeeStateTaxesForm'
import styles from './EmployeeStateTaxesView.module.scss'
import { BaseLayout } from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import type { ResourceDictionary } from '@/types/Helpers'

type ReadyEmployeeStateTaxesForm = Extract<
  ReturnType<typeof useEmployeeStateTaxesForm>,
  { isLoading: false }
>

/**
 * Override surface for {@link EmployeeStateTaxesView}'s default copy. Each
 * consuming flow (onboarding, management) builds a resolved dictionary from
 * its own translation namespace via a dedicated `use*StateTaxesViewDictionary`
 * hook and passes it here, so partner overrides on the flow's namespace flow
 * into the shared view text at render time.
 *
 * The underlying `Employee.StateTaxesView` namespace is an implementation
 * detail of the shared view — consumers shouldn't reference it directly.
 *
 * @internal
 */
export type StateTaxesViewDictionary = ResourceDictionary<'Employee.StateTaxesView'>

/** @internal */
export interface EmployeeStateTaxesViewProps {
  stateTaxes: ReadyEmployeeStateTaxesForm
  onSubmit: () => void | Promise<void>
  actions: ReactNode
  alert?: ReactNode
  className?: string
  /**
   * Per-flow translation override for this shared view. Consumers build the
   * value inside a flow-local `use*StateTaxesViewDictionary` hook that
   * resolves the view's keys against the flow's own namespace, so partner
   * overrides on the flow's `dictionary` prop propagate into the view.
   */
  dictionary?: StateTaxesViewDictionary
}

/** @internal */
export function EmployeeStateTaxesView({
  stateTaxes,
  onSubmit,
  actions,
  alert,
  className,
  dictionary,
}: EmployeeStateTaxesViewProps) {
  useI18n('Employee.StateTaxesView')
  useComponentDictionary('Employee.StateTaxesView', dictionary)

  const { t } = useTranslation('Employee.StateTaxesView')
  const { t: tCommon } = useTranslation('common')
  const Components = useComponentContext()
  const groups = stateTaxes.form.Fields

  return (
    <section className={classNames(styles.container, className)}>
      <BaseLayout error={stateTaxes.errorHandling.errors}>
        <SDKFormProvider formHookResult={stateTaxes}>
          <Form onSubmit={onSubmit}>
            {alert}

            {groups.length === 0 ? (
              <Components.Text>{t('noWithholding')}</Components.Text>
            ) : (
              groups.map(group => {
                const stateName = tCommon(`statesHash.${group.state}`, group.state)
                return (
                  <Fragment key={group.state}>
                    <Components.Heading as="h2">
                      {t('stateTaxesTitle', { state: stateName })}
                    </Components.Heading>

                    {group.questions.map(({ questionId, Field }) => {
                      return <Field key={questionId} />
                    })}
                  </Fragment>
                )
              })
            )}

            {actions}
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}
