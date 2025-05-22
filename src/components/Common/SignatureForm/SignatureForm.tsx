import { z } from 'zod'
import { FormProvider, useForm, type UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import styles from './SignatureForm.module.scss'
import { Form } from '@/components/Common/Form'
import { Flex } from '@/components/Common'

export const SignatureFormSchema = z.object({
  signature: z.string().min(1),
  confirmSignature: z.literal(true),
})

const signatureFormDefaultValues = {
  signature: '',
}

export type SignatureFormInputs = z.infer<typeof SignatureFormSchema>

interface SignatureFormProps {
  onSubmit: (data: SignatureFormInputs) => void | Promise<void>
  children?: React.ReactNode
  formProps?: Partial<UseFormProps<SignatureFormInputs>>
}

export function SignatureForm({ onSubmit, children, formProps }: SignatureFormProps) {
  const methods = useForm<SignatureFormInputs>({
    resolver: zodResolver(SignatureFormSchema),
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
