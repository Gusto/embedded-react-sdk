import * as v from 'valibot'
import { FormProvider, useForm, type UseFormProps } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Form } from 'react-aria-components'

import { Flex } from '@/components/Common'
import styles from './SignatureForm.module.scss'

export const SignatureFormSchema = v.object({
  signature: v.pipe(v.string(), v.nonEmpty()),
  confirmSignature: v.pipe(v.array(v.literal('agree')), v.minLength(1)),
})

export const signatureFormDefaultValues = {
  signature: '',
  confirmSignature: [],
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
