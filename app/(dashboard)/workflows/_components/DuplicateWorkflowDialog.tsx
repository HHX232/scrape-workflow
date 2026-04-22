'use client'

import { DuplicateWorkflow } from '@/actions/workflows/DuplicateWorkflow'
import CustomDialogHeader from '@/components/CustomDialogHeader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { duplicateWorkflowSchema, duplicateWorkflowSchemaType } from '@/schema/workflow'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { CopyIcon, Layers2Icon, Loader2Icon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export default function DuplicateWorkflowDialog({workflowId}: {workflowId?: string}) {
  const [open, setOpen] = useState(false)

  const form = useForm<duplicateWorkflowSchemaType>({
    resolver: zodResolver(duplicateWorkflowSchema),
    defaultValues: {
      workflowId
    }
  })

  const {mutate, isPending} = useMutation({
    mutationFn: DuplicateWorkflow,
    onSuccess: () => {
      toast.dismiss()
      toast.success('Workflow duplicate successfully')
      setOpen(prev=>!prev)
    },
    onError: () => {
      toast.dismiss()
      toast.error('Failed to duplicate workflow')
    }
  })

  const onSubmit = useCallback(
    (values: duplicateWorkflowSchemaType) => {
      toast.loading('Duplicate workflow...')
      mutate(values)
    },
    [mutate]
  )
  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        form.reset()
        setOpen(newOpen)
      }}
    >
      <DialogTrigger asChild>
        <Button className={cn('ml-2 transition-opacity duration-200 opacity-0 group-hover/card:opacity-100')} variant={'ghost'} size={'icon'}>
        <CopyIcon className='w-4 h-4 text-muted-foreground cursor-pointer'/>
        </Button>
      </DialogTrigger>
      <DialogContent className='px-0'>
        <CustomDialogHeader Icon={Layers2Icon} title='Duplicate workflow' />
        <div className='p-6'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 w-full'>
              <FormField
                control={form.control}
                name='name'
                render={({field}) => {
                  return (
                    <FormItem>
                      <FormLabel className='flex gap-1 items-center'>
                        Name
                        <p className='text-xs text-primary'>(Required)</p>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Choose a description and unique name</FormDescription>
                      <FormMessage></FormMessage>
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={form.control}
                name='description'
                render={({field}) => {
                  return (
                    <FormItem>
                      <FormLabel className='flex gap-1 items-center'>
                        Description
                        <p className='text-xs text-muted-foreground'>(Optional)</p>
                      </FormLabel>
                      <FormControl>
                        <Textarea className='resize-none' {...field} />
                      </FormControl>
                      <FormDescription>Provide a brief description of what your workflow does</FormDescription>
                      <FormMessage></FormMessage>
                    </FormItem>
                  )
                }}
              />
              <Button disabled={isPending} className='w-full' type='submit'>
                {isPending ? <Loader2Icon className='animate-spin' /> : 'Create workflow'}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
