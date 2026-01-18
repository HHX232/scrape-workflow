'use client'
import TooltipWrapper from '@/components/TooltipWrapper'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Workflow } from '@/lib/generated/prisma'
import { cn } from '@/lib/utils'
import { WorkflowExecutionStatus, WorkflowStatus } from '@/types/workflow'

import ExecutionStatusIndicator from '@/app/workflow/runs/[workflowId]/_components/ExecutionStatusIndicator'
import { Badge } from '@/components/ui/badge'
import { CoinsIcon, CornerDownRightIcon, FileTextIcon, MoreVerticalIcon, MoveRightIcon, PlayIcon, ShuffleIcon, TrashIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import SchedulerDialog from '../SchedulerDialog'
import DeleteWorkflowDialog from './DeleteWorkflowDialog'
import RunBtn from './RunBtn'

export default function WorkflowCard({workflow}: {workflow: Workflow}) {
  const isDraft = workflow.status === WorkflowStatus.DRAFT
  const statusColors = {
    [WorkflowStatus.DRAFT]: 'bg-yellow-300 text-yellow-600',
    [WorkflowStatus.PUBLISHED]: 'bg-primary'
  }
  return (
    <Card className='border border-separate shadow-sm overflow-hidden rounded-lg hover:shadow-md dark:shadow-primary/30'>
      <CardContent className='p-4 flex items-center justify-between h-[100px]'>
        <div className='flex items-center justify-end space-x-3'>
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              statusColors[workflow.status as WorkflowStatus]
            )}
          >
            {isDraft ? <FileTextIcon className='h-5 w-5 text-white' /> : <PlayIcon className='h-5 w-5 text-white' />}
          </div>
          <div>
            <h3 className='text-base font-bold text-muted-foreground flex items-center'>
              <Link className='flex items-center hover:underline' href={`/workflows/editor/${workflow.id}`}>
                {workflow.name}
              </Link>
              {isDraft && (
                <span className='ml-2 px-2 py-0.5 text-xs font-medium rounded-full text-yellow-800 bg-yellow-100'>
                  Draft
                </span>
              )}
            </h3>
            <ScheduleSection cron={workflow.cron || ''} creditsCost={workflow.creditsCost} isDraft={isDraft} workflowId={workflow.id}/>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          {!isDraft && <RunBtn workflowId={workflow.id}/>}
          <Link
            className={cn(buttonVariants({variant: 'outline', size: 'sm'}), 'flex items-center gap-2')}
            href={`/workflows/editor/${workflow.id}`}
          >
            <ShuffleIcon size={16} />
            Edit
          </Link>
          <WorkflowActions  workflow={workflow} />
        </div>
      </CardContent>
      <LastRunDetails workflow={workflow}/>
    </Card>
  )
}

function WorkflowActions({workflow}: {workflow: Workflow}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  return (
    <>
      <DeleteWorkflowDialog
        workflowName={workflow.name}
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        workflowId={workflow.id}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'outline'} size={'sm'}>
            <TooltipWrapper content='More actions'>
              <div className='flex items-center justify-center w-full h-full'>
                <MoreVerticalIcon size={18} />
              </div>
            </TooltipWrapper>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='text-destructive flex items-center gap-2'
            onSelect={() => setShowDeleteDialog(true)}
          >
            <TrashIcon size={16} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}




export function ScheduleSection({ isDraft ,creditsCost, workflowId, cron }: { isDraft: boolean, creditsCost: number, workflowId: string, cron: string }) {
  return (
    <div className="flex items-center gap-2">
      <CornerDownRightIcon className="h-4 w-4 text-muted-foreground" />
      <SchedulerDialog key={`${cron}-${workflowId}`} cron={cron} workflowId={workflowId} />
      <MoveRightIcon className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-3">
        <Badge variant="outline">
          <span className="flex space-x-2 text-muted-foreground rounded-sm">
            <CoinsIcon className="h-4 w-4" />
            <span className='text-sm '>{creditsCost}</span>
          </span>
        </Badge>
      </div>
    </div>
  );
}

function LastRunDetails({workflow}: {workflow: Workflow}){
  const {lastRunAt, lastRunStatus} = workflow
  return <div>
    <div className="">
      {lastRunAt && <Link href={""}>
    <span>Last run</span>
    <ExecutionStatusIndicator status={lastRunStatus as WorkflowExecutionStatus}/>
    </Link>}
    </div>
  </div>
}