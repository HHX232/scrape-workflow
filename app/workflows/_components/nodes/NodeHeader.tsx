'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import { TaskType } from '@/types/TaskType'
import { CoinsIcon, GripVerticalIcon } from 'lucide-react'

export default function NodeHeader({taskType}: {taskType: TaskType}) {
  const task = TaskRegistry[taskType]
  return (
    <div className='flex items-center gap-2 p-2'>
      <task.icon size={20} />
      <div className='flex justify-between items-center w-full '>
        <p className='text-sc font-bold uppercase text-muted-foreground'>{task.label}</p>
        <div className='flex gap-1 items-center'>
          {task.isEntryPoint && (
            <Badge className='gap-2 flex items-center text-xs'>
              <CoinsIcon size={20} />
              Entry point
            </Badge>
          )}
          <Button variant={'ghost'} size={'icon'} className='drag-handle cursor-grab'>
            <GripVerticalIcon size={40}/>
          </Button>
        </div>
      </div>
    </div>
  )
}
