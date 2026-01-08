'use client'
import { GetWorkflowExecutionWithPhases } from "@/actions/workflows/GetWorkflowExecutionWithPhases";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DatesToDurationString } from "@/lib/helper/date";
import { WorkflowExecutionStatus } from "@/types/workflow";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from 'date-fns';
import { CalendarIcon, CircleDashedIcon, ClockIcon, CoinsIcon, Loader2Icon, LucideIcon, WorkflowIcon } from "lucide-react";
import { ReactNode } from "react";
 

type ExecutionData = Awaited<ReturnType<typeof GetWorkflowExecutionWithPhases>>

export default function ExecutionViewer({initialData}:{initialData:ExecutionData}) {
   const query = useQuery({
      queryKey: ["execution", initialData?.id],
      initialData,
      queryFn:()=>GetWorkflowExecutionWithPhases(initialData!.id),
      refetchInterval:(q)=>q.state?.data?.status === WorkflowExecutionStatus.RUNNING ? 1000 : false
   });
   
   const duration = DatesToDurationString(query.data?.completedAt, query.data?.startedAt)
  return (
    <div className="flex w-full h-full">
      <aside className="w-[440px] max-w-[440px] min-w-[440px] border-r-2 border-separate flex flex-grow flex-col overflow-hidden">
        <div className="py-4 px-2">
         {/* status label */}
         <ExecutionLabel icon={CircleDashedIcon} label={'status'} value={<span className=" uppercase">{query.data?.status}</span>}/>
         
         {/* stated at label */}
         <ExecutionLabel value=  {query.data?.startedAt ? formatDistanceToNow(new Date(query.data.startedAt), {addSuffix:true}) :'–'} icon={CalendarIcon} label={'started at'}/>

          <ExecutionLabel value={duration ? duration : <Loader2Icon size={16} className="animate-spin"/>} icon={ClockIcon} label={'Duration'}/>
          <ExecutionLabel value={'TODO'} icon={CoinsIcon} label={'Credits consumed'}/>
        </div>
        <Separator/>
        <div className="flex justify-center items-center py-2 px-4">
         <div className="text-muted-foreground flex items-center gap-2">
            <WorkflowIcon size={20} className="stroke-muted-foreground/80"/>
            <span className="font-se,ibold">Phases</span>
         </div>
        </div>
         <Separator/>
         <div className="overflow-auto h-full px-2 py-4">
            {query.data?.phases.map((phase, index) => (
  <Button variant={'ghost'} key={phase.id} className="w-full justify-between">
    <div className="flex items-center gap-2">
      <Badge variant="outline">{index + 1}</Badge>
      <p className="font-semibold">{phase.name}</p>
    </div>
  </Button>
))}
         </div>
      </aside>
    </div>
  )
}

function ExecutionLabel({icon,label,value}:{icon:LucideIcon, label:ReactNode, value:ReactNode}){
   const Icon = icon
   return <div className="flex justify-between items-center py-2 px-4 text-sm" >
            <div className="text-muted-foreground flex items-center gap-2">
               <Icon size={20} className="stroke-muted-foreground/80"/>
               <span>{label}</span>

            </div>
            <div className="font-semibold lowercase flex gap-2 items-center">
              {value}
            </div>
         </div>
}
