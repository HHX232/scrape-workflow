'use server'
import { auth } from "@/components/hooks/auth";
import prisma from "@/lib/prisma";
;

export async function GetCredentialsForUser() {
  const { userId } = auth();
  if (!userId) {
    throw new Error("unauthenticated");
  }

  return prisma.credential.findMany({
    where: { userID: userId },
    orderBy: {
      name: "asc",
    },
  });
}