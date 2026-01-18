import { z } from 'zod';


export const createWorkFlowSchema = z.object({
   name:z.string().min(2).max(50),
   description:z.string().max(80).optional(),
})

export type createWorkFlowSchemaType = z.infer<typeof createWorkFlowSchema>

export const duplicateWorkflowSchema = createWorkFlowSchema.extend({
  workflowId: z.string(),
});

export type duplicateWorkflowSchemaType = z.infer<typeof duplicateWorkflowSchema>