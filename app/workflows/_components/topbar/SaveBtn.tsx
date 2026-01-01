'use client'

import { UpdateWorkflow } from '@/actions/workflows/updateWorkflow'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { useReactFlow } from '@xyflow/react'
import { CheckIcon } from 'lucide-react'
import { toast } from 'sonner'

export default function SaveBtn({workflowId}: {workflowId: string}) {
   
   const {toObject} = useReactFlow()
   const saveMutation = useMutation({
      mutationFn:UpdateWorkflow,
      onSuccess:()=>{
         toast.dismiss()
         toast.success('flow save success')
      },
      onError:()=>{
         toast.dismiss()
         toast.error('flow save success')
      },
      
   })
   
  return (
   <Button disabled={saveMutation.isPending} variant={'outline'} className='flex items-center gap-2' onClick={()=>{
     const workflowDefinition = JSON.stringify(toObject())
    const l = toast.loading('Saving flow...')
     saveMutation.mutate({
        id:workflowId,
        definition:workflowDefinition
     })
     
   }}>
      <CheckIcon size={16} className='stroke-green-400'/>
      Save
   </Button>
  )
}
