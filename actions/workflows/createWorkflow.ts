'use server'

import { auth } from "@/components/hooks/auth";
import prisma from "@/lib/prisma";
import { createFlowNode } from "@/lib/workflow/createFlowNode";
import { createWorkFlowSchema, createWorkFlowSchemaType } from "@/schema/workflow";
import { AppNode } from "@/types/appNode";
import { TaskType } from "@/types/TaskType";
import { WorkflowStatus } from "@/types/workflow";
import { Edge } from "@xyflow/react";
import { redirect } from "next/navigation";
;


export async function CreateWorkflow(form: createWorkFlowSchemaType){
  console.log('[CreateWorkflow] called with form:', JSON.stringify(form))

  const {success, data} = createWorkFlowSchema.safeParse(form)
  if(!success){
    console.error('[CreateWorkflow] validation failed:', JSON.stringify(form))
    throw new Error('Invalid form data')
  }
  console.log('[CreateWorkflow] form valid, data:', JSON.stringify(data))

  let userId: string | undefined
  try {
    const authResult = auth()
    userId = authResult.userId
    console.log('[CreateWorkflow] auth userId:', userId)
  } catch (e) {
    console.error('[CreateWorkflow] auth() threw:', e)
    throw new Error('Unauthorized')
  }

  if(!userId){
    console.error('[CreateWorkflow] userId is empty after auth()')
    throw new Error('Unauthorized')
  }

  const initialFlow : {nodes: AppNode[], edges:Edge[]}={nodes:[], edges:[]}
  initialFlow.nodes.push(createFlowNode(TaskType.LAUNCH_BROWSER))
  console.log('[CreateWorkflow] initialFlow nodes count:', initialFlow.nodes.length)

  let result
  try {
    console.log('[CreateWorkflow] attempting prisma.workflow.create...')
    result = await prisma.workflow.create({
       data:{
          userId,
          status:WorkflowStatus.DRAFT,
          definition:JSON.stringify(initialFlow),
          name:data.name,
          description:data.description || ''
       }
    })
    console.log('[CreateWorkflow] created workflow id:', result?.id)
  } catch (e: any) {
    throw new Error(
      `[CreateWorkflow] userId=${userId} name="${data.name}" | code=${e?.code} | ${e?.message} | meta=${JSON.stringify(e?.meta)}`
    )
  }

  if(!result){
    console.error('[CreateWorkflow] result is null/undefined after create')
    throw new Error('Failed to create workflow')
  }

  console.log('[CreateWorkflow] success, redirecting to editor:', result.id)
  redirect(`/workflows/editor/${result.id}`)
}