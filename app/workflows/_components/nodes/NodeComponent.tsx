import { TaskRegistry } from "@/lib/workflow/task/registry"
import { AppNodeData } from "@/types/appNode"
import { NodeProps } from "@xyflow/react"
import { memo } from "react"
import NodeCard from "./NodeCard"
import NodeHeader from "./NodeHeader"
import NodeInputs, { NodeInput } from "./NodeInputs"
import NodeOutputs, { NodeOutput } from "./NodeOutputs"

const NodeComponent = memo((props:NodeProps)=>{
   const nodeData = props.data as AppNodeData

   const task = TaskRegistry[nodeData.type]
   return <NodeCard isSelected={!!props.selected} nodeId={props.id}>
      <NodeHeader taskType={nodeData.type}/>
      <NodeInputs >
         {task.inputs.map((input)=>{
            return <NodeInput key={input.name} input={input} nodeId={props.id}/>
         })}
      </NodeInputs>
      <NodeOutputs >
         {task.outputs.map((output)=>{
            return <NodeOutput key={output.name} output={output} nodeId={props.id}/>
         })}
      </NodeOutputs>
   </NodeCard>
})

export default NodeComponent
NodeComponent.displayName = "NodeComponent"