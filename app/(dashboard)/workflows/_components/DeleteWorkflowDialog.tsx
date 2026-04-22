'use client'

import { deleteWorkflow } from "@/actions/workflows/deleteWorkflow"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"



export default function DeleteWorkflowDialog({open, setOpen, workflowName, workflowId}: {open: boolean, setOpen: (open: boolean) => void, workflowName: string, workflowId: string}) {
const [confirmText, setConfirmText] = useState('')

const deleteMutation = useMutation({
   mutationFn: deleteWorkflow,
   onSuccess: ()=>{
      toast.dismiss()
      toast.success('Workflow deleted successfully')
   },
   onError: ()=>{
      toast.dismiss()
      toast.error('Failed to delete workflow')
   }
})
  return (
 <AlertDialog open={open} onOpenChange={(newOpen)=>{
   setOpen(newOpen)
 }}>
   <AlertDialogContent>
      <AlertDialogHeader>
         <AlertDialogTitle>Delete workflow</AlertDialogTitle>
         <AlertDialogDescription>
           If you delete this workflow, it will be permanently removed and cannot be recovered.
           <div className="flex flex-col py-4 gap-2 items-center">
            <p>If you are sure, enter <b>{workflowName}</b> to confirm:</p>
            <Input value={confirmText} onChange={(e)=> setConfirmText(e.target.value)}/>
           </div>
         </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
         <AlertDialogCancel>Cancel</AlertDialogCancel>
         <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={confirmText !== workflowName || deleteMutation.isPending} onClick={(e)=> {
            e.stopPropagation()
            toast.loading('Deleting workflow...'),{id:workflowId}
            deleteMutation.mutate(workflowId)}}>Delete</AlertDialogAction>
      </AlertDialogFooter>
   </AlertDialogContent>
 </AlertDialog>
  )
}
