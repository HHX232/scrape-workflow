import { cn } from "@/lib/utils"
import { SquareDashedMousePointer } from "lucide-react"
import Link from "next/link"

export default function Logo({
   fontSize ='text-2xl',
   iconSize = 20
}:{
   fontSize?: string,
   iconSize?: number
}) {
  return (
   <Link className={cn('text-2xl font-extrabold flex items-center gap-2 ', fontSize)} href="/">
      {/* <div className=" rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-2">
         <SquareDashedMousePointer size={iconSize} className="stroke-white"/>
      </div> */}
      <div className="flex ">
         <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">Anna</span>
         <div className="text-stone-700 dark:text-stone-300">Parser</div>
      </div>
   </Link>
  )
}
