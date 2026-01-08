import useFlowValidation from '@/components/hooks/useFlowValidation'
import { cn } from '@/lib/utils'
import { TaskParam } from '@/types/TaskType'
import { Handle, Position, useEdges } from '@xyflow/react'
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
  const {invalidInputs} = useFlowValidation()
  const edges = useEdges()
  const isConnected = edges.some(
    edge => edge.target === nodeId && edge.targetHandle === `${nodeId}-input-${input.name}`
  );

  const hasErrors = invalidInputs.find(node => node.nodeId === 
    nodeId)?.missingInputs.find(invalidInput => invalidInput === input.name)
    
   return (
      <div className={cn('flex justify-start relative p-3 bg-secondary w-full', hasErrors && 'bg-destructive/30')}>
        <NodeParamField nodeId={nodeId} param={input} disabled={isConnected}/>
        {!input.hideHandle && (
          <Handle 
          isConnectable={!isConnected}
            position={Position.Left} 
            id={`${nodeId}-input-${input.name}`}
            type="target"
            className={cn('!bg-muted-foreground !border-2 !border-background !-left-2 !w-4 !h-4', colorForHandle[input.type])}
          />
        )}
      </div>
   )
}