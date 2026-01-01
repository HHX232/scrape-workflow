'use client'
import { AppNode } from '@/types/appNode'
import { TaskParam, TaskParamType } from '@/types/TaskType'
import { useReactFlow } from '@xyflow/react'
import { useCallback } from 'react'
import StringParam from './param/StringParam'
import BrowserInstanceParam from './param/BrowserInstanceParam'

export default function NodeParamField({param, nodeId}: {param: TaskParam; nodeId: string}) {
  const {updateNodeData, getNode} = useReactFlow()
  const node = getNode(nodeId) as AppNode
  const value = node?.data?.inputs[param.name]

  const updateNodeParamValue = useCallback(
    (value: string) => {
      updateNodeData(nodeId, {
        inputs: {
          ...node?.data?.inputs,
          [param.name]: value
        }
      })
    },
    [node?.data?.inputs, nodeId, param.name, updateNodeData]
  )
  switch (param.type) {
    case TaskParamType.STRING:
      return <StringParam param={param} value={value} updateNodeParamValue={updateNodeParamValue} />
      case TaskParamType.BROWSER_INSTANCE:
         return <BrowserInstanceParam
         param={param}
         value={""}
         updateNodeParamValue={updateNodeParamValue}
         ></BrowserInstanceParam>
    default:
      return <p className='text-xs text-muted-foreground'>Not implemented</p>
  }
}
