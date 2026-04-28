'use client'

import useExecutionPlan from "@/components/hooks/useExecutionPlan"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { useReactFlow } from "@xyflow/react"
import { UploadIcon } from "lucide-react"
import { toast } from "sonner"

export default function PublishBtn({workflowId}: {workflowId: string}) {
  const generate = useExecutionPlan()
  const {toObject} = useReactFlow()

  const mutation = useMutation({
    mutationFn: async ({ id, flowDefinition }: { id: string; flowDefinition: string }) => {
      const res = await fetch(`/api/workflows/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowDefinition }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to publish workflow')
      }
    },
    onSuccess: () => {
      toast.success('Workflow published', {id: workflowId})
    },
    onError: (error) => {
      console.error('Failed to publish workflow', error)
      toast.error('Failed to publish workflow', {id: workflowId})
    }
  })

  return (
    <Button
      disabled={mutation.isPending}
      onClick={() => {
        const plan = generate()
        if (!plan) return
        toast.loading('Publishing workflow...', {id: workflowId})
        mutation.mutate({id: workflowId, flowDefinition: JSON.stringify(toObject())})
      }}
      className="flex items-center gap-2"
      variant={'outline'}
    >
      <UploadIcon className="stroke-green-400" size={16} />
      Publish
    </Button>
  )
}
