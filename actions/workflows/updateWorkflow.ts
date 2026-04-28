'use server'

import { auth } from "@/components/hooks/auth";
import prisma from "@/lib/prisma";
import { WorkflowStatus } from "@/types/workflow";
import { revalidatePath } from "next/cache";

export async function UpdateWorkflow({
   id, definition
}: {
   id: string,
   definition: string,
}){
   const {userId} = auth()

   if(!userId){
      throw new Error('Unauthorized')
   }

   let workflow
   try {
      workflow = await prisma.workflow.findUnique({
         where: { id }
      })
   } catch {
      throw new Error('Failed to fetch workflow')
   }

   if(!workflow){
      throw new Error('Workflow not found')
   }
   if(workflow.status !== WorkflowStatus.DRAFT){
      throw new Error('Workflow is not in draft state')
   }

   try {
      await prisma.workflow.update({
         data: { definition },
         where: { id, userId }
      })
   } catch {
      throw new Error('Failed to update workflow')
   }

   revalidatePath('/workflows')
}