import { FormProvider } from 'react-hook-form'
import { useSignEmployeeForm } from '../shared/useSignEmployeeForm'
import { Form as FormFields } from './Form'
import { Head } from './Head'
import { Actions } from './Actions'
import { Preview } from './Preview'
import { SignatureFormProvider } from './useSignatureForm'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { Flex } from '@/components/Common'

interface SignatureFormProps extends CommonComponentInterface {
  employeeId: string
  formId: string
}

export function SignatureForm(props: SignatureFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ employeeId, formId, className, children }: SignatureFormProps) {
  useI18n('Employee.DocumentSigner')
  const { onEvent } = useBase()

  const hookResult = useSignEmployeeForm({ employeeId, formId })

  if (hookResult.isLoading) {
    return null
  }

  const { form, pdfUrl } = hookResult.data
  const { isPending } = hookResult.status
  const { formMethods } = hookResult.form.hookFormInternals

  const handleBack = () => {
    onEvent(componentEvents.CANCEL)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await hookResult.actions.onSubmit()
    if (result) {
      onEvent(componentEvents.EMPLOYEE_SIGN_FORM, result.data)
    }
  }

  return (
    <section className={className}>
      <SignatureFormProvider
        value={{
          pdfUrl,
          handleBack,
          form,
          isPending,
        }}
      >
        <FormProvider {...formMethods}>
          <form onSubmit={handleFormSubmit}>
            <Flex flexDirection="column">
              {children ? (
                children
              ) : (
                <>
                  <Head />
                  <Preview />
                  <FormFields />
                  <Actions />
                </>
              )}
            </Flex>
          </form>
        </FormProvider>
      </SignatureFormProvider>
    </section>
  )
}
