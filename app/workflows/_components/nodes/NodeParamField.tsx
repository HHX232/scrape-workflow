'use client'
import { AppNode } from '@/types/appNode'
import { TaskParam, TaskParamType } from '@/types/TaskType'
import { useReactFlow } from '@xyflow/react'
import { useCallback } from 'react'
import BrowserInstanceParam from './param/BrowserInstanceParam'
import SelectParam from './param/SelectParam'
import StringParam from './param/StringParam'
import CredentialsParam from './param/CredentialsParam'

export default function NodeParamField({
  param,
  nodeId,
  disabled
}: {
  param: TaskParam
  nodeId: string
  disabled?: boolean
}) {
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
      return <StringParam disabled={disabled} param={param} value={value} updateNodeParamValue={updateNodeParamValue} />
    case TaskParamType.BROWSER_INSTANCE:
      return (
        <BrowserInstanceParam
          param={param}
          value={''}
          updateNodeParamValue={updateNodeParamValue}
        ></BrowserInstanceParam>
      )
    case TaskParamType.SELECT:
      return (
        <SelectParam
          param={param}
          value={value}
          updateNodeParamValue={updateNodeParamValue}
          disabled={disabled}
        ></SelectParam>
      )
    case TaskParamType.CREDENTIAL:
      return (
        <CredentialsParam
          param={param}
          value={value}
          updateNodeParamValue={updateNodeParamValue}
          disabled={disabled}
        ></CredentialsParam>
      )
    default:
      return <p className='text-xs text-muted-foreground'>Not implemented</p>
  }
}
