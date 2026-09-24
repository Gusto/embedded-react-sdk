import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1EmployeesEmployeeIdI9AuthorizationDocumentOptionsHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdI9AuthorizationDocumentOptionsRequest } from "../models/operations/getv1employeesemployeeidi9authorizationdocumentoptions.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildI9VerificationGetDocumentOptionsQuery, I9VerificationGetDocumentOptionsQueryData, prefetchI9VerificationGetDocumentOptions, queryKeyI9VerificationGetDocumentOptions } from "./i9VerificationGetDocumentOptions.core.js";
export { buildI9VerificationGetDocumentOptionsQuery, type I9VerificationGetDocumentOptionsQueryData, prefetchI9VerificationGetDocumentOptions, queryKeyI9VerificationGetDocumentOptions, };
export type I9VerificationGetDocumentOptionsQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get an employee's I-9 verification document options
 *
 * @remarks
 * An employee's I-9 verification documents are the documents an employee has provided the employer to verify their identity and authorization to work in the United States. This endpoint returns the possible document options based on the employee's authorization status. These options can then be used to create the I-9 verification documents.
 *
 * ### Related guides
 * - [I-9 employment verification](doc:i-9-employment-verification)
 *
 * scope: `i9_authorizations:read`
 */
export declare function useI9VerificationGetDocumentOptions(request: GetV1EmployeesEmployeeIdI9AuthorizationDocumentOptionsRequest, options?: QueryHookOptions<I9VerificationGetDocumentOptionsQueryData, I9VerificationGetDocumentOptionsQueryError>): UseQueryResult<I9VerificationGetDocumentOptionsQueryData, I9VerificationGetDocumentOptionsQueryError>;
/**
 * Get an employee's I-9 verification document options
 *
 * @remarks
 * An employee's I-9 verification documents are the documents an employee has provided the employer to verify their identity and authorization to work in the United States. This endpoint returns the possible document options based on the employee's authorization status. These options can then be used to create the I-9 verification documents.
 *
 * ### Related guides
 * - [I-9 employment verification](doc:i-9-employment-verification)
 *
 * scope: `i9_authorizations:read`
 */
export declare function useI9VerificationGetDocumentOptionsSuspense(request: GetV1EmployeesEmployeeIdI9AuthorizationDocumentOptionsRequest, options?: SuspenseQueryHookOptions<I9VerificationGetDocumentOptionsQueryData, I9VerificationGetDocumentOptionsQueryError>): UseSuspenseQueryResult<I9VerificationGetDocumentOptionsQueryData, I9VerificationGetDocumentOptionsQueryError>;
export declare function setI9VerificationGetDocumentOptionsData(client: QueryClient, queryKeyBase: [
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdI9AuthorizationDocumentOptionsHeaderXGustoAPIVersion | undefined;
    }
], data: I9VerificationGetDocumentOptionsQueryData): I9VerificationGetDocumentOptionsQueryData | undefined;
export declare function invalidateI9VerificationGetDocumentOptions(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdI9AuthorizationDocumentOptionsHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllI9VerificationGetDocumentOptions(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=i9VerificationGetDocumentOptions.d.ts.map