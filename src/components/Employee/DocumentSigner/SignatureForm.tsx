import * as v from 'valibot'
import { useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-aria-components'

import { useDocumentSigner } from '@/components/Employee/DocumentSigner/DocumentSigner'
import { SignatureFormActions } from '@/components/Employee/DocumentSigner/SignatureFormActions'
import { CheckboxGroup, TextField, Flex } from '@/components/Common'
import { useContainerBreakpoints } from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'

import { Form } from 'react-aria-components'

import styles from './SignatureForm.module.scss'
import { DocumentViewer } from '@/components/Common/DocumentViewer/DocumentViewer'

export const SignatureFormSchema = v.object({
  signature: v.pipe(v.string(), v.nonEmpty()),
  confirmSignature: v.pipe(
    v.array(v.literal('agree')),
    v.minLength(1, 'You must agree to sign electronically'),
  ),
})

export type SignatureFormInputs = v.InferInput<typeof SignatureFormSchema>

export function SignatureForm() {
  const { control } = useFormContext<SignatureFormInputs>()
  const { mode, pdfUrl, handleSubmit, formToSign } = useDocumentSigner()
  const { t } = useTranslation('Employee.DocumentSigner')

  if (mode !== 'SIGN') return null

  return (
    <section className={styles.container}>
      <DocumentViewer
        url={pdfUrl}
        title={formToSign?.title}
        downloadInstructions={t('downloadAndReviewInstructions')}
        viewDocumentLabel={t('viewDocumentCta')}
      />
      <Form onSubmit={handleSubmit}>
        <div className={styles.formFields}>
          <Flex flexDirection="column" gap={20}>
            <TextField
              name="signature"
              label="Signature"
              control={control}
              description={t('signatureFieldDescription')}
              errorMessage={t('signatureFieldError')}
              isRequired
            />
            <CheckboxGroup
              control={control}
              name="confirmSignature"
              isRequired
              aria-label={t('confirmSignatureCheckboxLabel')}
              errorMessage={t('confirmSignatureError')}
              options={[{ name: 'agree', label: t('confirmSignatureCheckboxLabel') }]}
            />
          </Flex>
        </div>
        <SignatureFormActions />
      </Form>
    </section>
  )
}
