import * as v from 'valibot'
import { useI18n } from '@/i18n'
import { FormProvider, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base'
import { RequireAtLeastOne } from '@/types/Helpers'
import { Flex } from '@/components/Common'
import { companyEvents } from '@/shared/constants'
import { type CreateSignatoryDefaultValues } from './CreateSignatory'
import { type InviteSignatoryDefaultValues } from './InviteSignatory'
import { SignatoryForm } from './SignatoryForm'
import { Head } from './Head'
import { AssignSignatorySelection } from './AssignSignatorySelection'

type AssignSignatoryDefaultValues = RequireAtLeastOne<{
  create?: CreateSignatoryDefaultValues
  invite?: InviteSignatoryDefaultValues
}>

interface AssignSignatoryProps extends CommonComponentInterface {
  companyId: string
  signatoryId?: string
  defaultValues?: AssignSignatoryDefaultValues
}

type AssignSignatoryContextType = {
  companyId: string
  signatoryId?: string
  defaultValues?: AssignSignatoryDefaultValues
  onSignatoryAssignmentModeChange: (mode: string) => void
  onSignatoryFormEvent: BaseComponentInterface['onEvent']
}

const [useAssignSignatory, AssignSignatoryProvider] =
  createCompoundContext<AssignSignatoryContextType>('AssignSignatoryContext')

export { useAssignSignatory }

export function AssignSignatory(props: AssignSignatoryProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const SignatoryAssignmentMode = {
  create_signatory: 'create_signatory',
  invite_signatory: 'invite_signatory',
} as const

const AssignSignatorySelectionSchema = v.object({
  signatoryAssignmentMode: v.union([
    v.literal(SignatoryAssignmentMode.create_signatory),
    v.literal(SignatoryAssignmentMode.invite_signatory),
  ]),
})

type AssignSignatorySelectionInputs = v.InferInput<typeof AssignSignatorySelectionSchema>

function Root({
  companyId,
  signatoryId,
  defaultValues,
  className,
  children,
}: AssignSignatoryProps) {
  useI18n('Company.AssignSignatory')
  const { onEvent } = useBase()

  const formMethods = useForm<AssignSignatorySelectionInputs>({
    resolver: valibotResolver(AssignSignatorySelectionSchema),
    defaultValues: {
      signatoryAssignmentMode: SignatoryAssignmentMode.create_signatory,
    },
  })

  const onSignatoryAssignmentModeChange = (mode: string) => {
    onEvent(companyEvents.COMPANY_ASSIGN_SIGNATORY_MODE_UPDATED, mode)
  }

  const onSignatoryFormEvent: BaseComponentInterface['onEvent'] = (event, data) => {
    if (event === companyEvents.COMPANY_CREATE_SIGNATORY_DONE) {
      onEvent(companyEvents.COMPANY_ASSIGN_SIGNATORY_DONE)
    } else if (event === companyEvents.COMPANY_INVITE_SIGNATORY_DONE) {
      onEvent(companyEvents.COMPANY_ASSIGN_SIGNATORY_DONE)
    } else {
      onEvent(event, data)
    }
  }

  return (
    <section className={className}>
      <AssignSignatoryProvider
        value={{
          companyId,
          signatoryId,
          defaultValues,
          onSignatoryAssignmentModeChange,
          onSignatoryFormEvent,
        }}
      >
        <Flex flexDirection="column" gap={32}>
          <FormProvider {...formMethods}>
            {children ? (
              children
            ) : (
              <>
                <Head />
                <AssignSignatorySelection />
                <SignatoryForm />
              </>
            )}
          </FormProvider>
        </Flex>
      </AssignSignatoryProvider>
    </section>
  )
}

AssignSignatory.Head = Head
AssignSignatory.Selection = AssignSignatorySelection
AssignSignatory.Form = SignatoryForm
