'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CreditsPack, PackId } from '@/types/billing'
import { CoinsIcon, CreditCard } from 'lucide-react'
import { useState } from 'react'
import CheckoutDialog from './CheckoutDialog'
import { getCreditsPack } from '@/types/billing'

export default function CreditsPurchase() {
  const [selectedPack, setSelectedPack] = useState<PackId>(PackId.MEDIUM)
  const [dialogOpen, setDialogOpen] = useState(false)

  const activePack = getCreditsPack(selectedPack)!

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CoinsIcon className="h-6 w-6 text-primary" />
            Purchase Credits
          </CardTitle>
          <CardDescription>Select the number of credits you want to purchase</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            onValueChange={(v) => setSelectedPack(v as PackId)}
            value={selectedPack}
          >
            {CreditsPack.map((pack) => (
              <div
                key={pack.id}
                onClick={() => setSelectedPack(pack.id)}
                className="flex items-center space-x-3 bg-secondary/50 rounded-lg p-3 hover:bg-secondary cursor-pointer transition-colors"
              >
                <RadioGroupItem value={pack.id} id={pack.id} />
                <Label className="flex justify-between w-full cursor-pointer">
                  <span className="font-medium">
                    {pack.name} — {pack.label}
                  </span>
                  <span className="font-bold text-primary">
                    ${(pack.price / 100).toFixed(2)}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => setDialogOpen(true)}
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Buy {activePack.label} for ${(activePack.price / 100).toFixed(2)}
          </Button>
        </CardFooter>
      </Card>

      <CheckoutDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        pack={activePack}
      />
    </>
  )
}
