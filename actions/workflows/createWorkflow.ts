'use server'

import prisma from "@/lib/prisma";
import { createFlowNode } from "@/lib/workflow/createFlowNode";
import { createWorkFlowSchema, createWorkFlowSchemaType } from "@/schema/workflow";
import { AppNode } from "@/types/appNode";
import { TaskType } from "@/types/TaskType";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { Edge } from "@xyflow/react";
import { redirect } from "next/navigation";


export async function CreateWorkflow(form: createWorkFlowSchemaType){
const {success, data} = createWorkFlowSchema.safeParse(form)
if(!success){
  throw new Error('Invalid form data')
}
const {userId} = auth()
if(!userId){
   throw new Error('Unauthorized')
}
const initialFlow : {nodes: AppNode[], edges:Edge[]}={nodes:[], edges:[]}

initialFlow.nodes.push(createFlowNode(TaskType.LAUNCH_BROWSER))
const result = await prisma.workflow.create({
   data:{
      userId,
      status:WorkflowStatus.DRAFT,
      definition:JSON.stringify(initialFlow),
      name:data.name,
      description:data.description || ''
   }
})

if(!result){
   throw new Error('Failed to create workflow')
}

redirect(`/workflows/editor/${result.id}`)
}