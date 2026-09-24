import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { CustomFieldType } from "./customfieldtype.js";
/**
 * A custom field on a company
 */
export type CompanyCustomField = {
    /**
     * UUID of the company custom field
     */
    uuid: string;
    /**
     * Name of the company custom field
     */
    name: string;
    /**
     * Input type for the custom field.
     */
    type: CustomFieldType;
    /**
     * Description of the company custom field
     */
    description?: string | null | undefined;
    /**
     * An array of options for fields of type radio. Otherwise, null.
     */
    selectionOptions?: Array<string> | null | undefined;
};
/** @internal */
export declare const CompanyCustomField$inboundSchema: z.ZodType<CompanyCustomField, z.ZodTypeDef, unknown>;
export declare function companyCustomFieldFromJSON(jsonString: string): SafeParseResult<CompanyCustomField, SDKValidationError>;
//# sourceMappingURL=companycustomfield.d.ts.map