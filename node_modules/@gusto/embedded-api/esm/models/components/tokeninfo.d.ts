import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * The resource associated with this access token. Null when
 *
 * @remarks
 * the token has no associated resource.
 */
export type Resource = {
    /**
     * The type of resource associated with the access token, e.g. `Company` for a company-level token or `Oauth::Application` for a system-level token.
     *
     * @remarks
     */
    type?: string | undefined;
    /**
     * The UUID of the associated resource
     */
    uuid?: string | undefined;
};
/**
 * The type of resource owner:
 *
 * @remarks
 * - `CompanyAdmin`: A company administrator
 * - `Employee`: An employee
 * - `Contractor`: A contractor
 */
export declare const TokenInfoType: {
    readonly CompanyAdmin: "CompanyAdmin";
    readonly Employee: "Employee";
    readonly Contractor: "Contractor";
};
/**
 * The type of resource owner:
 *
 * @remarks
 * - `CompanyAdmin`: A company administrator
 * - `Employee`: An employee
 * - `Contractor`: A contractor
 */
export type TokenInfoType = ClosedEnum<typeof TokenInfoType>;
/**
 * The resource owner (user) who authorized this access token. Null for
 *
 * @remarks
 * system-level tokens or when the owner cannot be determined.
 */
export type ResourceOwner = {
    /**
     * The type of resource owner:
     *
     * @remarks
     * - `CompanyAdmin`: A company administrator
     * - `Employee`: An employee
     * - `Contractor`: A contractor
     */
    type?: TokenInfoType | undefined;
    /**
     * The UUID of the resource owner
     */
    uuid?: string | undefined;
};
export type TokenInfo = {
    /**
     * Space-separated list of OAuth scopes granted to this access token.
     *
     * @remarks
     */
    scope?: string | undefined;
    /**
     * The resource associated with this access token. Null when
     *
     * @remarks
     * the token has no associated resource.
     */
    resource?: Resource | null | undefined;
    /**
     * The resource owner (user) who authorized this access token. Null for
     *
     * @remarks
     * system-level tokens or when the owner cannot be determined.
     */
    resourceOwner?: ResourceOwner | null | undefined;
};
/** @internal */
export declare const Resource$inboundSchema: z.ZodType<Resource, z.ZodTypeDef, unknown>;
export declare function resourceFromJSON(jsonString: string): SafeParseResult<Resource, SDKValidationError>;
/** @internal */
export declare const TokenInfoType$inboundSchema: z.ZodNativeEnum<typeof TokenInfoType>;
/** @internal */
export declare const ResourceOwner$inboundSchema: z.ZodType<ResourceOwner, z.ZodTypeDef, unknown>;
export declare function resourceOwnerFromJSON(jsonString: string): SafeParseResult<ResourceOwner, SDKValidationError>;
/** @internal */
export declare const TokenInfo$inboundSchema: z.ZodType<TokenInfo, z.ZodTypeDef, unknown>;
export declare function tokenInfoFromJSON(jsonString: string): SafeParseResult<TokenInfo, SDKValidationError>;
//# sourceMappingURL=tokeninfo.d.ts.map