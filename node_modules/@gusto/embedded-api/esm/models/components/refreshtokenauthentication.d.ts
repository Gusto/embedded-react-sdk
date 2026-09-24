import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type RefreshTokenAuthentication = {
    /**
     * A new access token that can be used for subsequent authenticated requests
     */
    accessToken: string;
    /**
     * The literal string 'Bearer'
     */
    tokenType: string;
    /**
     * The TTL of this token. After this amount of time, you must hit the refresh token endpoint to continue making authenticated requests.
     */
    expiresIn: number;
    /**
     * Datetime for when the new access token is created.
     */
    createdAt: number;
    /**
     * A token that must be passed to the refresh token endpoint to get a new authenticated token.
     */
    refreshToken?: string | undefined;
    /**
     * All of the scopes for which the access token provides access.
     */
    scope?: string | undefined;
};
/** @internal */
export declare const RefreshTokenAuthentication$inboundSchema: z.ZodType<RefreshTokenAuthentication, z.ZodTypeDef, unknown>;
export declare function refreshTokenAuthenticationFromJSON(jsonString: string): SafeParseResult<RefreshTokenAuthentication, SDKValidationError>;
//# sourceMappingURL=refreshtokenauthentication.d.ts.map