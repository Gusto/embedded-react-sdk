import * as v from 'valibot'
import { FormProvider, useForm, type UseFormProps } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Form } from 'react-aria-components'
import styles from './SignatureForm.module.scss'
import { Flex } from '@/components/Common'

export const SignatureFormSchema = v.object({
  signature: v.pipe(v.string(), v.nonEmpty()),
  confirmSignature: v.literal(true),
})

export const signatureFormDefaultValues = {
  signature: '',
}

export type SignatureFormInputs = v.InferInput<typeof SignatureFormSchema>

interface SignatureFormProps {
  onSubmit: (data: SignatureFormInputs) => void | Promise<void>
  children?: React.ReactNode
  formProps?: Partial<UseFormProps<SignatureFormInputs>>
}

export function SignatureForm({ onSubmit, children, formProps }: SignatureFormProps) {
  const methods = useForm<SignatureFormInputs>({
    resolver: valibotResolver(SignatureFormSchema),
    defaultValues: signatureFormDefaultValues,
    ...formProps,
  })

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)} className={styles.container}>
        <div className={styles.formFields}>
          <Flex flexDirection="column" gap={20}>
            {children}
          </Flex>
        </div>
      </Form>
    </FormProvider>
  )
}
