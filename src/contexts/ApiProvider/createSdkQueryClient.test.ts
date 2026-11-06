import { describe, expect, it } from 'vitest'
import { API_QUERY_NAMESPACE } from './apiVersion'
import { createSdkQueryClient } from './createSdkQueryClient'

describe('createSdkQueryClient', () => {
  it('configures queries and mutations to run regardless of network state', () => {
    const client = createSdkQueryClient()

    expect(client.getQueryDefaults([API_QUERY_NAMESPACE])).toMatchObject({
      retry: false,
      networkMode: 'always',
    })
    expect(client.getMutationDefaults([API_QUERY_NAMESPACE])).toMatchObject({
      retry: false,
      networkMode: 'always',
    })
  })
})
