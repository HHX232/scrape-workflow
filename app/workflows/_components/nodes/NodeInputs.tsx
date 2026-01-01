import { cn } from '@/lib/utils'
import { TaskParam } from '@/types/TaskType'
import { Handle, Position } from '@xyflow/react'
import React from 'react'
import NodeParamField from './NodeParamField'
import { colorForHandle } from './common'

export default function NodeInputs({children}: {children: React.ReactNode}) {
  return (
    <div className='flex flex-col divide-y gap-2'>
      {children}
    </div>
  )
}

export function NodeInput({input, nodeId}: {input: TaskParam, nodeId: string}) {
   return (
      <div className='flex justify-start relative p-3 bg-secondary w-full'>
        <NodeParamField nodeId={nodeId} param={input}/>
        {!input.hideHandle && (
          <Handle 
            position={Position.Left} 
            id={`${nodeId}-input-${input.name}`}
            type="target"
            className={cn('!bg-muted-foreground !border-2 !border-background !-left-2 !w-4 !h-4', colorForHandle[input.type])}
          />
        )}
      </div>
   )
}