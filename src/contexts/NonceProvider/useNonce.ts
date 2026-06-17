import { createContext, useContext } from 'react'

/**
 * React context backing {@link useNonce}.
 *
 * @internal
 */
export const NonceContext = createContext<string | undefined>(undefined)

/**
 * Returns the CSP nonce supplied to {@link GustoProvider}, or `undefined` when none was provided.
 *
 * @remarks
 * Use this when a custom UI component or partner-provided code injects a runtime `<style>` or
 * `<script>` element and the integrating app serves a nonce-based Content Security Policy.
 * Apply the returned value as the `nonce` property on the created element (e.g.
 * `el.nonce = useNonce()`) before appending it to the document.
 *
 * @returns The active nonce, or `undefined` when {@link GustoProvider} was not given a `nonce`.
 *
 * @example
 * ```tsx
 * import { useNonce } from '@gusto/embedded-react-sdk'
 *
 * function InjectThemeStyles({ css }: { css: string }) {
 *   const nonce = useNonce()
 *   useEffect(() => {
 *     const el = document.createElement('style')
 *     if (nonce) el.nonce = nonce
 *     el.textContent = css
 *     document.head.appendChild(el)
 *     return () => el.remove()
 *   }, [css, nonce])
 *   return null
 * }
 * ```
 *
 * @public
 */
export const useNonce = (): string | undefined => useContext(NonceContext)
