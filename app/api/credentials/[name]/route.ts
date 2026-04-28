import { auth } from '@/components/hooks/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(_req: NextRequest, { params }: { params: { name: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.credential.delete({
      where: { userID_name: { userID: userId, name: decodeURIComponent(params.name) } },
    })
  } catch (e: any) {
    console.error('[DELETE /api/credentials/[name]] prisma error', e)
    return NextResponse.json({ error: 'Failed to delete credential', detail: e?.message }, { status: 500 })
  }

  revalidatePath('/credentials')
  return NextResponse.json({ ok: true })
}
