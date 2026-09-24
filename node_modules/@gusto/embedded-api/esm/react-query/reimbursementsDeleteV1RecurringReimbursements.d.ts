import { MutationKey, UseMutationResult } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { DeleteV1RecurringReimbursementsRequest, DeleteV1RecurringReimbursementsResponse } from "../models/operations/deletev1recurringreimbursements.js";
import { MutationHookOptions } from "./_types.js";
export type ReimbursementsDeleteV1RecurringReimbursementsMutationVariables = {
    request: DeleteV1RecurringReimbursementsRequest;
    options?: RequestOptions;
};
export type ReimbursementsDeleteV1RecurringReimbursementsMutationData = DeleteV1RecurringReimbursementsResponse;
export type ReimbursementsDeleteV1RecurringReimbursementsMutationError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Delete a recurring reimbursement
 *
 * @remarks
 * Delete (soft delete) a recurring reimbursement for an employee.
 *
 * scope: `reimbursements:write`
 */
export declare function useReimbursementsDeleteV1RecurringReimbursementsMutation(options?: MutationHookOptions<ReimbursementsDeleteV1RecurringReimbursementsMutationData, ReimbursementsDeleteV1RecurringReimbursementsMutationError, ReimbursementsDeleteV1RecurringReimbursementsMutationVariables>): UseMutationResult<ReimbursementsDeleteV1RecurringReimbursementsMutationData, ReimbursementsDeleteV1RecurringReimbursementsMutationError, ReimbursementsDeleteV1RecurringReimbursementsMutationVariables>;
export declare function mutationKeyReimbursementsDeleteV1RecurringReimbursements(): MutationKey;
export declare function buildReimbursementsDeleteV1RecurringReimbursementsMutation(client$: GustoEmbeddedCore, hookOptions?: RequestOptions): {
    mutationKey: MutationKey;
    mutationFn: (variables: ReimbursementsDeleteV1RecurringReimbursementsMutationVariables) => Promise<ReimbursementsDeleteV1RecurringReimbursementsMutationData>;
};
//# sourceMappingURL=reimbursementsDeleteV1RecurringReimbursements.d.ts.map