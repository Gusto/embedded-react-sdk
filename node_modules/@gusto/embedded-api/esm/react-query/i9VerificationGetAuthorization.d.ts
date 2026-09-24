import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1EmployeesEmployeeIdI9AuthorizationHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdI9AuthorizationRequest } from "../models/operations/getv1employeesemployeeidi9authorization.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildI9VerificationGetAuthorizationQuery, I9VerificationGetAuthorizationQueryData, prefetchI9VerificationGetAuthorization, queryKeyI9VerificationGetAuthorization } from "./i9VerificationGetAuthorization.core.js";
export { buildI9VerificationGetAuthorizationQuery, type I9VerificationGetAuthorizationQueryData, prefetchI9VerificationGetAuthorization, queryKeyI9VerificationGetAuthorization, };
export type I9VerificationGetAuthorizationQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get an employee's I-9 authorization
 *
 * @remarks
 * An employee's I-9 authorization stores information about an employee's authorization status and I-9 signatures, information required to fill out the Form I-9 for employment eligibility verification.
 *
 * **NOTE:** The `form_uuid` in responses from this endpoint can be used to retrieve the PDF version of the I-9. See the "get employee form PDF" request for more details.
 *
 * ### Related guides
 * - [I-9 employment verification](doc:i-9-employment-verification)
 *
 * scope: `i9_authorizations:read`
 */
export declare function useI9VerificationGetAuthorization(request: GetV1EmployeesEmployeeIdI9AuthorizationRequest, options?: QueryHookOptions<I9VerificationGetAuthorizationQueryData, I9VerificationGetAuthorizationQueryError>): UseQueryResult<I9VerificationGetAuthorizationQueryData, I9VerificationGetAuthorizationQueryError>;
/**
 * Get an employee's I-9 authorization
 *
 * @remarks
 * An employee's I-9 authorization stores information about an employee's authorization status and I-9 signatures, information required to fill out the Form I-9 for employment eligibility verification.
 *
 * **NOTE:** The `form_uuid` in responses from this endpoint can be used to retrieve the PDF version of the I-9. See the "get employee form PDF" request for more details.
 *
 * ### Related guides
 * - [I-9 employment verification](doc:i-9-employment-verification)
 *
 * scope: `i9_authorizations:read`
 */
export declare function useI9VerificationGetAuthorizationSuspense(request: GetV1EmployeesEmployeeIdI9AuthorizationRequest, options?: SuspenseQueryHookOptions<I9VerificationGetAuthorizationQueryData, I9VerificationGetAuthorizationQueryError>): UseSuspenseQueryResult<I9VerificationGetAuthorizationQueryData, I9VerificationGetAuthorizationQueryError>;
export declare function setI9VerificationGetAuthorizationData(client: QueryClient, queryKeyBase: [
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdI9AuthorizationHeaderXGustoAPIVersion | undefined;
    }
], data: I9VerificationGetAuthorizationQueryData): I9VerificationGetAuthorizationQueryData | undefined;
export declare function invalidateI9VerificationGetAuthorization(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdI9AuthorizationHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllI9VerificationGetAuthorization(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=i9VerificationGetAuthorization.d.ts.map