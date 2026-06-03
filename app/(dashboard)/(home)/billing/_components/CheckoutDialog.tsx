'use client'

import { BuyCredits } from '@/actions/billing/BuyCredits'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CreditsPack } from '@/types/billing'
import { CheckCircle2Icon, CoinsIcon, CreditCardIcon, Loader2Icon, LockIcon } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

type Step = 'form' | 'processing' | 'receipt'

interface Props {
  open: boolean
  onClose: () => void
  pack: CreditsPack
}

interface Receipt {
  id: string
  date: Date
  pack: CreditsPack
}

function formatCard(val: string) {
  return val
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

export default function CheckoutDialog({ open, onClose, pack }: Props) {
  const queryClient = useQueryClient()

  const [step, setStep] = useState<Step>('form')
  const [cardNumber, setCardNumber] = useState('')
  const [cardholder, setCardholder] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cvvFocused, setCvvFocused] = useState(false)
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  const handleClose = useCallback(() => {
    if (step === 'processing') return
    setStep('form')
    setCardNumber('')
    setCardholder('')
    setExpiry('')
    setCvv('')
    setReceipt(null)
    onClose()
  }, [step, onClose])

  async function handlePay() {
    if (!cardNumber || !cardholder || !expiry || !cvv) {
      toast.error('Fill in all card details')
      return
    }
    setStep('processing')
    await new Promise((r) => setTimeout(r, 1800))
    try {
      const { purchase } = await BuyCredits(pack.id)
      setReceipt({ id: purchase.id, date: purchase.date, pack })
      setStep('receipt')
      queryClient.invalidateQueries({ queryKey: ['user-available-credits'] })
    } catch {
      toast.error('Something went wrong')
      setStep('form')
    }
  }

  const displayNumber = cardNumber || '•••• •••• •••• ••••'
  const displayName = cardholder || 'FULL NAME'
  const displayExpiry = expiry || 'MM/YY'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-primary" />
            {step === 'receipt' ? 'Payment Successful' : 'Checkout'}
          </DialogTitle>
        </DialogHeader>

        {/* ── STEP: FORM ── */}
        {step === 'form' && (
          <div className="space-y-5">
            {/* Pack summary */}
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <CoinsIcon className="h-4 w-4 text-primary" />
                <span className="font-medium">{pack.name}</span>
                <Badge variant="secondary">{pack.label}</Badge>
              </div>
              <span className="font-bold text-primary">
                ${(pack.price / 100).toFixed(2)}
              </span>
            </div>

            {/* Virtual card preview */}
            <div
              className="relative h-44 w-full rounded-2xl p-5 text-white overflow-hidden select-none"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              }}
            >
              {/* background circles */}
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
              <div className="absolute -right-4 -bottom-10 h-52 w-52 rounded-full bg-white/5" />

              {/* chip */}
              <div className="mb-4 flex items-center justify-between">
                <div className="h-8 w-11 rounded-md bg-yellow-300/80" />
                <span className="text-xs font-semibold tracking-widest text-white/60 uppercase">
                  {cvvFocused ? 'CVV' : 'VISA'}
                </span>
              </div>

              {/* number */}
              <p className="mb-4 font-mono text-lg tracking-widest">
                {cvvFocused
                  ? '•••• •••• •••• ••••'
                  : displayNumber.padEnd(19, ' ')}
              </p>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-white/50 uppercase">Card Holder</p>
                  <p className="text-sm font-medium tracking-wider uppercase truncate max-w-[160px]">
                    {displayName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/50 uppercase">Expires</p>
                  <p className="text-sm font-medium">{displayExpiry}</p>
                </div>
              </div>

              {/* CVV stripe overlay */}
              {cvvFocused && (
                <div className="absolute inset-0 flex flex-col justify-center bg-black/50 rounded-2xl">
                  <div className="h-10 w-full bg-black/70 mb-3" />
                  <div className="mx-6 flex items-center justify-end">
                    <div className="flex-1 h-8 bg-white/20 rounded-sm mr-3" />
                    <span className="font-mono text-white text-sm tracking-widest">
                      {cvv || '•••'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Card Number</Label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCard(e.target.value))}
                  inputMode="numeric"
                  className="font-mono tracking-widest"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Cardholder Name</Label>
                <Input
                  placeholder="Full Name"
                  value={cardholder}
                  onChange={(e) => setCardholder(e.target.value.toUpperCase())}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Expiry</Label>
                  <Input
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    inputMode="numeric"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">CVV</Label>
                  <Input
                    placeholder="•••"
                    type="password"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    onFocus={() => setCvvFocused(true)}
                    onBlur={() => setCvvFocused(false)}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <LockIcon className="h-3 w-3" />
              Secure mock payment — no real data is transmitted
            </div>

            <Button className="w-full" onClick={handlePay}>
              Pay ${(pack.price / 100).toFixed(2)}
            </Button>
          </div>
        )}

        {/* ── STEP: PROCESSING ── */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20" />
              <Loader2Icon className="absolute inset-0 m-auto h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-lg font-semibold">Processing payment…</p>
            <p className="text-sm text-muted-foreground">Please wait</p>
          </div>
        )}

        {/* ── STEP: RECEIPT ── */}
        {step === 'receipt' && receipt && (
          <div className="space-y-4">
            {/* Green check */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2Icon className="h-9 w-9 text-green-500" />
              </div>
            </div>

            {/* Receipt paper */}
            <div className="rounded-xl border bg-secondary/30 px-5 py-4 space-y-3 font-mono text-sm">
              <div className="text-center mb-2">
                <p className="text-base font-bold tracking-wider">RECEIPT</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(receipt.date).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              <Separator />

              <Row label="Transaction" value={`#${receipt.id.slice(-8).toUpperCase()}`} />
              <Row label="Pack" value={receipt.pack.name} />
              <Row label="Credits" value={receipt.pack.credits.toLocaleString()} highlight />
              <Row label="Amount" value={`$${(receipt.pack.price / 100).toFixed(2)}`} />

              <Separator />

              <div className="text-center text-xs text-muted-foreground pt-1">
                Thank you for your purchase!
                <br />
                Credits have been added to your account.
              </div>
            </div>

            <Button className="w-full" onClick={handleClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? 'text-primary font-bold' : 'font-medium'}>{value}</span>
    </div>
  )
}
