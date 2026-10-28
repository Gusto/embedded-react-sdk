/**
 * A single NAICS industry classification: its numeric code and industry title.
 *
 * @remarks
 * Surfaced as the option-entry type on the industry selector's field props so
 * `getOptionLabel` can relabel options from the raw code and title.
 *
 * @public
 * @page company/types
 */
export interface NaicsCode {
  /** The NAICS classification code. Codes in the bundled list are six digits; a code already saved for a company may be four or five. */
  code: string
  /** The industry title for the code. */
  title: string
}

/**
 * Lazily loads the full NAICS industry code list as {@link NaicsCode} records.
 *
 * @returns A promise resolving to every NAICS code paired with its title.
 * @internal
 */
export const loadAll = async (): Promise<NaicsCode[]> =>
  (await import('./NAICSValues')).default.map(row => ({ code: row[0], title: row[1] }))
