import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
/**
 * Input type for the custom field.
 */
export declare const CustomFieldType: {
    readonly Text: "text";
    readonly Currency: "currency";
    readonly Number: "number";
    readonly Date: "date";
    readonly Radio: "radio";
};
/**
 * Input type for the custom field.
 */
export type CustomFieldType = ClosedEnum<typeof CustomFieldType>;
/** @internal */
export declare const CustomFieldType$inboundSchema: z.ZodNativeEnum<typeof CustomFieldType>;
//# sourceMappingURL=customfieldtype.d.ts.map