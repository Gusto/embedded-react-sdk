import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { lazy } from 'react'

const IndustrySelect = lazy(() => import('./IndustrySelect'))

export type IndustryProps = Pick<BaseComponentInterface, 'onEvent'>

export const Industry = ({ onEvent }: IndustryProps) => {
  return (
    <BaseComponent onEvent={onEvent}>
      <IndustrySelect />
    </BaseComponent>
  )
}
