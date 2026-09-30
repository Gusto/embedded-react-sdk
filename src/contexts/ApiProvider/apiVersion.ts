import { name, version } from '../../../package.json'

/**
 * Single source of truth for the pinned Gusto Embedded API version.
 *
 * @remarks
 * Bumping the API version is a two-line change: update {@link API_VERSION} here and
 * repoint the `@gusto/embedded-api` alias target in `package.json`. Everything else —
 * the `X-Gusto-API-Version` request header and every hand-written TanStack Query key —
 * derives from this constant, so no per-file edits are required.
 *
 * @internal
 */
export const API_VERSION = '2026-06-15'

/**
 * SDK package name and version, sent on every request via the `X-Gusto-SDK-Version`
 * header so backend traffic can be attributed to a specific SDK release.
 *
 * @remarks
 * Read directly from `package.json` so it always matches the published package —
 * no manual bump required.
 *
 * @internal
 */
export const SDK_VERSION = `${name} ${version}`

/**
 * TanStack Query namespace the embedded-api client prefixes onto every generated
 * query and mutation key (segment 1 of every key it emits).
 *
 * @remarks
 * Must equal the resolved package name so hand-written keys used for targeted
 * invalidation match the library-generated ones. Derived from {@link API_VERSION}.
 *
 * @internal
 */
export const API_QUERY_NAMESPACE = `@gusto/embedded-api-v-${API_VERSION}` as const
