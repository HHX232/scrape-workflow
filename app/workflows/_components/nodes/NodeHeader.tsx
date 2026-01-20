'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createFlowNode } from '@/lib/workflow/createFlowNode'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import { AppNode } from '@/types/appNode'
import { TaskType } from '@/types/TaskType'
import { useReactFlow } from '@xyflow/react'
import { CoinsIcon, CopyIcon, GripVerticalIcon, TrashIcon } from 'lucide-react'

export default function NodeHeader({taskType, nodeId}: {taskType: TaskType, nodeId: string}) {
  const task = TaskRegistry[taskType]
  const {deleteElements, getNode, addNodes} = useReactFlow()
  return (
    <div className='flex items-center gap-2 p-2'>
     {task?.icon && <task.icon size={20} />}
      <div className='flex justify-between items-center w-full '>
        <p className='text-sc font-bold uppercase text-muted-foreground'>{task?.label}</p>

        <div className='flex gap-1 items-center'>
          {task?.isEntryPoint && (
            <Badge className='gap-2 h-[26px] flex items-center text-xs'>
              {/* <CoinsIcon size={20} /> */}
              Entry point
            </Badge>
          )}
          <Badge className='gap-2 flex items-center text-xs'>
            <CoinsIcon size={20}/>
            {task?.credits} 
          </Badge>
          {!task?.isEntryPoint && <>
          <Button onClick={()=>{
            deleteElements({nodes:[{id:nodeId}]})
          }} 
          variant={'ghost'} size={'icon'} >
            <TrashIcon size={12}/>
          </Button>
           <Button  onClick={()=>{
            const node = getNode(nodeId) as AppNode
            const newX = node.position.x
            const newY = node.position.y
            const newNode = createFlowNode(node.data.type, {
              x:newX + 200,
              y:newY - 100
            })
            addNodes([newNode])
          }} variant={'ghost'} size={'icon'} >
            <CopyIcon size={12}/>
          </Button>
          </>}
          <Button variant={'ghost'} size={'icon'} className='drag-handle cursor-grab'>
            <GripVerticalIcon size={40}/>
          </Button>
        </div>
      </div>
    </div>
  )
}
