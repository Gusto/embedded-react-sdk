import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1SalaryEstimatesIdHeaderXGustoAPIVersion, GetV1SalaryEstimatesIdRequest } from "../models/operations/getv1salaryestimatesid.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildSalaryEstimatesGetV1SalaryEstimatesIdQuery, prefetchSalaryEstimatesGetV1SalaryEstimatesId, queryKeySalaryEstimatesGetV1SalaryEstimatesId, SalaryEstimatesGetV1SalaryEstimatesIdQueryData } from "./salaryEstimatesGetV1SalaryEstimatesId.core.js";
export { buildSalaryEstimatesGetV1SalaryEstimatesIdQuery, prefetchSalaryEstimatesGetV1SalaryEstimatesId, queryKeySalaryEstimatesGetV1SalaryEstimatesId, type SalaryEstimatesGetV1SalaryEstimatesIdQueryData, };
export type SalaryEstimatesGetV1SalaryEstimatesIdQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get a salary estimate
 *
 * @remarks
 * Retrieve a salary estimate by its UUID. Returns the estimated salary calculation along with all occupation details, revenue, and location information.
 *
 * scope: `salary_estimates:read`
 */
export declare function useSalaryEstimatesGetV1SalaryEstimatesId(request: GetV1SalaryEstimatesIdRequest, options?: QueryHookOptions<SalaryEstimatesGetV1SalaryEstimatesIdQueryData, SalaryEstimatesGetV1SalaryEstimatesIdQueryError>): UseQueryResult<SalaryEstimatesGetV1SalaryEstimatesIdQueryData, SalaryEstimatesGetV1SalaryEstimatesIdQueryError>;
/**
 * Get a salary estimate
 *
 * @remarks
 * Retrieve a salary estimate by its UUID. Returns the estimated salary calculation along with all occupation details, revenue, and location information.
 *
 * scope: `salary_estimates:read`
 */
export declare function useSalaryEstimatesGetV1SalaryEstimatesIdSuspense(request: GetV1SalaryEstimatesIdRequest, options?: SuspenseQueryHookOptions<SalaryEstimatesGetV1SalaryEstimatesIdQueryData, SalaryEstimatesGetV1SalaryEstimatesIdQueryError>): UseSuspenseQueryResult<SalaryEstimatesGetV1SalaryEstimatesIdQueryData, SalaryEstimatesGetV1SalaryEstimatesIdQueryError>;
export declare function setSalaryEstimatesGetV1SalaryEstimatesIdData(client: QueryClient, queryKeyBase: [
    uuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1SalaryEstimatesIdHeaderXGustoAPIVersion | undefined;
    }
], data: SalaryEstimatesGetV1SalaryEstimatesIdQueryData): SalaryEstimatesGetV1SalaryEstimatesIdQueryData | undefined;
export declare function invalidateSalaryEstimatesGetV1SalaryEstimatesId(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    uuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1SalaryEstimatesIdHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllSalaryEstimatesGetV1SalaryEstimatesId(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=salaryEstimatesGetV1SalaryEstimatesId.d.ts.map