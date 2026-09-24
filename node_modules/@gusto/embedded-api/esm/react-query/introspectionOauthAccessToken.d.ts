import { MutationKey, UseMutationResult } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { OauthAccessTokenRequest, OauthAccessTokenResponse } from "../models/operations/oauthaccesstoken.js";
import { MutationHookOptions } from "./_types.js";
export type IntrospectionOauthAccessTokenMutationVariables = {
    request: OauthAccessTokenRequest;
    options?: RequestOptions;
};
export type IntrospectionOauthAccessTokenMutationData = OauthAccessTokenResponse;
export type IntrospectionOauthAccessTokenMutationError = GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Create a System Access Token or Refresh an Access Token
 *
 * @remarks
 * Creates a system access token or refreshes an oauth access token
 */
export declare function useIntrospectionOauthAccessTokenMutation(options?: MutationHookOptions<IntrospectionOauthAccessTokenMutationData, IntrospectionOauthAccessTokenMutationError, IntrospectionOauthAccessTokenMutationVariables>): UseMutationResult<IntrospectionOauthAccessTokenMutationData, IntrospectionOauthAccessTokenMutationError, IntrospectionOauthAccessTokenMutationVariables>;
export declare function mutationKeyIntrospectionOauthAccessToken(): MutationKey;
export declare function buildIntrospectionOauthAccessTokenMutation(client$: GustoEmbeddedCore, hookOptions?: RequestOptions): {
    mutationKey: MutationKey;
    mutationFn: (variables: IntrospectionOauthAccessTokenMutationVariables) => Promise<IntrospectionOauthAccessTokenMutationData>;
};
//# sourceMappingURL=introspectionOauthAccessToken.d.ts.map