import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { lazy } from 'react'

const IndustrySelect = lazy(() => import('./IndustrySelect'))

export type IndustryProps = Pick<BaseComponentInterface, 'onEvent'> & {
  companyId: string
}

export const Industry = (props: IndustryProps) => {
  return (
    <BaseComponent {...props}>
      <IndustrySelect {...props} />
    </BaseComponent>
  )
}
