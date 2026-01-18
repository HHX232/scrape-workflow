'use client'

import { CreateCredential } from '@/actions/credentials/CreateCredential'
import CustomDialogHeader from '@/components/CustomDialogHeader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createCredentialSchema, createCredentialSchemaType } from '@/schema/credential'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2Icon, ShieldEllipsis } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export default function CreateCredentialDialog({triggerText}: {triggerText?: string}) {
  const [open, setOpen] = useState(false)

  const form = useForm<createCredentialSchemaType>({
    resolver: zodResolver(createCredentialSchema)
  })

  const {mutate, isPending} = useMutation({
    mutationFn: CreateCredential,
    onSuccess: ()=>{
      toast.dismiss()
      toast.success('Credential created successfully')
      form.reset()
      setOpen(false)
    },
    onError:()=>{
      toast.dismiss()
      toast.error('Failed to create Credential')
    }
  })

  const onSubmit = useCallback((values: createCredentialSchemaType)=>{
    toast.loading('Creating Credential...')
    mutate(values)
  },[mutate])
  return (
    <Dialog open={open} onOpenChange={(newOpen)=>{
      form.reset()
      setOpen(newOpen)}}>
      <DialogTrigger asChild>
        <Button>{triggerText ?? 'Create'}</Button>
      </DialogTrigger>
      <DialogContent className='px-0'>
        <CustomDialogHeader Icon={ShieldEllipsis} title='Create Credential' />
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
                      <FormDescription>enter a uniquer an descriptive name for the credential</FormDescription>
                      <FormMessage></FormMessage>
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={form.control}
                name='value'
                render={({field}) => {
                  return (
                    <FormItem>
                      <FormLabel className='flex gap-1 items-center'>
                        Value
                        <p className='text-xs text-primary'>(Required)</p>
                      </FormLabel>
                      <FormControl>
                        <Textarea className='resize-none' {...field} />
                      </FormControl>
                      <FormDescription>Enter the value associated with this credential
                        <br/>
                        This value will be encrypted and stored securely
                      </FormDescription>
                      <FormMessage></FormMessage>
                    </FormItem>
                  )
                }}
              />
              <Button disabled={isPending} className='w-full' type='submit'>{isPending ? <Loader2Icon className='animate-spin'/> : 'Create workflow'}</Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
