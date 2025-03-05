import { Form } from 'react-aria-components'
import { FormProvider, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import classNames from 'classnames'
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
import {
  useGetAllSignatories,
  useInviteSignatory as useInviteSignatoryMutation,
  useDeleteSignatory,
} from '@/api/queries/company'
import { Schemas } from '@/types/schema'
import { companyEvents } from '@/shared/constants'
import { RequireAtLeastOne } from '@/types/Helpers'

export const SignatoryAssignmentMode = {
  create_signatory: 'create_signatory',
  invite_signatory: 'invite_signatory',
} as const

export type InviteSignatoryDefaultValues = RequireAtLeastOne<
  Pick<Schemas['Signatory'], 'first_name' | 'last_name' | 'email' | 'title'> & {
    confirm_email: string
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

  const { data: signatories } = useGetAllSignatories(companyId)

  const inviteSignatoryMutation = useInviteSignatoryMutation(companyId)
  const deleteSignatoryMutation = useDeleteSignatory(companyId)

  const inviteSignatoryDefaultValues = {
    first_name: defaultValues?.first_name ?? '',
    last_name: defaultValues?.last_name ?? '',
    email: defaultValues?.email,
    confirm_email: defaultValues?.confirm_email,
    title: defaultValues?.title ?? '',
  }

  const formMethods = useForm<InviteSignatoryInputs>({
    resolver: valibotResolver(InviteSignatorySchema),
    defaultValues: inviteSignatoryDefaultValues,
  })

  const onSubmit = async (data: InviteSignatoryInputs) => {
    await baseSubmitHandler(data, async payload => {
      const { confirm_email, ...signatoryData } = payload
      if (signatories[0]?.uuid) {
        await deleteSignatoryMutation.mutateAsync(signatories[0].uuid)
      }

      const inviteSignatoryResponse = await inviteSignatoryMutation.mutateAsync(signatoryData)

      onEvent(companyEvents.COMPANY_SIGNATORY_INVITED, inviteSignatoryResponse)
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
