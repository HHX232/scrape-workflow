'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import { AppNodeData } from '@/types/appNode'
import { TaskParamType } from '@/types/TaskType'
import { useReactFlow, NodeProps } from '@xyflow/react'
import { PlusIcon, MinusIcon } from 'lucide-react'
import { memo } from 'react'
import NodeCard from './NodeCard'
import NodeHeader from './NodeHeader'
import NodeInputs, { NodeInput } from './NodeInputs'
import NodeOutputs, { NodeOutput } from './NodeOutputs'

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

// Slot 1 → prefix, slot 2+ → "prefix 2", "prefix 3", …
const slotName = (prefix: string, i: number) => (i === 1 ? prefix : `${prefix} ${i}`)

function DynamicInputs({ nodeId, count, prefix }: { nodeId: string; count: number; prefix: string }) {
  const { updateNodeData, getNode } = useReactFlow()

  const setCount = (next: number) => {
    const node = getNode(nodeId)
    if (!node) return
    updateNodeData(nodeId, { ...node.data, dynamicInputCount: next })
  }

  return (
    <>
      {Array.from({ length: count }, (_, i) => i + 1).map(i => (
        <NodeInput
          key={slotName(prefix, i)}
          input={{ name: slotName(prefix, i), type: TaskParamType.STRING, required: i === 1, hideHandle: false }}
          nodeId={nodeId}
        />
      ))}
      <div className='flex gap-1 p-2'>
        <Button size='sm' variant='outline' className='flex-1 gap-1 text-xs' onClick={() => setCount(count + 1)}>
          <PlusIcon size={12} /> Добавить
        </Button>
        {count > 1 && (
          <Button size='sm' variant='outline' className='gap-1 text-xs text-destructive' onClick={() => setCount(count - 1)}>
            <MinusIcon size={12} />
          </Button>
        )}
      </div>
    </>
  )
}

function DynamicOutputs({ nodeId, count, prefix }: { nodeId: string; count: number; prefix: string }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => i + 1).map(i => (
        <NodeOutput
          key={slotName(prefix, i)}
          output={{ name: slotName(prefix, i), type: TaskParamType.STRING }}
          nodeId={nodeId}
        />
      ))}
    </>
  )
}

const NodeComponent = memo((props: NodeProps) => {
  const nodeData = props.data as AppNodeData
  const task = TaskRegistry[nodeData.type]
  const count = nodeData.dynamicInputCount ?? 1

  return (
    <NodeCard isSelected={!!props.selected} nodeId={props.id}>
      {DEV_MODE && <Badge>DEV: {props.id}</Badge>}
      <NodeHeader taskType={nodeData.type} nodeId={props.id} />
      <NodeInputs>
        {task?.dynamicInputs ? (
          <DynamicInputs nodeId={props.id} count={count} prefix={task.dynamicInputPrefix ?? 'Array'} />
        ) : (
          task?.inputs?.map(input => <NodeInput key={input.name} input={input} nodeId={props.id} />)
        )}
      </NodeInputs>
      <NodeOutputs>
        {task?.dynamicOutputPrefix && (
          <DynamicOutputs nodeId={props.id} count={count} prefix={task.dynamicOutputPrefix} />
        )}
        {task?.outputs?.map(output => <NodeOutput key={output.name} output={output} nodeId={props.id} />)}
      </NodeOutputs>
    </NodeCard>
  )
})

export default NodeComponent
NodeComponent.displayName = 'NodeComponent'
