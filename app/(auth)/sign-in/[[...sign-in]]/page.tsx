'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')

  async function handleSendOtp() {
    if (!email.trim()) {
      toast.error('Enter your email')
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

  async function handleLogin() {
    if (otp.length !== 4) {
      toast.error('Enter the 4-digit code')
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: otp }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      toast.error(data.error ?? 'Login failed')
      return
    }
    toast.success('Welcome back!')
    router.push('/')
  }

  return (
    <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          No account?{' '}
          <Link href="/sign-up" className="underline underline-offset-4">
            Create one
          </Link>
        </p>
      </div>

      {step === 'email' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
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
            onClick={handleLogin}
            disabled={loading || otp.length !== 4}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => { setStep('email'); setOtp('') }}
          >
            Back
          </Button>
        </div>
      )}
    </div>
  )
}
