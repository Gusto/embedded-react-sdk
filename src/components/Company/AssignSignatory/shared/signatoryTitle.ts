import { SIGNATORY_TITLES } from '@/shared/constants'

/**
 * Narrows a signatory's `title` to one of the known {@link SIGNATORY_TITLES} keys,
 * which is what makes the matching `common` namespace label safe to look up. The
 * API also returns free-text titles on older records, which have no label and are
 * displayed verbatim.
 *
 * @param title - The `title` field from a signatory record.
 * @returns `true` when the title has a translated label.
 * @internal
 */
export function isValidSignatoryTitle(
  title: string | null | undefined,
): title is keyof typeof SIGNATORY_TITLES {
  return !!title && title in SIGNATORY_TITLES
}
