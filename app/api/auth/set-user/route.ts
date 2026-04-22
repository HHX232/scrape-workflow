// app/api/auth/set-user/route.ts
// Заменяет старый route — теперь и cookie ставит И юзера в БД создаёт

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") ?? "user_local_dev";

  // Создаём баланс если нет
  const existing = await prisma.userBalance.findUnique({ where: { userId } });
  if (!existing) {
    await prisma.userBalance.create({
      data: { userId, credits: 100000000 },
    });
  }

  const res = NextResponse.json({ ok: true, userId, credits: existing?.credits ?? 100 });
  res.cookies.set("userId", userId, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 дней
  });

  return res;
}