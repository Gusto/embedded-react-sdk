import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
/**
 * The employee's authorization status.
 *
 * @remarks
 * - `citizen`: A citizen is someone who was born in the United States or is a naturalized citizen living in the United States.
 * - `noncitizen`: A noncitizen national is someone born in American Samoa, certain former citizens of the former Trust Territory of the Pacific Islands, and certain children of noncitizen nationals born abroad.
 * - `permanent_resident`: A lawful permanent resident is someone who is not a US citizen and who resides under legally recognized and lawfully recorded permanent residence as an immigrant.
 * - `alien`: Also referred to as a "noncitizen authorized to work". This includes anyone who is authorized to work in the United States but is not a US citizen, US national or lawful permanent resident.
 */
export declare const I9AuthorizationRequestBodyAuthorizationStatus: {
    readonly Citizen: "citizen";
    readonly Noncitizen: "noncitizen";
    readonly PermanentResident: "permanent_resident";
    readonly Alien: "alien";
};
/**
 * The employee's authorization status.
 *
 * @remarks
 * - `citizen`: A citizen is someone who was born in the United States or is a naturalized citizen living in the United States.
 * - `noncitizen`: A noncitizen national is someone born in American Samoa, certain former citizens of the former Trust Territory of the Pacific Islands, and certain children of noncitizen nationals born abroad.
 * - `permanent_resident`: A lawful permanent resident is someone who is not a US citizen and who resides under legally recognized and lawfully recorded permanent residence as an immigrant.
 * - `alien`: Also referred to as a "noncitizen authorized to work". This includes anyone who is authorized to work in the United States but is not a US citizen, US national or lawful permanent resident.
 */
export type I9AuthorizationRequestBodyAuthorizationStatus = ClosedEnum<typeof I9AuthorizationRequestBodyAuthorizationStatus>;
/**
 * The type of document an employee holds, based on their authorization status.
 *
 * @remarks
 * - This is unused for authorization status `citizen` or `noncitizen`.
 * - If the authorization status is `permanent_resident`, this must be `uscis_alien_registration_number`.
 * - If the authorization status is `alien`, this is required and may be any of the valid values.
 */
export declare const I9AuthorizationRequestBodyDocumentType: {
    readonly UscisAlienRegistrationNumber: "uscis_alien_registration_number";
    readonly FormI94: "form_i94";
    readonly ForeignPassport: "foreign_passport";
};
/**
 * The type of document an employee holds, based on their authorization status.
 *
 * @remarks
 * - This is unused for authorization status `citizen` or `noncitizen`.
 * - If the authorization status is `permanent_resident`, this must be `uscis_alien_registration_number`.
 * - If the authorization status is `alien`, this is required and may be any of the valid values.
 */
export type I9AuthorizationRequestBodyDocumentType = ClosedEnum<typeof I9AuthorizationRequestBodyDocumentType>;
/**
 * Request body for creating or updating an employee's I-9 authorization.
 */
export type I9AuthorizationRequestBody = {
    /**
     * The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field. If supplied, this endpoint will update the existing I-9 authorization if it exists.
     */
    version?: string | undefined;
    /**
     * The employee's authorization status.
     *
     * @remarks
     * - `citizen`: A citizen is someone who was born in the United States or is a naturalized citizen living in the United States.
     * - `noncitizen`: A noncitizen national is someone born in American Samoa, certain former citizens of the former Trust Territory of the Pacific Islands, and certain children of noncitizen nationals born abroad.
     * - `permanent_resident`: A lawful permanent resident is someone who is not a US citizen and who resides under legally recognized and lawfully recorded permanent residence as an immigrant.
     * - `alien`: Also referred to as a "noncitizen authorized to work". This includes anyone who is authorized to work in the United States but is not a US citizen, US national or lawful permanent resident.
     */
    authorizationStatus: I9AuthorizationRequestBodyAuthorizationStatus;
    /**
     * The type of document an employee holds, based on their authorization status.
     *
     * @remarks
     * - This is unused for authorization status `citizen` or `noncitizen`.
     * - If the authorization status is `permanent_resident`, this must be `uscis_alien_registration_number`.
     * - If the authorization status is `alien`, this is required and may be any of the valid values.
     */
    documentType?: I9AuthorizationRequestBodyDocumentType | undefined;
    /**
     * The document number. Formatting depends on the employee's document type.
     *
     * @remarks
     * - For `document_type:'uscis_alien_registration_number'`, this must be a USCIS Number/A-Number, which is 7 to 9 digits.
     * - For `document_type:'form_i94'`, this must be a Form I-94 Admission Number, which is 11 digits.
     * - For `document_type:'foreign_passport'`, this must be the passport number.
     *
     * This is required when the document type is present.
     */
    documentNumber?: string | undefined;
    /**
     * The document's country of issuance.
     *
     * @remarks
     *
     * This is required when the document type is `foreign_passport`.
     */
    country?: string | undefined;
    /**
     * The document's expiration date.
     *
     * @remarks
     *
     * This may only be used when the authorization status is `alien`.
     */
    expirationDate?: string | undefined;
};
/** @internal */
export declare const I9AuthorizationRequestBodyAuthorizationStatus$outboundSchema: z.ZodNativeEnum<typeof I9AuthorizationRequestBodyAuthorizationStatus>;
/** @internal */
export declare const I9AuthorizationRequestBodyDocumentType$outboundSchema: z.ZodNativeEnum<typeof I9AuthorizationRequestBodyDocumentType>;
/** @internal */
export type I9AuthorizationRequestBody$Outbound = {
    version?: string | undefined;
    authorization_status: string;
    document_type?: string | undefined;
    document_number?: string | undefined;
    country?: string | undefined;
    expiration_date?: string | undefined;
};
/** @internal */
export declare const I9AuthorizationRequestBody$outboundSchema: z.ZodType<I9AuthorizationRequestBody$Outbound, z.ZodTypeDef, I9AuthorizationRequestBody>;
export declare function i9AuthorizationRequestBodyToJSON(i9AuthorizationRequestBody: I9AuthorizationRequestBody): string;
//# sourceMappingURL=i9authorizationrequestbody.d.ts.map