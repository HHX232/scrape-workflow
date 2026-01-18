'use client'

import { removeWorkflowSchedule } from '@/actions/workflows/removeWorkflowSchedule'
import { UpdateWorkflowCron } from '@/actions/workflows/UpdateWorkflowCron'
import CustomDialogHeader from '@/components/CustomDialogHeader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { DialogClose } from '@radix-ui/react-dialog'
import { useMutation } from '@tanstack/react-query'

import parser from 'cron-parser'
import cronstrue from 'cronstrue'
import { CalendarIcon, ClockIcon, TriangleAlertIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function SchedulerDialog(props: {workflowId: string; cron: string}) {
  const [cron, setCron] = useState(props.cron)
  const [validCron, setValidCron] = useState(false)
  const [readableCron, setReadableCron] = useState('')
  const mutation = useMutation({
    mutationFn: UpdateWorkflowCron,
    onSuccess: () => {
      toast.success('Workflow schedule updated successfully', {id: 'cron'})
    },
    onError: () => {
      toast.error('Failed to update workflow schedule', {id: 'cron'})
    }
  })
  const removeScheduleMutation = useMutation({
    mutationFn: removeWorkflowSchedule,
    onSuccess: () => {
      toast.success('Workflow schedule removed successfully', {id: 'cron'})
    },
    onError: () => {
      toast.error('Failed to remove workflow schedule', {id: 'cron'})
    }
  })

  useEffect(() => {
    try {
      parser.parseExpression(cron)
      const humanCronStr = cronstrue.toString(cron)
      setValidCron(true)
      setReadableCron(humanCronStr)
    } catch (e) {
      setValidCron(false)

      console.error(e)
    }
  }, [cron])

  const workflowHasValidCron = props.cron && props.cron.length > 0

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={'link'}
          size={'sm'}
          className={cn('text-sm p-0 h-auto text-orange-500', workflowHasValidCron && 'text-primary')}
        >
          {workflowHasValidCron && (
            <div className='flex items-center gap-2'>
              <ClockIcon />
              {readableCron}
            </div>
          )}
          {!workflowHasValidCron && (
            <div className='flex items-center gap-1'>
              <TriangleAlertIcon className='h-3 w-3' />
              Set schedule
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className='px-0'>
        <CustomDialogHeader title='Schedule workflow execution' Icon={CalendarIcon}></CustomDialogHeader>
        <div className='p-6 space-y-4'>
          <p className='text-muted-foreground'> Specify a cron expressionn to schedule periodic workflow execution</p>
          <Input value={cron} onChange={(e) => setCron(e.target.value)} placeholder='E.g. * * * * *' />

          <div
            className={cn(
              'bg-accent rounded-md p-4 border text-sm border-destructive text-destructive',
              workflowHasValidCron && 'border-primary text-primary'
            )}
          >
            {workflowHasValidCron ? readableCron : 'Not a valid cron expression'}
          </div>
          {workflowHasValidCron && (
            <DialogClose asChild>
              <div className=''>
                <Button onClick={()=>{
                  toast.loading("Removing schedule...", {id:"cron"})
                  removeScheduleMutation.mutate(props.workflowId)
                }} disabled={mutation.isPending || removeScheduleMutation.isPending} variant={'outline'} className='w-full text-destructive border-destructive hover:text-destructive'>Remove current Schedule</Button>
                <Separator className='my-4'/>
              </div>
            </DialogClose>
          )}
        </div>
        <DialogFooter className='px-6 gap-2'>
          <DialogClose asChild>
            <Button className='w-full' variant={'secondary'}>
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className='w-full'
              disabled={mutation.isPending || !validCron}
              onClick={() => {
                toast.loading('Saving...', {id: 'cron'})
                mutation.mutate({id: props.workflowId, cron})
              }}
            >
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
