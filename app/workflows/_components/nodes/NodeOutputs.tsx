'use client'
import { cn } from '@/lib/utils';
import { TaskParam } from '@/types/TaskType';
import { Handle, Position } from '@xyflow/react';
import React from 'react';
import { colorForHandle } from './common';

export default function NodeOutputs({children}:{children: React.ReactNode}) {
  return (
    <div className="flex flex-col gap-1">
      {children}
    </div>
  )
}

interface NodeOutputProps {
    output: any;
    nodeId: string;
}

export function NodeOutput({ output, nodeId }: { output: TaskParam, nodeId:string }) {
  return (
    <div  className="flex justify-end relative p-3 bg-secondary">
      <p className="text-xs text-muted-foreground">{output.name}</p>
      <Handle
        id={output.name}
        type="source"
        position={Position.Right}
        className={cn("!bg-muted-foreground !border-2 !border-background !-right-2 !w-4 !h-4", colorForHandle[output.type])}
      />
    </div>
  );
}