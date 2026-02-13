import { Head } from './Head'
import { Preview } from './Preview'
import { Form } from './Form'
import { Actions } from './Actions'
import { SignatureFormProvider } from './useSignatureForm'
import { useCompanySignatureForm } from './useCompanySignatureForm'
import { useI18n, useComponentDictionary } from '@/i18n'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { SignatureForm as SharedSignatureForm } from '@/components/Common/SignatureForm'
import { Flex } from '@/components/Common'

interface SignatureFormProps extends BaseComponentInterface<'Company.SignatureForm'> {
  formId: string
  companyId: string
}

export function SignatureForm(props: SignatureFormProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export function Root({ formId, children, dictionary }: SignatureFormProps) {
  useComponentDictionary('Company.SignatureForm', dictionary)
  useI18n('Company.SignatureForm')

  const {
    data: { form, pdfUrl },
    actions: { handleSubmit, handleBack },
    meta: { isPending },
  } = useCompanySignatureForm({ formId })

  return (
    <SignatureFormProvider
      value={{
        form,
        pdfUrl,
        isPending,
        onBack: handleBack,
      }}
    >
      <SharedSignatureForm onSubmit={handleSubmit}>
        <Flex flexDirection="column" gap={32}>
          {children ? (
            children
          ) : (
            <>
              <Head />
              <Preview />
              <Form />
              <Actions />
            </>
          )}
        </Flex>
      </SharedSignatureForm>
    </SignatureFormProvider>
  )
}
