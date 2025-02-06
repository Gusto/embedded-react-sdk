import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import IndustrySelect from './IndustrySelect'
import { Head } from './Head'
import { Edit } from './Edit'
import { Actions } from './Actions'

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

Industry.Actions = Actions
Industry.Edit = Edit
Industry.Head = Head

export const IndustryContextual = (props: IndustryProps) => {
  return <Industry {...props} />
}
