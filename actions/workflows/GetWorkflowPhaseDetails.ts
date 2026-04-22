'use server'

import { auth } from "@/components/hooks/auth";
import prisma from "@/lib/prisma";

export async function GetWorkflowPhaseDetails(phaseId: string) {
    const {userId} = auth()
    
    if (!userId) {
        throw new Error('User not authenticated')
    }
    
   return prisma.executionPhase.findUnique({
    where: {
        id: phaseId,
        execution:{
         userId
        }
    },
    include:{
        logs:{
            orderBy:{
                timestamp:'asc'
            }
        }
    }
   })

}
