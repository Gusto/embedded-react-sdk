import { FormProvider } from 'react-hook-form'
import { SignatoryForm } from './SignatoryForm'
import { Head } from './Head'
import { AssignSignatorySelection } from './AssignSignatorySelection'
import type { AssignSignatoryDefaultValues } from './useAssignSignatory'
import { AssignSignatoryProvider } from './useAssignSignatory'
import { useCompanyAssignSignatory } from './useCompanyAssignSignatory'
import { Flex } from '@/components/Common'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
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

  const {
    data: {
      companyId: resolvedCompanyId,
      signatoryId: resolvedSignatoryId,
      defaultValues: resolvedDefaultValues,
    },
    actions: { onSignatoryAssignmentModeChange, onSignatoryFormEvent },
    form: { formMethods },
  } = useCompanyAssignSignatory({ companyId, signatoryId, defaultValues })

  return (
    <section className={className}>
      <AssignSignatoryProvider
        value={{
          companyId: resolvedCompanyId,
          signatoryId: resolvedSignatoryId,
          defaultValues: resolvedDefaultValues,
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
