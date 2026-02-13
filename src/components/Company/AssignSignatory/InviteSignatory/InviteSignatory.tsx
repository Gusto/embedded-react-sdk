import { FormProvider } from 'react-hook-form'
import classNames from 'classnames'
import { InviteSignatoryForm } from './InviteSignatoryForm'
import { Actions } from './Actions'
import styles from './InviteSignatory.module.scss'
import type { InviteSignatoryDefaultValues } from './useInviteSignatory'
import { InviteSignatoryProvider } from './useInviteSignatory'
import { useCompanyInviteSignatory } from './useCompanyInviteSignatory'
import { Form } from '@/components/Common/Form'
import { useI18n } from '@/i18n'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flex } from '@/components/Common'

interface InviteSignatoryProps extends CommonComponentInterface {
  companyId: string
  defaultValues?: InviteSignatoryDefaultValues
}

export function InviteSignatory(props: InviteSignatoryProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, defaultValues, className, children }: InviteSignatoryProps) {
  useI18n('Company.AssignSignatory')

  const {
    actions: { onSubmit },
    meta: { isPending },
    form: { formMethods },
  } = useCompanyInviteSignatory({ companyId, defaultValues })

  return (
    <section className={classNames(styles.container, className)}>
      <InviteSignatoryProvider
        value={{
          isPending,
        }}
      >
        <FormProvider {...formMethods}>
          <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Flex flexDirection="column" gap={32}>
              {children ? (
                children
              ) : (
                <>
                  <InviteSignatoryForm />
                  <Actions />
                </>
              )}
            </Flex>
          </Form>
        </FormProvider>
      </InviteSignatoryProvider>
    </section>
  )
}
