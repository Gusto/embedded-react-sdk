import { type ReactNode } from 'react'
// import { useI18n } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base/Base'
import { Flex } from '@/components/Common'

interface SignatureFormProps {
  companyId: string
  signatoryId?: string
  className?: string
  children?: ReactNode
}

export function SignatureForm({
  companyId,
  signatoryId,
  className,
  children,
  ...props
}: SignatureFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root companyId={companyId} signatoryId={signatoryId} className={className}>
        {children}
      </Root>
    </BaseComponent>
  )
}

function Root({ companyId, signatoryId, className, children }: SignatureFormProps) {
  // useI18n('Company.SignatureForm')
  // const { onEvent } = useBase()

  return (
    <section className={className}>
      <Flex flexDirection="column" gap={32}>
        SignatureForm
      </Flex>
    </section>
  )
}
