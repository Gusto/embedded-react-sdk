/**
 * Handles loading of `.pnp.js` and `.pnp.js` files.
 */
import { fileURLToPath } from 'node:url';
import createImportFresh from 'import-fresh';
import { findUp } from '../../util/findUp.js';
import { toFileUrl } from '../../util/url.js';
import { UnsupportedPnpFile } from './ImportError.js';
const defaultPnpFiles = ['.pnp.cjs', '.pnp.js'];
const supportedSchemas = new Set(['file:']);
const cachedRequests = new Map();
let lock = undefined;
const cachedPnpImports = new Map();
const cachedRequestsSync = new Map();
export class PnpLoader {
    pnpFiles;
    cacheKeySuffix;
    constructor(pnpFiles = defaultPnpFiles) {
        this.pnpFiles = pnpFiles;
        this.cacheKeySuffix = ':' + pnpFiles.join(',');
    }
    /**
     * Request that the nearest .pnp file gets loaded
     * @param urlDirectory starting directory
     * @returns promise - rejects on error - success if loaded or not found.
     */
    async load(urlDirectory) {
        if (!isSupported(urlDirectory))
            return undefined;
        await lock;
        const cacheKey = this.calcKey(urlDirectory);
        const cached = cachedRequests.get(cacheKey);
        if (cached)
            return cached;
        const r = findPnpAndLoad(urlDirectory, this.pnpFiles);
        cachedRequests.set(cacheKey, r);
        const result = await r;
        cachedRequestsSync.set(cacheKey, result);
        return result;
    }
    async peek(urlDirectory) {
        if (!isSupported(urlDirectory))
            return undefined;
        await lock;
        const cacheKey = this.calcKey(urlDirectory);
        return cachedRequests.get(cacheKey) ?? Promise.resolve(undefined);
    }
    /**
     * Clears the cached so .pnp files will get reloaded on request.
     */
    clearCache() {
        return clearPnPGlobalCache();
    }
    calcKey(urlDirectory) {
        return urlDirectory.toString() + this.cacheKeySuffix;
    }
}
export function pnpLoader(pnpFiles) {
    return new PnpLoader(pnpFiles);
}
async function findPnpAndLoad(urlDirectory, pnpFiles) {
    const found = await findUp(pnpFiles, { cwd: fileURLToPath(urlDirectory) });
    return loadPnpIfNeeded(found);
}
async function loadPnpIfNeeded(found) {
    if (!found)
        return undefined;
    const cached = cachedPnpImports.get(found);
    if (cached)
        return cached;
    const r = loadPnp(found);
    cachedPnpImports.set(found, r);
    // If loading fails, remove from cache so subsequent calls can retry.
    r.catch(() => cachedPnpImports.delete(found));
    return r;
}
async function loadPnp(pnpFile) {
    const pnpFileUrl = toFileUrl(pnpFile);
    const importFresh = createImportFresh(pnpFileUrl);
    const { default: pnp } = await importFresh(pnpFileUrl.href);
    if (pnp?.setup) {
        pnp.setup();
        return pnpFileUrl;
    }
    throw new UnsupportedPnpFile(`Unsupported pnp file: "${pnpFile}"`);
}
export function clearPnPGlobalCache() {
    if (lock)
        return lock;
    lock = _cleanCache().finally(() => {
        lock = undefined;
    });
    return lock;
}
async function _cleanCache() {
    await Promise.all([...cachedRequests.values()].map(rejectToUndefined));
    cachedPnpImports.clear();
    cachedRequests.clear();
    cachedRequestsSync.clear();
    return undefined;
}
function rejectToUndefined(p) {
    return p.catch(() => undefined);
}
function isSupported(url) {
    return supportedSchemas.has(url.protocol);
}
//# sourceMappingURL=pnpLoader.js.map