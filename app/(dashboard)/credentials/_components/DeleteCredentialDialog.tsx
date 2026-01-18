'use client'

import {DeleteCredential} from '@/actions/credentials/DeleteCredential'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {AlertDialogTrigger} from '@radix-ui/react-alert-dialog'
import {useMutation} from '@tanstack/react-query'
import {XIcon} from 'lucide-react'
import {useState} from 'react'
import {toast} from 'sonner'

export default function DeleteCredentialDialog({name}: {name: string}) {
  const [confirmText, setConfirmText] = useState('')
  const [open, setOpen] = useState(false)
  const deleteMutation = useMutation({
    mutationFn: DeleteCredential,
    onSuccess: () => {
      toast.dismiss()
      toast.success('Credential deleted successfully')
    },
    onError: () => {
      toast.dismiss()
      toast.error('Failed to delete Credential')
    }
  })
  return (
    <AlertDialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
      }}
    >
      <AlertDialogTrigger asChild>
        <Button size={'icon'} variant='destructive'>
          <XIcon size={18} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete credential</AlertDialogTitle>
          <AlertDialogDescription>
            If you delete this credential, it will be permanently removed and cannot be recovered.
            <div className='flex flex-col py-4 gap-2 items-center'>
              <p>
                If you are sure, enter <b>{name}</b> to confirm:
              </p>
              <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            disabled={confirmText !== name || deleteMutation.isPending}
            onClick={(e) => {
              e.stopPropagation()
              toast.loading('Deleting credential...'), {id: name}
              deleteMutation.mutate(name)
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
