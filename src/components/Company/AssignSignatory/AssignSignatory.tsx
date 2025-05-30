import { z } from 'zod'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SignatoryForm } from './SignatoryForm'
import { Head } from './Head'
import { AssignSignatorySelection } from './AssignSignatorySelection'
import type { AssignSignatoryDefaultValues } from './useAssignSignatory'
import { AssignSignatoryProvider, SignatoryAssignmentMode } from './useAssignSignatory'
import { companyEvents } from '@/shared/constants'
import { Flex } from '@/components/Common'
import { useBase, BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useI18n, useComponentDictionary } from '@/i18n'

interface AssignSignatoryProps extends BaseComponentInterface<'Company.AssignSignatory'> {
  companyId: string
  signatoryId?: string
  defaultValues?: AssignSignatoryDefaultValues
}

export function AssignSignatory(props: AssignSignatoryProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const AssignSignatorySelectionSchema = z.object({
  signatoryAssignmentMode: z.union([
    z.literal(SignatoryAssignmentMode.createSignatory),
    z.literal(SignatoryAssignmentMode.inviteSignatory),
  ]),
})

type AssignSignatorySelectionInputs = z.infer<typeof AssignSignatorySelectionSchema>

function Root({
  companyId,
  signatoryId,
  defaultValues,
  className,
  children,
  dictionary,
}: AssignSignatoryProps) {
  useI18n('Company.AssignSignatory')
  useComponentDictionary('Company.AssignSignatory', dictionary)

  const { onEvent } = useBase()

  const formMethods = useForm<AssignSignatorySelectionInputs>({
    resolver: zodResolver(AssignSignatorySelectionSchema),
    defaultValues: {
      signatoryAssignmentMode: SignatoryAssignmentMode.createSignatory,
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
