'use client'

import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { useReactFlow } from '@xyflow/react'
import { CheckIcon } from 'lucide-react'
import { toast } from 'sonner'

export default function SaveBtn({workflowId}: {workflowId: string}) {
  const {toObject} = useReactFlow()

  const saveMutation = useMutation({
    mutationFn: async ({ id, definition }: { id: string; definition: string }) => {
      const res = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ definition }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save workflow')
      }
    },
    onSuccess: () => {
      toast.dismiss()
      toast.success('Flow saved successfully')
    },
    onError: (error) => {
      toast.dismiss()
      console.error('Failed to save flow', error)
      toast.error('Failed to save flow')
    },
  })

  return (
    <Button
      disabled={saveMutation.isPending}
      variant={'outline'}
      className='flex items-center gap-2'
      onClick={() => {
        const definition = JSON.stringify(toObject())
        toast.loading('Saving flow...')
        saveMutation.mutate({ id: workflowId, definition })
      }}
    >
      <CheckIcon size={16} className='stroke-green-400' />
      Save
    </Button>
  )
}
