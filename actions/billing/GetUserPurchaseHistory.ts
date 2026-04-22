'use server'
import { auth } from "@/components/hooks/auth";
import prisma from "@/lib/prisma";
;

export async function GetUserPurchaseHistory() {
  const { userId } = auth();
  if (!userId) {
    throw new Error("unauthenticated");
  }

  return prisma.userPurchase.findMany({
    where: { userId },
    orderBy: {
      date: "desc",
    },
  });
}