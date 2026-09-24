import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { OauthAccessTokenRequest, OauthAccessTokenResponse } from "../models/operations/oauthaccesstoken.js";
import { APIPromise } from "../types/async.js";
import { Result } from "../types/fp.js";
/**
 * Create a System Access Token or Refresh an Access Token
 *
 * @remarks
 * Creates a system access token or refreshes an oauth access token
 */
export declare function introspectionOauthAccessToken(client: GustoEmbeddedCore, request: OauthAccessTokenRequest, options?: RequestOptions): APIPromise<Result<OauthAccessTokenResponse, GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError>>;
//# sourceMappingURL=introspectionOauthAccessToken.d.ts.map