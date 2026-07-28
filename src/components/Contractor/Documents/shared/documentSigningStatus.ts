import type { Document } from '@gusto/embedded-api/models/components/document'

/**
 * Returns whether a document still needs the contractor's signature.
 *
 * @remarks
 * We intentionally do not defer to the API's `requiresSigning` flag here: an
 * unsigned document whose template is not yet prepared comes back with
 * `requiresSigning: false`, and treating that as "complete" would render an
 * unsigned document as signed. Keying off `signedAt` keeps "complete" meaning
 * "actually signed" everywhere this is used — the contractor onboarding
 * document list and the management documents card.
 *
 * @internal
 */
export function requiresSignature(document: Document): boolean {
  return !document.signedAt
}
