'use client'

import { cn } from '@/lib/utils'
import { useReactFlow } from '@xyflow/react'
import React from 'react'

export default function NodeCard({nodeId, children, isSelected}: {nodeId: string, children: React.ReactNode, isSelected: boolean}) {
   const {getNode, setCenter} = useReactFlow()
  return (
    <div
    onDoubleClick={()=>{
const node = getNode(nodeId)
if(!node)return 
const {position, measured} = node
if(!position || !measured)return 
const {width,height} = measured
const x = position.x 
const y = position.y
if(x === undefined || y === undefined)return
setCenter((x + (width || 420))/2 ,y, {
   zoom:1,
   duration:500
})
    }}
    className={cn('rounded-md cursor-pointer bg-background border-separate w-[500px] text-sc gap-1 flex flex-col border-2  p-1', isSelected && 'border-primary')}>{children}</div>
  )
}
