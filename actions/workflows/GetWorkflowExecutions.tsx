"use server";

import { auth } from "@/components/hooks/auth";
import prisma from "@/lib/prisma";
;

export async function GetWorkflowExecutions(workflowId: string) {
    const { userId } = auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }

    return prisma.workflowExecution.findMany({
        where: {
            workflowId,
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}