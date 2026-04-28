import { auth } from '@/components/hooks/auth'
import prisma from '@/lib/prisma'
import { symmetricEncrypt } from '@/lib/symmetricEncrypt'
import { createCredentialSchema } from '@/schema/credential'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { success, data } = createCredentialSchema.safeParse(body)
  if (!success) return NextResponse.json({ error: 'Invalid form data' }, { status: 422 })

  const encryptedValue = symmetricEncrypt(data.value)
  try {
    await prisma.credential.create({
      data: { userID: userId, name: data.name, value: encryptedValue },
    })
  } catch (e: any) {
    console.error('[POST /api/credentials] prisma error', e)
    return NextResponse.json({ error: 'Failed to create credential', detail: e?.message }, { status: 500 })
  }

  revalidatePath('/credentials')
  return NextResponse.json({ ok: true })
}
