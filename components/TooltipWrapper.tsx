'use client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


interface Props{
   children: React.ReactNode
   content:  React.ReactNode
   side?: 'top' | 'right' | 'bottom' | 'left'
}
export default function TooltipWrapper(props: Props){
   if(!props.content) return props.children
   return <TooltipProvider delayDuration={0}>
      <Tooltip>
         <TooltipTrigger asChild>{props.children}</TooltipTrigger>
         <TooltipContent side={props.side}>
            {props.content}
         </TooltipContent>
      </Tooltip>
   </TooltipProvider>
}