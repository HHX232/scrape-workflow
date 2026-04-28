'use client'

import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { PlayIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function RunBtn({ workflowId }: { workflowId: string }) {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/workflows/${id}/run`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to run workflow')
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success('Workflow started', { id: workflowId })
      if (data.redirectUrl) router.push(data.redirectUrl)
    },
    onError: (error) => {
      console.error('Failed to run workflow', error)
      toast.error('Something went wrong', { id: workflowId })
    },
  })

  return (
    <Button
      variant={'outline'}
      size={'sm'}
      className="flex items-center gap-2"
      disabled={mutation.isPending}
      onClick={() => {
        toast.loading('Scheduling run...', {id: workflowId})
        mutation.mutate(workflowId)
      }}
    >
      <PlayIcon size={16} />
      Run
    </Button>
  )
}
