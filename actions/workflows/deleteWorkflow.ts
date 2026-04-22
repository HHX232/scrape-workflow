'use server'

import { auth } from "@/components/hooks/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteWorkflow(id:string) {
   const {userId} = auth()
   if(!userId){
      throw new Error('Unauthorized')
   }

   await prisma.workflow.delete({
      where: {
         id,
         userId
      }
   })

   revalidatePath('/workflows')
}