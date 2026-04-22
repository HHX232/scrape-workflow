'use server'

import { auth } from "@/components/hooks/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
;

export async function DeleteCredential(name: string) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("unauthenticated");
  }

  await prisma.credential.delete({
    where: {
      userID_name: {
        userID:userId,
        name,
      },
    },
  });

  revalidatePath("/credentials");
}