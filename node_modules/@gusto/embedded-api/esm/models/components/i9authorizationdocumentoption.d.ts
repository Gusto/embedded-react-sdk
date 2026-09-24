import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * The document option's section in the list of acceptable documents on the Form I-9
 */
export declare const Section: {
    readonly A: "A";
    readonly A1: "A1";
    readonly A2: "A2";
    readonly A3: "A3";
    readonly B: "B";
    readonly C: "C";
};
/**
 * The document option's section in the list of acceptable documents on the Form I-9
 */
export type Section = ClosedEnum<typeof Section>;
/**
 * An employee's I-9 verification document option based on the authorization status
 */
export type I9AuthorizationDocumentOption = {
    /**
     * The document option's section in the list of acceptable documents on the Form I-9
     */
    section: Section;
    /**
     * The document option's description
     */
    description: string;
    /**
     * The document option's document type
     */
    documentType: string;
    /**
     * The document option's document titles
     */
    documentTitle: Array<string>;
    /**
     * Whether the document is a common choice for I-9 verification
     */
    commonChoice: boolean;
};
/** @internal */
export declare const Section$inboundSchema: z.ZodNativeEnum<typeof Section>;
/** @internal */
export declare const I9AuthorizationDocumentOption$inboundSchema: z.ZodType<I9AuthorizationDocumentOption, z.ZodTypeDef, unknown>;
export declare function i9AuthorizationDocumentOptionFromJSON(jsonString: string): SafeParseResult<I9AuthorizationDocumentOption, SDKValidationError>;
//# sourceMappingURL=i9authorizationdocumentoption.d.ts.map