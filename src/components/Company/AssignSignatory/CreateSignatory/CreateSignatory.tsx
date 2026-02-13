import { FormProvider } from 'react-hook-form'
import classNames from 'classnames'
import { CreateSignatoryForm } from './CreateSignatoryForm'
import { Actions } from './Actions'
import styles from './CreateSignatory.module.scss'
import type { CreateSignatoryDefaultValues } from './useCreateSignatory'
import { CreateSignatoryProvider } from './useCreateSignatory'
import { useCompanyCreateSignatory } from './useCompanyCreateSignatory'
import { Form } from '@/components/Common/Form'
import { useI18n } from '@/i18n'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flex } from '@/components/Common'

interface CreateSignatoryProps extends CommonComponentInterface {
  companyId: string
  signatoryId?: string
  defaultValues?: CreateSignatoryDefaultValues
}

export function CreateSignatory(props: CreateSignatoryProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({
  companyId,
  signatoryId,
  defaultValues,
  className,
  children,
}: CreateSignatoryProps) {
  useI18n('Company.AssignSignatory')

  const {
    data: { currentSignatory },
    actions: { onSubmit },
    meta: { isPending },
    form: { formMethods },
  } = useCompanyCreateSignatory({ companyId, signatoryId, defaultValues })

  return (
    <section className={classNames(styles.container, className)}>
      <CreateSignatoryProvider
        value={{
          isPending,
          currentSignatory,
        }}
      >
        <FormProvider {...formMethods}>
          <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Flex flexDirection="column" gap={32}>
              {children ? (
                children
              ) : (
                <>
                  <CreateSignatoryForm />
                  <Actions />
                </>
              )}
            </Flex>
          </Form>
        </FormProvider>
      </CreateSignatoryProvider>
    </section>
  )
}
