import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Name of the parent resource of the described entity.
 */
export declare const ResourceType: {
    readonly Company: "Company";
};
/**
 * Name of the parent resource of the described entity.
 */
export type ResourceType = ClosedEnum<typeof ResourceType>;
/**
 * Representation of an Event
 */
export type Event = {
    /**
     * Unique identifier for the event.
     */
    uuid: string;
    /**
     * Description of the event (e.g., payroll.submitted, or company.form.signed).
     */
    eventType?: string | undefined;
    /**
     * Name of the parent resource of the described entity.
     */
    resourceType?: ResourceType | undefined;
    /**
     * Unique identifier for the parent resource.
     */
    resourceUuid?: string | undefined;
    /**
     * Name of the entity that the event corresponds to.
     */
    entityType?: string | undefined;
    /**
     * Unique identifier for the entity.
     */
    entityUuid?: string | undefined;
    /**
     * Time at which this event was created. Measured in seconds since the Unix epoch.
     */
    timestamp?: number | undefined;
};
/** @internal */
export declare const ResourceType$inboundSchema: z.ZodNativeEnum<typeof ResourceType>;
/** @internal */
export declare const Event$inboundSchema: z.ZodType<Event, z.ZodTypeDef, unknown>;
export declare function eventFromJSON(jsonString: string): SafeParseResult<Event, SDKValidationError>;
//# sourceMappingURL=event.d.ts.map