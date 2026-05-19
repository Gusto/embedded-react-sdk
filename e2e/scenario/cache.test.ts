import { mkdtempSync, existsSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  readCache,
  writeCache,
  getCachedScenario,
  setCachedScenario,
  clearCache,
  getCachePath,
  setCachePathForTesting,
  type ScenarioContext,
} from './cache'

const TEMP_DIR = mkdtempSync(join(tmpdir(), 'cache-test-'))
const TEST_CACHE_PATH = join(TEMP_DIR, '.scenario-cache.json')

function makeContext(overrides: Partial<ScenarioContext> = {}): ScenarioContext {
  return {
    flowToken: 'test-token-abc',
    companyId: 'company-uuid-123',
    locationIds: { main: 'loc-1' },
    employeeIds: { alice: 'emp-1' },
    contractorIds: {},
    payrollIds: {},
    ...overrides,
  }
}

describe('cache', () => {
  beforeAll(() => {
    setCachePathForTesting(TEST_CACHE_PATH)
  })

  afterAll(() => {
    setCachePathForTesting(null)
  })

  beforeEach(() => {
    const { rmSync } = require('node:fs') as typeof import('node:fs')
    try {
      rmSync(TEST_CACHE_PATH)
    } catch {
      // already absent
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('readCache', () => {
    it('returns empty cache when file does not exist', () => {
      const cache = readCache()
      expect(cache).toEqual({ version: 1, scenarios: {} })
    })

    it('returns empty cache when file is corrupt', () => {
      writeFileSync(TEST_CACHE_PATH, 'not json!!!', 'utf8')
      const cache = readCache()
      expect(cache).toEqual({ version: 1, scenarios: {} })
    })
  })

  describe('writeCache + readCache roundtrip', () => {
    it('persists and retrieves cache data', () => {
      const data = {
        version: 1 as const,
        scenarios: {
          'payroll/standard': {
            hash: 'abc123',
            createdAt: '2026-05-14T12:00:00Z',
            flowToken: 'tok',
            companyId: 'comp',
            context: makeContext(),
          },
        },
      }
      writeCache(data)
      expect(readCache()).toEqual(data)
    })
  })

  describe('getCachedScenario', () => {
    const scenarioId = 'payroll/biweekly'
    const hash = 'deadbeef'.repeat(8)
    const context = makeContext()

    beforeEach(() => {
      setCachedScenario(scenarioId, hash, context)
    })

    it('returns null on hash mismatch', async () => {
      const result = await getCachedScenario(scenarioId, 'wrong-hash', 'http://localhost:3000')
      expect(result).toBeNull()
    })

    it('returns null when token validation fails', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 401 }))
      const result = await getCachedScenario(scenarioId, hash, 'http://localhost:3000')
      expect(result).toBeNull()
    })

    it('returns context when hash matches and token is valid', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }))
      const result = await getCachedScenario(scenarioId, hash, 'http://localhost:3000')
      expect(result).toEqual(context)
    })

    it('calls the correct validation URL', async () => {
      const fetchSpy = vi
        .spyOn(global, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }))
      await getCachedScenario(scenarioId, hash, 'http://flows.test:4000')
      expect(fetchSpy).toHaveBeenCalledTimes(1)
      const [calledUrl, calledInit] = fetchSpy.mock.calls[0]!
      expect(calledUrl).toBeInstanceOf(URL)
      expect((calledUrl as URL).href).toBe(
        `http://flows.test:4000/fe_sdk/${context.flowToken}/v1/companies/${context.companyId}/locations`,
      )
      expect(calledInit).toEqual(expect.objectContaining({ signal: expect.any(AbortSignal) }))
    })

    it('returns null when gwsFlowsBase is not a valid URL', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      const result = await getCachedScenario(scenarioId, hash, 'not a url')
      expect(result).toBeNull()
      expect(fetchSpy).not.toHaveBeenCalled()
    })

    it('returns null when gwsFlowsBase uses a non-http(s) scheme', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      const result = await getCachedScenario(scenarioId, hash, 'file:///etc/passwd')
      expect(result).toBeNull()
      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })

  describe('setCachedScenario', () => {
    it('stores entry correctly', () => {
      const context = makeContext({ flowToken: 'new-token', companyId: 'new-company' })
      setCachedScenario('company/onboarding', 'hash-xyz', context)
      const cache = readCache()
      const entry = cache.scenarios['company/onboarding']
      expect(entry).toBeDefined()
      expect(entry!.hash).toBe('hash-xyz')
      expect(entry!.flowToken).toBe('new-token')
      expect(entry!.companyId).toBe('new-company')
      expect(entry!.context).toEqual(context)
      expect(entry!.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })
  })

  describe('clearCache', () => {
    it('removes the cache file', () => {
      writeCache({ version: 1, scenarios: {} })
      expect(existsSync(getCachePath())).toBe(true)
      clearCache()
      expect(existsSync(getCachePath())).toBe(false)
    })

    it('does not throw when file is already absent', () => {
      expect(() => clearCache()).not.toThrow()
    })
  })
})
