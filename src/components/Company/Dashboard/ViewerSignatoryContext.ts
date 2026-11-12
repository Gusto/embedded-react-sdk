import { createContext, useContext } from 'react'

/**
 * Carries `DashboardFlow`'s `viewerSignatoryId` to the company forms spoke, which forwards it as
 * `DocumentSigner`'s `signatoryId`. It unlocks signing only when it matches the company's saved
 * signatory.
 *
 * @remarks
 * Deliberately never derived from the signatory list: doing so would assert that whoever opened
 * the dashboard *is* the signatory, letting anyone with access sign the company's federal tax
 * forms. Without it the spoke is review-only.
 *
 * Kept outside the flow's machine context so that a change to it reaches the spoke without
 * recreating the machine, which would reset the dashboard to its cards.
 *
 * @internal
 */
export const ViewerSignatoryContext = createContext<string | undefined>(undefined)

/** @internal */
export const useViewerSignatoryId = () => useContext(ViewerSignatoryContext)
