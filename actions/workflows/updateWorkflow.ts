'use server'

import { waitFor } from "@/lib/helper/waitFor"
import prisma from "@/lib/prisma"
import { WorkflowStatus } from "@/types/workflow"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function UpdateWorkflow({
   id, definition, callback
}: {
   id: string,
   definition: string,
   callback?: () => void
}){
   const {userId} = auth()

   if(!userId){
      throw new Error('Unauthorized')
   }
   const workflow = await prisma.workflow.findUnique({
      where: {
         id
      }
   })
   if(!workflow){
      throw new Error('Workflow not found')
   }
   if(workflow.status !== WorkflowStatus.DRAFT){
      throw new Error('Workflow is not in draft state')
   }
   await prisma.workflow.update({
   data: {
      definition: definition 
   },
      where: {
         id,
         userId
      }
   })

   revalidatePath('/workflows')
}