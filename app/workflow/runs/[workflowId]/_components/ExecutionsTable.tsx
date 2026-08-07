'use client'
import { GetWorkflowExecutions } from '@/actions/workflows/GetWorkflowExecutions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DatesToDurationString } from '@/lib/helper/date'
import { WorkflowExecutionStatus } from '@/types/workflow'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { CoinsIcon, Loader2Icon, Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ExecutionStatusIndicator from './ExecutionStatusIndicator'

type InitialDataType = Awaited<ReturnType<typeof GetWorkflowExecutions>>

export default function ExecutionsTable({workflowId, initialData}: {workflowId: string; initialData: InitialDataType}) {
  const query = useQuery({
    queryKey: ['executions', workflowId],
    initialData,
    queryFn: () => GetWorkflowExecutions(workflowId),
    refetchInterval: 5000
  })
  const router = useRouter()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (executionId: string) => {
      const res = await fetch(`/api/workflows/delete-run/${executionId}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Не удалось удалить прогон')
      }
    },
    onSuccess: () => {
      toast.success('Прогон удалён')
      queryClient.invalidateQueries({ queryKey: ['executions', workflowId] })
    },
    onError: (err: Error) => toast.error(err.message)
  })

  return (
    <div className='border rounded-lg shadow-md overflow-auto'>
      <Table className='h-full'>
        <TableHeader className='bg-muted'>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Consumed</TableHead>
            <TableHead className='text-right text-xs text-muted-foreground'>Started at (desc)</TableHead>
            <TableHead className='w-10'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='gap-2 h-full overflow-auto'>
          {query.data.map((execution) => {
            const duration = DatesToDurationString(execution.startedAt, execution.completedAt)
            const formattedStartedAt = execution.startedAt && formatDistanceToNow(execution.startedAt, { addSuffix: true })

            return (
              <TableRow onClick={()=>{router.push(`/workflow/runs/${workflowId}/${execution.id}`)}} key={execution.id} className='cursor-pointer'>
                <TableCell>
                  <div className='flex flex-col'>
                    <span className='font-semibold'>{execution.id}</span>
                    <div className='text-muted-foreground text-xs'>
                      <span>Triggered via</span>
                      <Badge variant={'outline'}>{execution.trigger}</Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex gap-2 items-center'>
                    <div>
                     <ExecutionStatusIndicator status={execution.status as any}/>
                    </div>
                    <span className='font-semibold capitalize'>{execution.status}</span>
                    <div className='text-muted-foreground text-xs mx-5'>{duration}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex flex-col'>
                    <div className='flex gap-2 items-center'>
                      <CoinsIcon size={16} className='text-primary' />
                      <span className='font-semibold capitalize'>{execution.creditsConsumed}</span>
                    </div>
                    <div className='text-muted-foreground text-xs mx-5'>Credits</div>
                  </div>
                </TableCell>
                <TableCell className='text-right text-muted-foreground'>{formattedStartedAt}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-muted-foreground hover:text-destructive'
                        disabled={execution.status === WorkflowExecutionStatus.RUNNING || deleteMutation.isPending}
                        title={execution.status === WorkflowExecutionStatus.RUNNING ? 'Останови выполнение перед удалением' : 'Удалить прогон'}
                      >
                        <Trash2Icon size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить прогон навсегда?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Прогон {execution.id} и все его фазы/логи будут удалены безвозвратно. Это действие нельзя отменить.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                          onClick={() => deleteMutation.mutate(execution.id)}
                        >
                          {deleteMutation.isPending ? <Loader2Icon size={14} className='animate-spin' /> : 'Удалить'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
