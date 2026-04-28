'use client'

import useExecutionPlan from "@/components/hooks/useExecutionPlan"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { useReactFlow } from "@xyflow/react"
import { PlayIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ExecuteBtn({workflowId}: {workflowId: string}) {
  const generate = useExecutionPlan()
  const {toObject} = useReactFlow()
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: async ({ id, flowDefinition }: { id: string; flowDefinition: string }) => {
      const res = await fetch(`/api/workflows/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowDefinition }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to run workflow')
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success('Workflow execution started', {id: 'flow-execution'})
      if (data.redirectUrl) router.push(data.redirectUrl)
    },
    onError: (error) => {
      console.error('Workflow execution failed', error)
      toast.error('Failed to execute workflow')
    }
  })

  return (
    <Button
      disabled={mutation.isPending}
      onClick={() => {
        const plan = generate()
        if (!plan) return
        mutation.mutate({id: workflowId, flowDefinition: JSON.stringify(toObject())})
      }}
      className="flex items-center gap-2"
      variant={'outline'}
    >
      <PlayIcon className="stroke-orange-400" size={16} />
      Execute
    </Button>
  )
}
