import { useLocationsGet } from '@gusto/embedded-api/react-query/locationsGet'
import type { Location } from '@gusto/embedded-api/models/components/location'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Parameters accepted by {@link useCompanyLocationsSummary}.
 *
 * @internal
 */
export interface UseCompanyLocationsSummaryParams {
  /** UUID of the company whose locations are being read. */
  companyId: string
}

type UseCompanyLocationsSummaryReady = BaseHookReady<
  { locations: Location[] },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Discriminated union returned by {@link useCompanyLocationsSummary} — either the loading state or the ready state carrying the company's locations.
 *
 * @internal
 */
export type UseCompanyLocationsSummaryResult = HookLoadingResult | UseCompanyLocationsSummaryReady

/**
 * Read-only data hook for the company Locations management card. Wraps
 * `useLocationsGet` and returns every location on file. The endpoint returns
 * all locations when no page is requested, so the card shows the full set
 * without pagination; paging lives in `CompanyOnboarding.LocationsList`.
 *
 * @param params - See {@link UseCompanyLocationsSummaryParams}.
 * @returns See {@link UseCompanyLocationsSummaryResult}.
 * @internal
 */
export function useCompanyLocationsSummary({
  companyId,
}: UseCompanyLocationsSummaryParams): UseCompanyLocationsSummaryResult {
  const locationsQuery = useLocationsGet({ companyId }, { staleTime: Infinity })

  const errorHandling = composeErrorHandler([locationsQuery])

  if (locationsQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { locations: locationsQuery.data?.companyLocationsList ?? [] },
    status: {
      isFetching: locationsQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
