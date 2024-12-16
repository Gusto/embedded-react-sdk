import { type FlowContextInterface, useFlow } from '@/components/Flow'
import { useTranslation } from 'react-i18next'

export interface UseFlowParamsProps<TFlowContext> {
  component?: string
  requiredParams?: Array<keyof TFlowContext>
}

export function useFlowParams<TFlowContext extends FlowContextInterface>({
  component,
  requiredParams = [],
}: UseFlowParamsProps<TFlowContext>) {
  const params = useFlow<TFlowContext>()
  const { t } = useTranslation('common')

  requiredParams.forEach(param => {
    if (!(param in params)) {
      throw new Error(
        t('errors.missingParamsOrContext', {
          param,
          component,
          provider: 'FlowProvider',
        }),
      )
    }
  })

  return params
}
