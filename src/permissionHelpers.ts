import { BLOCK_ENDPOINTS, FLOW_ENDPOINTS } from '@/permissions'
import type { Endpoint } from '@/permissions'

export type { Endpoint, EndpointMethod } from '@/permissions'

export type EndpointVariable =
  | 'companyId'
  | 'employeeId'
  | 'contractorId'
  | 'contractorUuid'
  | 'payrollId'
  | 'homeAddressUuid'
  | 'workAddressUuid'
  | 'bankAccountUuid'
  | 'jobId'
  | 'compensationId'
  | 'locationUuid'
  | 'garnishmentId'
  | 'formId'
  | 'payScheduleId'
  | 'state'
  | 'wireInRequestId'
  | 'informationRequestId'
  | 'recoveryCaseId'
  | 'paymentGroupId'
  | 'paymentId'

export interface AllowlistConfig {
  flows?: string[]
  blocks?: string[]
  variables?: Partial<Record<EndpointVariable, string>>
}

export function getFlowEndpoints(flowName: string): Endpoint[] {
  const endpoints = FLOW_ENDPOINTS[flowName]
  if (!endpoints) {
    throw new Error(
      `Unknown flow: "${flowName}". Available flows: ${Object.keys(FLOW_ENDPOINTS).join(', ')}`,
    )
  }
  return [...endpoints]
}

export function getBlockEndpoints(blockName: string): Endpoint[] {
  const endpoints = BLOCK_ENDPOINTS[blockName]
  if (!endpoints) {
    throw new Error(
      `Unknown block: "${blockName}". Available blocks: ${Object.keys(BLOCK_ENDPOINTS).join(', ')}`,
    )
  }
  return [...endpoints]
}

export const WILDCARD = '*'

export function resolveEndpoints(
  endpoints: Endpoint[],
  variables: Partial<Record<EndpointVariable, string>>,
): Endpoint[] {
  return endpoints.map(endpoint => ({
    method: endpoint.method,
    path: endpoint.path.replace(
      /:([a-zA-Z]+)/g,
      (_match, paramName: string) => variables[paramName as EndpointVariable] ?? WILDCARD,
    ),
  }))
}

export function buildAllowlist(config: AllowlistConfig): Endpoint[] {
  const endpoints: Endpoint[] = []

  for (const flowName of config.flows ?? []) {
    endpoints.push(...getFlowEndpoints(flowName))
  }

  for (const blockName of config.blocks ?? []) {
    endpoints.push(...getBlockEndpoints(blockName))
  }

  if (config.variables && Object.keys(config.variables).length > 0) {
    return resolveEndpoints(endpoints, config.variables)
  }

  return endpoints
}
