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

/**
 * Props for {@link AssignSignatory}.
 *
 * @public
 */
export interface AssignSignatoryProps extends BaseComponentInterface<'Company.AssignSignatory'> {
  /** Identifier of the company the signatory is being assigned to. */
  companyId: string
  /**
   * Identifier of an existing signatory. When set and matching the current signatory,
   * the create form pre-populates with their information for editing.
   */
  signatoryId?: string
  /**
   * Default values for the underlying create and invite forms. Provide a `create` object,
   * an `invite` object, or both — see {@link AssignSignatoryDefaultValues}.
   */
  defaultValues?: AssignSignatoryDefaultValues
}

/**
 * Lets a user either create a new signatory with full details or invite someone else to become the signatory.
 *
 * @remarks
 * For more granular control, use `CompanyOnboarding.CreateSignatory` or `CompanyOnboarding.InviteSignatory` directly.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/signatory/assignSignatory/modeUpdated` | The user switched between create and invite modes | The selected mode string (`'createSignatory'` or `'inviteSignatory'`) |
 * | `company/signatory/assignSignatory/done` | The signatory assignment process completed | — |
 * | `company/signatory/created` | A new signatory was created (create mode) | Response from the create signatory API request |
 * | `company/signatory/updated` | An existing signatory was updated (create mode) | Response from the update signatory API request |
 * | `company/signatory/invited` | A signatory invitation was sent (invite mode) | Response from the invite signatory API request |
 *
 * @param props - {@link AssignSignatoryProps}.
 * @returns The rendered signatory assignment surface.
 * @public
 */
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
