'use client'
import {Workflow} from '@/lib/generated/prisma'
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  getOutgoers,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow
} from '@xyflow/react'
import type {DragEvent} from 'react'

import {createFlowNode} from '@/lib/workflow/createFlowNode'
import {TaskRegistry} from '@/lib/workflow/task/registry'
import {AppNode} from '@/types/appNode'
import {TaskParamType, TaskType} from '@/types/TaskType'
import dagre from '@dagrejs/dagre'
import '@xyflow/react/dist/style.css'
import {useCallback, useEffect} from 'react'
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

// Default node dimensions used for dagre layout
const NODE_WIDTH = 200
const NODE_HEIGHT = 100

function getLayoutedElements(nodes: AppNode[], edges: Edge[], direction: 'TB' | 'LR' = 'LR') {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({rankdir: direction, ranksep: 80, nodesep: 60})

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.measured?.width ?? NODE_WIDTH,
      height: node.measured?.height ?? NODE_HEIGHT
    })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes: AppNode[] = nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id)
    const w = node.measured?.width ?? NODE_WIDTH
    const h = node.measured?.height ?? NODE_HEIGHT
    return {
      ...node,
      position: {
        x: dagreNode.x - w / 2,
        y: dagreNode.y - h / 2
      }
    }
  })

  return {nodes: layoutedNodes, edges}
}

export default function FlowEditor({workflow}: {workflow: Workflow}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const {setViewport, screenToFlowPosition, updateNodeData, fitView} = useReactFlow()

  useEffect(() => {
    try {
      const flow = JSON.parse(workflow.definition)
      if (!flow) return
      setNodes(flow.nodes || [])
      setEdges(flow.edges || [])
      if (!flow.viewport) return
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
      if (!connection.targetHandle) return
      const node = nodes.find((n) => n.id === connection.target)
      if (!node) return
      const nodeInputs = node.data?.inputs
      updateNodeData(node.id, {
        inputs: {
          ...nodeInputs,
          [connection.sourceHandle!]: ''
        }
      })
    },
    [setEdges, nodes, updateNodeData]
  )

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      if (connection.source === connection.target) return false

      const source = nodes.find((node) => node.id === connection.source)
      const target = nodes.find((node) => node.id === connection.target)
      if (!source || !target) {
        console.log('invalid connection source or target', connection)
        return false
      }

      const sourceTask = TaskRegistry[source.data.type]
      const targetTask = TaskRegistry[target.data.type]

      let output = sourceTask?.outputs?.find((output) => output.name === connection.sourceHandle)
      if (!output && sourceTask?.dynamicOutputPrefix && connection.sourceHandle?.startsWith(sourceTask.dynamicOutputPrefix)) {
        output = {name: connection.sourceHandle, type: TaskParamType.STRING}
      }

      const targetHandleName = connection.targetHandle?.includes('-input-')
        ? connection.targetHandle.split('-input-')[1]?.trim()
        : connection.targetHandle

      const input = targetTask?.inputs?.find((input) => input.name.trim() === targetHandleName)

      // Для задач с динамическими входами (ForEach, MergeArrays) все слоты имеют тип STRING
      const inputType = input?.type ?? (targetTask?.dynamicInputs ? TaskParamType.STRING : undefined)

      if (inputType !== output?.type) {
        console.log('Type mismatch:', inputType, output?.type)
        return false
      }

      const hasCycle = (node: AppNode, visited = new Set<string>()): boolean => {
        if (visited.has(node.id)) return false
        visited.add(node.id)
        const outgoers = getOutgoers(node, nodes, edges)
        for (const outgoer of outgoers) {
          if (outgoer.id === connection.source) return true
          if (hasCycle(outgoer, visited)) return true
        }
        return false
      }

      return !hasCycle(target)
    },
    [nodes, edges]
  )

  const handleAutoLayout = useCallback(() => {
    const {nodes: layoutedNodes, edges: layoutedEdges} = getLayoutedElements(nodes, edges, 'LR')
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
    // Fit view after layout with a short delay to allow positions to settle
    setTimeout(() => fitView(fitViewOptions), 50)
  }, [nodes, edges, setNodes, setEdges, fitView])

  return (
    <main className='w-full h-full'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        snapGrid={snapDrid}
        edgeTypes={edgeTypes}
        snapToGrid
        isValidConnection={isValidConnection}
        fitViewOptions={fitViewOptions}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onConnect={onConnect}
        minZoom={0.1}
        maxZoom={3}
      >
        <Controls fitViewOptions={fitViewOptions} position='top-left' />
        <Background variant={BackgroundVariant.Dots} gap={15} />

        {/* Auto-layout button */}
        <Panel position='top-right'>
          <button
            onClick={handleAutoLayout}
            title='Авто-расстановка нод'
            className='
              flex items-center gap-2
              px-3 py-2 rounded-lg
              bg-background border border-border
              text-sm font-medium text-foreground
              shadow-sm
              hover:bg-accent hover:text-accent-foreground
              active:scale-95
              transition-all duration-150
              cursor-pointer
            '
          >
            {/* Layout icon */}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='15'
              height='15'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <rect x='3' y='3' width='7' height='7' rx='1' />
              <rect x='14' y='3' width='7' height='7' rx='1' />
              <rect x='3' y='14' width='7' height='7' rx='1' />
              <rect x='14' y='14' width='7' height='7' rx='1' />
              <line x1='10' y1='6.5' x2='14' y2='6.5' />
              <line x1='10' y1='17.5' x2='14' y2='17.5' />
            </svg>
            Авто-расстановка
          </button>
        </Panel>
      </ReactFlow>
    </main>
  )
}
