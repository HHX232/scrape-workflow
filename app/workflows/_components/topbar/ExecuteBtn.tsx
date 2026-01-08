'use client'

import { RunWorkflow } from "@/actions/workflows/runWorkflow"
import useExecutionPlan from "@/components/hooks/useExecutionPlan"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { useReactFlow } from "@xyflow/react"
import { PlayIcon } from "lucide-react"
import { toast } from "sonner"


export default function ExecuteBtn({workflowId}: {workflowId: string}) {
  const generate = useExecutionPlan()
  const {toObject} = useReactFlow();
  const mutation = useMutation({
    mutationFn: RunWorkflow,
    onSuccess:()=>{
      toast.success('Workflow executed successfully', {id:'flow-execution'});
    },
    onError:(error)=>{
      toast.error('Failed to execute workflow');
      console.error('Workflow execution failed:', error);
    }
  })
  return <Button
  disabled={mutation.isPending}
  onClick={()=>{
    const plan = generate()
   if(!plan){
    return;
   }
   mutation.mutate({workflowId, flowDefinition: JSON.stringify(toObject())});
  }} className="flex items-center gap-2" variant={'outline'}>
   <PlayIcon className="stroke-orange-400" size={16}/>
   Execute
  </Button>
}
