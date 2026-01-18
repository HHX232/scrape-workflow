'use client'

import { UnpublishWorkflow } from "@/actions/workflows/UnpublishWorkflow"
import useExecutionPlan from "@/components/hooks/useExecutionPlan"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { useReactFlow } from "@xyflow/react"
import { UploadIcon } from "lucide-react"
import { toast } from "sonner"


export default function UnPublishBtn({workflowId}: {workflowId: string}) {
  const generate = useExecutionPlan()
  const {toObject} = useReactFlow();
  const mutation = useMutation({
    mutationFn: UnpublishWorkflow,
    onSuccess:()=>{
      toast.success('Workflow unpublished', {id:workflowId});
    },
    onError:(error)=>{
      toast.error('Failed to unpublish workflow', {id:workflowId});
      console.error('Workflow unpublish failed:', error);
    }
  })

  return <Button
  disabled={mutation.isPending}
  onClick={()=>{
   toast.loading("Unpublishing workflow...", {id:workflowId})
   mutation.mutate(workflowId)
  }} className="flex items-center gap-2" variant={'outline'}>
   <UploadIcon className="stroke-green-400" size={16}/>
   Unpublish
  </Button>
}
