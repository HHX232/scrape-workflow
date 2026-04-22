'use server'

import { auth } from "@/components/hooks/auth";
import prisma from "@/lib/prisma";

export async function GetWorkflowsForUser() {
   const {userId} = auth()
   if (!userId) {
      throw new Error('Unauthorized')
   }

   return prisma.workflow.findMany({
      where: {
         userId
      },
      orderBy: {
         createdAt: 'asc'
      }
   })
}