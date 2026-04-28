'use client'

import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { UploadIcon } from "lucide-react"
import { toast } from "sonner"

export default function UnPublishBtn({workflowId}: {workflowId: string}) {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/workflows/${id}/unpublish`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to unpublish workflow')
      }
    },
    onSuccess: () => {
      toast.success('Workflow unpublished', {id: workflowId})
    },
    onError: (error) => {
      console.error('Failed to unpublish workflow', error)
      toast.error('Failed to unpublish workflow', {id: workflowId})
    }
  })

  return (
    <Button
      disabled={mutation.isPending}
      onClick={() => {
        toast.loading('Unpublishing workflow...', {id: workflowId})
        mutation.mutate(workflowId)
      }}
      className="flex items-center gap-2"
      variant={'outline'}
    >
      <UploadIcon className="stroke-green-400" size={16} />
      Unpublish
    </Button>
  )
}
