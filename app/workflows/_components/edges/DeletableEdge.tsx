'use client'

import { Button } from "@/components/ui/button";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath, useReactFlow } from "@xyflow/react";

export default function DeletableEdge(props: EdgeProps){
   const [edgePath, labelX, labelY] = getSmoothStepPath({
      ...props
   })
   const {setEdges} = useReactFlow()
   return <><BaseEdge path={edgePath} markerEnd={props.markerEnd} style={props.style}/>
   <EdgeLabelRenderer>
      <div style={{
         position:'absolute',
         transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
         pointerEvents:'all'
      }}>
         <Button className="w-5 h-5 cursor-pointer rounded-full text-cs leading-none hover:shadow-lg aspect-square p-2 bg-white hover:bg-stone-100" onClick={()=>{
            setEdges(edges =>edges.filter((edge)=>edge.id !== props.id))
         }}>X</Button>
      </div>
      </EdgeLabelRenderer></>
}