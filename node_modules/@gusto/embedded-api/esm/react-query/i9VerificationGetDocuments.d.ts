import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1EmployeesEmployeeIdI9AuthorizationDocumentsHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdI9AuthorizationDocumentsRequest } from "../models/operations/getv1employeesemployeeidi9authorizationdocuments.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildI9VerificationGetDocumentsQuery, I9VerificationGetDocumentsQueryData, prefetchI9VerificationGetDocuments, queryKeyI9VerificationGetDocuments } from "./i9VerificationGetDocuments.core.js";
export { buildI9VerificationGetDocumentsQuery, type I9VerificationGetDocumentsQueryData, prefetchI9VerificationGetDocuments, queryKeyI9VerificationGetDocuments, };
export type I9VerificationGetDocumentsQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get an employee's I-9 verification documents
 *
 * @remarks
 * An employee's I-9 verification documents are the documents an employee has provided the employer to verify their identity and authorization to work in the United States.
 *
 * ### Related guides
 * - [I-9 employment verification](doc:i-9-employment-verification)
 *
 * scope: `i9_authorizations:read`
 */
export declare function useI9VerificationGetDocuments(request: GetV1EmployeesEmployeeIdI9AuthorizationDocumentsRequest, options?: QueryHookOptions<I9VerificationGetDocumentsQueryData, I9VerificationGetDocumentsQueryError>): UseQueryResult<I9VerificationGetDocumentsQueryData, I9VerificationGetDocumentsQueryError>;
/**
 * Get an employee's I-9 verification documents
 *
 * @remarks
 * An employee's I-9 verification documents are the documents an employee has provided the employer to verify their identity and authorization to work in the United States.
 *
 * ### Related guides
 * - [I-9 employment verification](doc:i-9-employment-verification)
 *
 * scope: `i9_authorizations:read`
 */
export declare function useI9VerificationGetDocumentsSuspense(request: GetV1EmployeesEmployeeIdI9AuthorizationDocumentsRequest, options?: SuspenseQueryHookOptions<I9VerificationGetDocumentsQueryData, I9VerificationGetDocumentsQueryError>): UseSuspenseQueryResult<I9VerificationGetDocumentsQueryData, I9VerificationGetDocumentsQueryError>;
export declare function setI9VerificationGetDocumentsData(client: QueryClient, queryKeyBase: [
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdI9AuthorizationDocumentsHeaderXGustoAPIVersion | undefined;
    }
], data: I9VerificationGetDocumentsQueryData): I9VerificationGetDocumentsQueryData | undefined;
export declare function invalidateI9VerificationGetDocuments(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdI9AuthorizationDocumentsHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllI9VerificationGetDocuments(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=i9VerificationGetDocuments.d.ts.map