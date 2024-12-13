import * as v from 'valibot'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useDocumentSigner } from '@/components/Employee/DocumentSigner/DocumentSigner'
import { SignatureFormActions } from '@/components/Employee/DocumentSigner/SignatureFormActions'
import { Checkbox, TextField, Flex } from '@/components/Common'
import { Form } from 'react-aria-components'

import styles from './SignatureForm.module.scss'

export const SignatureFormSchema = v.object({
  signature: v.pipe(v.string(), v.nonEmpty()),
  confirmSignature: v.pipe(v.boolean(), v.literal(true)),
})

export type SignatureFormInputs = v.InferInput<typeof SignatureFormSchema>

export function SignatureForm() {
  const { control, formState } = useFormContext<SignatureFormInputs>()
  const { mode, pdfUrl, handleSubmit, formToSign } = useDocumentSigner()
  const { t } = useTranslation('Employee.DocumentSigner')

  if (mode !== 'SIGN') return null

  return (
    <section className={styles.container}>
      {pdfUrl && (
        <embed
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          type="application/pdf"
          className={styles.embedPdf}
          title={formToSign?.title}
        />
      )}
      <Form onSubmit={handleSubmit}>
        <div className={styles.formFields}>
          <Flex flexDirection="column">
            <TextField
              name="signature"
              label="Signature"
              control={control}
              description={t('signatureFieldDescription')}
              errorMessage={t('signatureFieldError')}
              isRequired
            />
            <Checkbox name="confirmSignature" control={control} isRequired>
              {t('confirmSignatureCheckboxLabel')}
            </Checkbox>
            {/**
             * TODO[GWS-3228]: This is a temp error message pending adding validation and messaging to the core checkbox
             */}
            {formState.errors.confirmSignature && (
              <span className={styles.error}>{t('confirmSignatureError')}</span>
            )}
          </Flex>
        </div>
        <SignatureFormActions />
      </Form>
    </section>
  )
}
