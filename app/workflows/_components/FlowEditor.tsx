'use client'
import { Workflow } from '@/lib/generated/prisma'
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow
} from '@xyflow/react'
import type { DragEvent } from 'react'

import { createFlowNode } from '@/lib/workflow/createFlowNode'
import { AppNode } from '@/types/appNode'
import { TaskType } from '@/types/TaskType'
import '@xyflow/react/dist/style.css'
import { useCallback, useEffect } from 'react'
import DeletableEdge from './edges/DeletableEdge'
import NodeComponent from './nodes/NodeComponent'

const nodeTypes = {
  FlowScrapeNode: NodeComponent
}
const edgeTypes = {
  default: DeletableEdge
}
const snapDrid: [number, number] = [50, 50]
const fitViewOptions = {padding: 1.5}

export default function FlowEditor({workflow}: {workflow: Workflow}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const {setViewport, screenToFlowPosition, updateNodeData} = useReactFlow()
  useEffect(() => {
    try {
      const flow = JSON.parse(workflow.definition)
      if (!flow) return
      setNodes(flow.nodes || [])
      setEdges(flow.edges || [])
      if (!flow.viewport) {
        return
      }
      const {x = 0, y = 0, zoom = 1} = flow.viewport
      setViewport({x, y, zoom})
    } catch (error) {}
  }, [workflow.definition, setEdges, setNodes, setViewport])

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    if (!event.dataTransfer) return

    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      if (!event.dataTransfer) return

      const taskType = event.dataTransfer.getData('application/reactflow')

      if (!taskType) return

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      })
      const newNode = createFlowNode(taskType as TaskType, position)

      setNodes((nds) => [...nds, newNode])
    },
    [setNodes, screenToFlowPosition]
  )
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({...connection, animated: true}, eds))
       if(!connection.targetHandle) return
       const node = nodes.find(n => n.id === connection.target)
       if (!node) return
       const nodeInputs = node.data?.inputs 
       updateNodeData(node.id, { inputs: {
        ...nodeInputs,
        [connection.sourceHandle!]: ''
       } })
    },
   
    [setEdges, nodes, updateNodeData]
  )

  return (
    <main className=' w-full h-full'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        snapGrid={snapDrid}
        edgeTypes={edgeTypes}
        snapToGrid
        // fitView
        fitViewOptions={fitViewOptions}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onConnect={onConnect}
      >
        <Controls fitViewOptions={fitViewOptions} position='top-left' />
        <Background variant={BackgroundVariant.Dots} gap={15} />
      </ReactFlow>
    </main>
  )
}
