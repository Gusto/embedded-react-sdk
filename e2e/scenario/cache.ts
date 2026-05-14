import { mkdirSync, renameSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { randomBytes } from 'node:crypto'

export interface ScenarioContext {
  flowToken: string
  companyId: string
  locationIds: Record<string, string>
  employeeIds: Record<string, string>
  contractorIds: Record<string, string>
  paySchedule?: { uuid: string }
  payrollIds: Record<string, string>
}

interface CacheEntry {
  hash: string
  createdAt: string
  flowToken: string
  companyId: string
  context: ScenarioContext
}

interface CacheFile {
  version: 1
  scenarios: Record<string, CacheEntry>
}

let cachePathOverride: string | null = null

/** @internal For testing only — override the cache file path. */
export function setCachePathForTesting(path: string | null): void {
  cachePathOverride = path
}

export function getCachePath(): string {
  return cachePathOverride ?? resolve(process.cwd(), 'e2e/.scenario-cache.json')
}

function emptyCache(): CacheFile {
  return { version: 1, scenarios: {} }
}

export function readCache(): CacheFile {
  try {
    const cachePath = getCachePath()
    const raw = readFileSync(cachePath, 'utf8')
    const parsed = JSON.parse(raw) as CacheFile
    if (parsed.version !== 1 || typeof parsed.scenarios !== 'object') {
      return emptyCache()
    }
    return parsed
  } catch {
    return emptyCache()
  }
}

export function writeCache(cache: CacheFile): void {
  const cachePath = getCachePath()
  const dir = dirname(cachePath)
  mkdirSync(dir, { recursive: true })
  const tmpPath = `${cachePath}.${randomBytes(6).toString('hex')}.tmp`
  writeFileSync(tmpPath, JSON.stringify(cache, null, 2), 'utf8')
  renameSync(tmpPath, cachePath)
}

export async function validateToken(
  gwsFlowsBase: string,
  flowToken: string,
  companyId: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      `${gwsFlowsBase}/fe_sdk/${flowToken}/v1/companies/${companyId}/locations`,
      { signal: AbortSignal.timeout(5000) },
    )
    return response.ok
  } catch {
    return false
  }
}

export async function getCachedScenario(
  scenarioId: string,
  hash: string,
  gwsFlowsBase: string,
): Promise<ScenarioContext | null> {
  const cache = readCache()
  const entry = cache.scenarios[scenarioId]
  if (!entry || entry.hash !== hash) return null

  const tokenValid = await validateToken(gwsFlowsBase, entry.flowToken, entry.companyId)
  if (!tokenValid) return null

  return entry.context
}

export function setCachedScenario(
  scenarioId: string,
  hash: string,
  context: ScenarioContext,
): void {
  const cache = readCache()
  cache.scenarios[scenarioId] = {
    hash,
    createdAt: new Date().toISOString(),
    flowToken: context.flowToken,
    companyId: context.companyId,
    context,
  }
  writeCache(cache)
}

export function clearCache(): void {
  try {
    rmSync(getCachePath())
  } catch {
    // File already absent
  }
}
