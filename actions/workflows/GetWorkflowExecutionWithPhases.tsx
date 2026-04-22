'use server'

import { auth } from "@/components/hooks/auth";
import prisma from "@/lib/prisma";

export async function GetWorkflowExecutionWithPhases(executionId: string) {
    const {userId} = auth()
    if(!userId) {
        throw new Error("User not found")
    }
  
    return prisma.workflowExecution.findUnique({
        where: {
            id: executionId,
            userId
        },
        include: {
            phases: {
               orderBy:{
                  number: "asc"
               }
            }
        }
    })
}