import { BLOCK_ENDPOINTS, FLOW_ENDPOINTS } from '@/permissions'
import type { BlockName, BlockVariables, Endpoint, FlowName } from '@/permissions'

export type {
  BlockName,
  BlockVariables,
  Endpoint,
  EndpointMethod,
  FlowName,
  FlowVariables,
} from '@/permissions'

export type EndpointVariable = BlockVariables<BlockName>

export interface AllowlistConfig {
  flows?: FlowName[]
  blocks?: BlockName[]
  variables?: Partial<Record<EndpointVariable, string>>
}

export function getFlowEndpoints(flowName: FlowName): Endpoint[] {
  return [...FLOW_ENDPOINTS[flowName]]
}

export function getBlockEndpoints(blockName: BlockName): Endpoint[] {
  return [...BLOCK_ENDPOINTS[blockName]]
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
