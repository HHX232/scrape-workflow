'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()

  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [otp, setOtp] = useState('')

  const fileRef = useRef<HTMLInputElement>(null)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSendOtp() {
    if (!name.trim() || !email.trim()) {
      toast.error('Fill in name and email')
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      toast.error(data.error ?? 'Failed to send OTP')
      return
    }
    toast.success(`${data.code} — your dev otp`)
    setStep('otp')
  }

  async function handleRegister() {
    if (otp.length !== 4) {
      toast.error('Enter the 4-digit code')
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, avatar, code: otp }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      toast.error(data.error ?? 'Registration failed')
      return
    }
    toast.success('Registered! Welcome 🎉')
    router.push('/')
  }

  return (
    <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" className="underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>

      {step === 'form' && (
        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-muted-foreground/40 flex items-center justify-center hover:border-primary transition-colors"
            >
              {avatar ? (
                <Image src={avatar} alt="avatar" fill className="object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground text-center px-1">
                  Photo
                </span>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="text-xs text-muted-foreground">Click to upload avatar</p>
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSendOtp}
            disabled={loading}
          >
            {loading ? 'Sending…' : 'Send OTP'}
          </Button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Enter the code from the toast notification.
          </p>
          <div className="flex justify-center">
            <InputOTP maxLength={4} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button
            className="w-full"
            onClick={handleRegister}
            disabled={loading || otp.length !== 4}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => { setStep('form'); setOtp('') }}
          >
            Back
          </Button>
        </div>
      )}
    </div>
  )
}
