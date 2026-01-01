'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ParamProps } from "@/types/appNode"
import { useId, useState } from "react"



export default function StringParam({param, value, updateNodeParamValue}:ParamProps) {
   const [inputValue, setInputValue] = useState(value)
   const id = useId()
  return (
    <div className="space-y-1 p-1 w-full">
      <Label htmlFor={id} className="text-xs flex">{param.name}

         {param.required && <span className="text-red-500 px-2">*</span>}
      </Label>
      <Input className="text-xs" onBlur={()=>updateNodeParamValue?.(inputValue || '')} placeholder="Enter value here" id={id} value={inputValue} onChange={(e)=>setInputValue?.(e.target.value)}/>
      {param.helpText && <p className="px-2 text-muted-foreground">{param.helpText}</p>}
    </div>
  )
}
