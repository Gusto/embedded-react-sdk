import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1CompaniesCompanyUuidHolidayPayPolicyHeaderXGustoAPIVersion, GetV1CompaniesCompanyUuidHolidayPayPolicyRequest } from "../models/operations/getv1companiescompanyuuidholidaypaypolicy.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildHolidayPayPoliciesGetQuery, HolidayPayPoliciesGetQueryData, prefetchHolidayPayPoliciesGet, queryKeyHolidayPayPoliciesGet } from "./holidayPayPoliciesGet.core.js";
export { buildHolidayPayPoliciesGetQuery, type HolidayPayPoliciesGetQueryData, prefetchHolidayPayPoliciesGet, queryKeyHolidayPayPoliciesGet, };
export type HolidayPayPoliciesGetQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get a company's holiday pay policy
 *
 * @remarks
 * Get a company's holiday pay policy
 *
 * scope: `holiday_pay_policies:read`
 */
export declare function useHolidayPayPoliciesGet(request: GetV1CompaniesCompanyUuidHolidayPayPolicyRequest, options?: QueryHookOptions<HolidayPayPoliciesGetQueryData, HolidayPayPoliciesGetQueryError>): UseQueryResult<HolidayPayPoliciesGetQueryData, HolidayPayPoliciesGetQueryError>;
/**
 * Get a company's holiday pay policy
 *
 * @remarks
 * Get a company's holiday pay policy
 *
 * scope: `holiday_pay_policies:read`
 */
export declare function useHolidayPayPoliciesGetSuspense(request: GetV1CompaniesCompanyUuidHolidayPayPolicyRequest, options?: SuspenseQueryHookOptions<HolidayPayPoliciesGetQueryData, HolidayPayPoliciesGetQueryError>): UseSuspenseQueryResult<HolidayPayPoliciesGetQueryData, HolidayPayPoliciesGetQueryError>;
export declare function setHolidayPayPoliciesGetData(client: QueryClient, queryKeyBase: [
    companyUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyUuidHolidayPayPolicyHeaderXGustoAPIVersion | undefined;
    }
], data: HolidayPayPoliciesGetQueryData): HolidayPayPoliciesGetQueryData | undefined;
export declare function invalidateHolidayPayPoliciesGet(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    companyUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyUuidHolidayPayPolicyHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllHolidayPayPoliciesGet(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=holidayPayPoliciesGet.d.ts.map