import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type Form1099 = {
    /**
     * The UUID of the form
     */
    uuid: string;
    /**
     * The type identifier of the form
     */
    name?: string | undefined;
    /**
     * The title of the form
     */
    title?: string | undefined;
    /**
     * The description of the form
     */
    description?: string | undefined;
    /**
     * If the form is in a draft state. E.g. End of year tax forms may be provided in a draft state prior to being finalized.
     */
    draft?: boolean | undefined;
    /**
     * The year of this form. For some forms, e.g. tax forms, this is the year which the form represents. A 1099 for January - December 2022 would be delivered in January 2023 and have a year value of 2022. This value is nullable and will not be present on all forms.
     */
    year?: number | null | undefined;
    /**
     * The quarter of this form. This value is currently always null since it is not present on any contractor forms.
     */
    quarter?: number | null | undefined;
    /**
     * A boolean flag that indicates whether the form needs signing or not. Note that this value will change after the form is signed.
     */
    requiresSigning?: boolean | undefined;
    /**
     * The content type of the associated document. Most forms are PDFs with a content type of `application/pdf`. Some tax file packages will be zip files (containing PDFs) with a content type of `application/zip`. This attribute will be `null` when the document has not been prepared.
     */
    documentContentType?: string | null | undefined;
    /**
     * The contractor UUID
     */
    contractorUuid?: string | undefined;
};
/** @internal */
export declare const Form1099$inboundSchema: z.ZodType<Form1099, z.ZodTypeDef, unknown>;
export declare function form1099FromJSON(jsonString: string): SafeParseResult<Form1099, SDKValidationError>;
//# sourceMappingURL=form1099.d.ts.map