import { Form } from 'react-aria-components'
import { FormProvider, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import classNames from 'classnames'
import { type Signatory } from '@gusto/embedded-api/models/components/signatory'
import { useSignatoriesListSuspense } from '@gusto/embedded-api/react-query/signatoriesList'
import { useSignatoriesInviteMutation } from '@gusto/embedded-api/react-query/signatoriesInvite'
import { useSignatoriesDeleteMutation } from '@gusto/embedded-api/react-query/signatoriesDelete'
import { type InviteSignatoryInputs, InviteSignatorySchema } from './InviteSignatoryForm'
import { InviteSignatoryForm } from './InviteSignatoryForm'
import { Actions } from './Actions'
import styles from './InviteSignatory.module.scss'
import { useI18n } from '@/i18n'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base'
import { Flex } from '@/components/Common'
import { companyEvents } from '@/shared/constants'
import { RequireAtLeastOne } from '@/types/Helpers'

export type InviteSignatoryDefaultValues = RequireAtLeastOne<
  Pick<Signatory, 'firstName' | 'lastName' | 'email' | 'title'> & {
    confirmEmail: string
  }
>

interface InviteSignatoryProps extends CommonComponentInterface {
  companyId: string
  defaultValues?: InviteSignatoryDefaultValues
}

type InviteSignatoryContextType = {
  isPending: boolean
}

const [useInviteSignatory, InviteSignatoryProvider] =
  createCompoundContext<InviteSignatoryContextType>('InviteSignatoryContext')

export { useInviteSignatory }

export function InviteSignatory(props: InviteSignatoryProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, defaultValues, className, children }: InviteSignatoryProps) {
  useI18n('Company.AssignSignatory')
  const { onEvent, baseSubmitHandler } = useBase()

  const {
    data: { signatoryList },
  } = useSignatoriesListSuspense({
    companyUuid: companyId,
  })
  const signatories = signatoryList!

  const inviteSignatoryMutation = useSignatoriesInviteMutation()
  const deleteSignatoryMutation = useSignatoriesDeleteMutation()

  const inviteSignatoryDefaultValues = {
    firstName: defaultValues?.firstName ?? '',
    lastName: defaultValues?.lastName ?? '',
    email: defaultValues?.email,
    confirmEmail: defaultValues?.confirmEmail,
    title: defaultValues?.title ?? '',
  }

  const formMethods = useForm<InviteSignatoryInputs>({
    resolver: valibotResolver(InviteSignatorySchema),
    defaultValues: inviteSignatoryDefaultValues,
  })

  const onSubmit = async (data: InviteSignatoryInputs) => {
    await baseSubmitHandler(data, async payload => {
      const { confirmEmail, ...signatoryData } = payload
      if (signatories[0]?.uuid) {
        await deleteSignatoryMutation.mutateAsync({
          request: {
            companyUuid: companyId,
            signatoryUuid: signatories[0].uuid,
          },
        })
      }

      const inviteSignatoryResponse = await inviteSignatoryMutation.mutateAsync({
        request: {
          companyUuid: companyId,
          requestBody: signatoryData,
        },
      })

      onEvent(companyEvents.COMPANY_SIGNATORY_INVITED, inviteSignatoryResponse.signatory)
      onEvent(companyEvents.COMPANY_INVITE_SIGNATORY_DONE)
    })
  }

  return (
    <section className={classNames(styles.container, className)}>
      <InviteSignatoryProvider
        value={{
          isPending: inviteSignatoryMutation.isPending,
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

InviteSignatory.Form = InviteSignatoryForm
InviteSignatory.Actions = Actions
