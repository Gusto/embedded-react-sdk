import { PayrollListPresentation } from './PayrollListPresentation'
import { usePayrollList } from './usePayrollList'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseComponent } from '@/components/Base'

interface PayrollListBlockProps extends BaseComponentInterface {
  companyId: string
}

export function PayrollList(props: PayrollListBlockProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const Root = ({ companyId, onEvent }: PayrollListBlockProps) => {
  const hookResult = usePayrollList({ companyId, onEvent })

  return <PayrollListPresentation {...hookResult} />
}
