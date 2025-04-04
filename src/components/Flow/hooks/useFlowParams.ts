import { useTranslation } from 'react-i18next'
import { type FlowContextInterface, useFlow } from '@/components/Flow/Flow'

export interface UseFlowParamsProps<TFlowContext> {
  component?: string
  requiredParams?: Array<keyof TFlowContext>
}

function hasRequiredParams<TParams extends object, TRequiredParams extends keyof TParams>(
  params: TParams,
  requiredParams: TRequiredParams[],
): params is TParams & Required<Pick<TParams, TRequiredParams>> {
  return requiredParams.every(param => param in params && typeof params[param] !== 'undefined')
}

export function useFlowParams<TFlowContext extends FlowContextInterface>({
  component,
  requiredParams = [],
}: UseFlowParamsProps<TFlowContext>) {
  const params = useFlow<TFlowContext>()
  const { t } = useTranslation('common')

  if (!hasRequiredParams(params, requiredParams)) {
    const missingParam = requiredParams.find(param => typeof params[param] === 'undefined')
    throw new Error(
      t('errors.missingParamsOrContext', {
        param: missingParam,
        component,
        provider: 'FlowProvider',
      }),
    )
  }

  return params
}
