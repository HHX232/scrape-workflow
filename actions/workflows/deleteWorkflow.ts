'use server'

import { auth } from "@/components/hooks/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteWorkflow(id:string) {
   const {userId} = auth()
   if(!userId){
      throw new Error('Unauthorized')
   }

   try {
      await prisma.workflow.delete({
         where: {
            id,
            userId
         }
      })
   } catch (error) {
      throw new Error('Failed to delete workflow')
   }

   revalidatePath('/workflows')
}