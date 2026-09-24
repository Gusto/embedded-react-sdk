import { MutationKey, UseMutationResult } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { DeleteV1CompaniesCompanyUuidSignatoriesSignatoryUuidRequest, DeleteV1CompaniesCompanyUuidSignatoriesSignatoryUuidResponse } from "../models/operations/deletev1companiescompanyuuidsignatoriessignatoryuuid.js";
import { MutationHookOptions } from "./_types.js";
export type SignatoriesDeleteMutationVariables = {
    request: DeleteV1CompaniesCompanyUuidSignatoriesSignatoryUuidRequest;
    options?: RequestOptions;
};
export type SignatoriesDeleteMutationData = DeleteV1CompaniesCompanyUuidSignatoriesSignatoryUuidResponse;
export type SignatoriesDeleteMutationError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Delete a signatory
 *
 * @remarks
 * Deletes a company signatory.
 *
 * ## Related guides
 * - [Signatory Events](doc:signatory-events)
 *
 * scope: `signatories:manage`
 */
export declare function useSignatoriesDeleteMutation(options?: MutationHookOptions<SignatoriesDeleteMutationData, SignatoriesDeleteMutationError, SignatoriesDeleteMutationVariables>): UseMutationResult<SignatoriesDeleteMutationData, SignatoriesDeleteMutationError, SignatoriesDeleteMutationVariables>;
export declare function mutationKeySignatoriesDelete(): MutationKey;
export declare function buildSignatoriesDeleteMutation(client$: GustoEmbeddedCore, hookOptions?: RequestOptions): {
    mutationKey: MutationKey;
    mutationFn: (variables: SignatoriesDeleteMutationVariables) => Promise<SignatoriesDeleteMutationData>;
};
//# sourceMappingURL=signatoriesDelete.d.ts.map