'use client'

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { DialogHeader, DialogTitle } from "./ui/dialog"
import { Separator } from "./ui/separator"
interface Props {
   title?:string
   subtitle?:string
   Icon?:LucideIcon
   iconClassname?:string
   titleClassname?:string
   subtitleClassname?:string
}
export default function CustomDialogHeader({
   title,
   subtitle,
   Icon,
   iconClassname,
   titleClassname,
   subtitleClassname
}:Props) {
  return (
    <DialogHeader className="py-6">
      <DialogTitle asChild>
         <div className="flex flex-col items-center gap-2 mb-2">{Icon && <Icon size={30} className={cn('stroke-primary', iconClassname)}/>}
         {title && (
            <p className={cn('text-xl text-primary', titleClassname)}>{title}</p>
         )}
         {subtitle && (
            <p className={cn('text-sm text-muted-foreground', subtitleClassname)}>{subtitle}</p>
         )}
         </div>
         </DialogTitle>
         <Separator/>
    </DialogHeader>
  )
}
