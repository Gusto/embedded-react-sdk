import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
/**
 * The type of target entity applicable to the flow. This field is optional for company flows.
 */
export declare const CreateFlowRequestEntityType: {
    readonly Company: "Company";
    readonly Employee: "Employee";
    readonly Contractor: "Contractor";
    readonly Payroll: "Payroll";
};
/**
 * The type of target entity applicable to the flow. This field is optional for company flows.
 */
export type CreateFlowRequestEntityType = ClosedEnum<typeof CreateFlowRequestEntityType>;
/**
 * Request body for creating a flow.
 */
export type CreateFlowRequest = {
    /**
     * The type of flow to generate. Multiple flow types can be combined by separating them with commas (e.g., "add_addresses,add_employees,sign_all_forms").
     */
    flowType: string;
    /**
     * UUID of the target entity applicable to the flow. This field is optional for company flows.
     */
    entityUuid?: string | undefined;
    /**
     * The type of target entity applicable to the flow. This field is optional for company flows.
     */
    entityType?: CreateFlowRequestEntityType | undefined;
    /**
     * Optional configuration object that varies based on the flow_type. This can contain arbitrary key-value pairs specific to the flow being generated.
     */
    options?: {
        [k: string]: any;
    } | undefined;
};
/** @internal */
export declare const CreateFlowRequestEntityType$outboundSchema: z.ZodNativeEnum<typeof CreateFlowRequestEntityType>;
/** @internal */
export type CreateFlowRequest$Outbound = {
    flow_type: string;
    entity_uuid?: string | undefined;
    entity_type?: string | undefined;
    options?: {
        [k: string]: any;
    } | undefined;
};
/** @internal */
export declare const CreateFlowRequest$outboundSchema: z.ZodType<CreateFlowRequest$Outbound, z.ZodTypeDef, CreateFlowRequest>;
export declare function createFlowRequestToJSON(createFlowRequest: CreateFlowRequest): string;
//# sourceMappingURL=createflowrequest.d.ts.map