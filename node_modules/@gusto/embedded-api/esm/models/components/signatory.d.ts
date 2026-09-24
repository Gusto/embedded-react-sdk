import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export declare const IdentityVerificationStatus: {
    readonly Pass: "Pass";
    readonly Fail: "Fail";
    readonly Skipped: "Skipped";
};
export type IdentityVerificationStatus = ClosedEnum<typeof IdentityVerificationStatus>;
export type SignatoryHomeAddress = {
    street1?: string | undefined;
    street2?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip?: string | undefined;
    country: string;
};
/**
 * The representation of a company's signatory
 */
export type Signatory = {
    uuid: string;
    firstName?: string | null | undefined;
    lastName?: string | null | undefined;
    title?: string | null | undefined;
    phone?: string | null | undefined;
    email?: string | undefined;
    birthday?: string | null | undefined;
    /**
     * Whether or not the signatory is also the payroll admin of the company.
     */
    isAdmin?: boolean | undefined;
    /**
     * Indicates whether the signatory has an SSN in Gusto.
     */
    hasSsn?: boolean | undefined;
    /**
     * The current version of the signatory. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field.
     */
    version?: string | undefined;
    /**
     * |   |   |
     *
     * @remarks
     * |---|---|
     * |__Status__| __Description__ |
     * | Pass | Signatory can sign all forms |
     * | Fail | Signatory cannot sign forms |
     * | Skipped | Signatory cannot sign Form 8655 until the form is manually uploaded as wet-signed |
     * | null | Identity verification process has not been completed |
     */
    identityVerificationStatus?: IdentityVerificationStatus | null | undefined;
    homeAddress?: SignatoryHomeAddress | null | undefined;
};
/** @internal */
export declare const IdentityVerificationStatus$inboundSchema: z.ZodNativeEnum<typeof IdentityVerificationStatus>;
/** @internal */
export declare const SignatoryHomeAddress$inboundSchema: z.ZodType<SignatoryHomeAddress, z.ZodTypeDef, unknown>;
export declare function signatoryHomeAddressFromJSON(jsonString: string): SafeParseResult<SignatoryHomeAddress, SDKValidationError>;
/** @internal */
export declare const Signatory$inboundSchema: z.ZodType<Signatory, z.ZodTypeDef, unknown>;
export declare function signatoryFromJSON(jsonString: string): SafeParseResult<Signatory, SDKValidationError>;
//# sourceMappingURL=signatory.d.ts.map