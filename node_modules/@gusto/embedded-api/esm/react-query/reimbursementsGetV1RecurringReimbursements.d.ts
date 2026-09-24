import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1RecurringReimbursementsHeaderXGustoAPIVersion, GetV1RecurringReimbursementsRequest } from "../models/operations/getv1recurringreimbursements.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildReimbursementsGetV1RecurringReimbursementsQuery, prefetchReimbursementsGetV1RecurringReimbursements, queryKeyReimbursementsGetV1RecurringReimbursements, ReimbursementsGetV1RecurringReimbursementsQueryData } from "./reimbursementsGetV1RecurringReimbursements.core.js";
export { buildReimbursementsGetV1RecurringReimbursementsQuery, prefetchReimbursementsGetV1RecurringReimbursements, queryKeyReimbursementsGetV1RecurringReimbursements, type ReimbursementsGetV1RecurringReimbursementsQueryData, };
export type ReimbursementsGetV1RecurringReimbursementsQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get a recurring reimbursement
 *
 * @remarks
 * Get a specific recurring reimbursement.
 *
 * scope: `reimbursements:read`
 */
export declare function useReimbursementsGetV1RecurringReimbursements(request: GetV1RecurringReimbursementsRequest, options?: QueryHookOptions<ReimbursementsGetV1RecurringReimbursementsQueryData, ReimbursementsGetV1RecurringReimbursementsQueryError>): UseQueryResult<ReimbursementsGetV1RecurringReimbursementsQueryData, ReimbursementsGetV1RecurringReimbursementsQueryError>;
/**
 * Get a recurring reimbursement
 *
 * @remarks
 * Get a specific recurring reimbursement.
 *
 * scope: `reimbursements:read`
 */
export declare function useReimbursementsGetV1RecurringReimbursementsSuspense(request: GetV1RecurringReimbursementsRequest, options?: SuspenseQueryHookOptions<ReimbursementsGetV1RecurringReimbursementsQueryData, ReimbursementsGetV1RecurringReimbursementsQueryError>): UseSuspenseQueryResult<ReimbursementsGetV1RecurringReimbursementsQueryData, ReimbursementsGetV1RecurringReimbursementsQueryError>;
export declare function setReimbursementsGetV1RecurringReimbursementsData(client: QueryClient, queryKeyBase: [
    id: string,
    parameters: {
        xGustoAPIVersion?: GetV1RecurringReimbursementsHeaderXGustoAPIVersion | undefined;
    }
], data: ReimbursementsGetV1RecurringReimbursementsQueryData): ReimbursementsGetV1RecurringReimbursementsQueryData | undefined;
export declare function invalidateReimbursementsGetV1RecurringReimbursements(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    id: string,
    parameters: {
        xGustoAPIVersion?: GetV1RecurringReimbursementsHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllReimbursementsGetV1RecurringReimbursements(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=reimbursementsGetV1RecurringReimbursements.d.ts.map