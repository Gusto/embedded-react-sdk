import { MutationKey, UseMutationResult } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { PutV1RecurringReimbursementsRequest, PutV1RecurringReimbursementsResponse } from "../models/operations/putv1recurringreimbursements.js";
import { MutationHookOptions } from "./_types.js";
export type ReimbursementsPutV1RecurringReimbursementsMutationVariables = {
    request: PutV1RecurringReimbursementsRequest;
    options?: RequestOptions;
};
export type ReimbursementsPutV1RecurringReimbursementsMutationData = PutV1RecurringReimbursementsResponse;
export type ReimbursementsPutV1RecurringReimbursementsMutationError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Update a recurring reimbursement
 *
 * @remarks
 * Update a recurring reimbursement.
 *
 * scope: `reimbursements:write`
 */
export declare function useReimbursementsPutV1RecurringReimbursementsMutation(options?: MutationHookOptions<ReimbursementsPutV1RecurringReimbursementsMutationData, ReimbursementsPutV1RecurringReimbursementsMutationError, ReimbursementsPutV1RecurringReimbursementsMutationVariables>): UseMutationResult<ReimbursementsPutV1RecurringReimbursementsMutationData, ReimbursementsPutV1RecurringReimbursementsMutationError, ReimbursementsPutV1RecurringReimbursementsMutationVariables>;
export declare function mutationKeyReimbursementsPutV1RecurringReimbursements(): MutationKey;
export declare function buildReimbursementsPutV1RecurringReimbursementsMutation(client$: GustoEmbeddedCore, hookOptions?: RequestOptions): {
    mutationKey: MutationKey;
    mutationFn: (variables: ReimbursementsPutV1RecurringReimbursementsMutationVariables) => Promise<ReimbursementsPutV1RecurringReimbursementsMutationData>;
};
//# sourceMappingURL=reimbursementsPutV1RecurringReimbursements.d.ts.map