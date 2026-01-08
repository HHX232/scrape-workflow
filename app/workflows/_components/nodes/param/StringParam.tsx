'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ParamProps } from "@/types/appNode"
import { useEffect, useId, useState } from "react"



export default function StringParam({param, value, updateNodeParamValue, disabled}:ParamProps & {disabled?: boolean}) {
   const [inputValue, setInputValue] = useState(value)

   useEffect(()=>{
    setInputValue(value);
   },[value])
   const id = useId()

   useEffect(()=>{
    console.log('disabled:', disabled, 'inputValue:', inputValue, 'value:', value);
    if (disabled && inputValue !== value) {
      setInputValue(value);
    }
   }, [disabled, inputValue, value])

   let Component: any = Input
   if(param.variant === 'textarea') {
     Component = Textarea
   }
   
  return (
    <div className="space-y-1 p-1 w-full">
      <Label htmlFor={id} className="text-xs flex">{param.name}

         {param.required && <span className="text-red-500 px-2">*</span>}
      </Label>
      <Component disabled={disabled} className="text-xs" onBlur={()=>updateNodeParamValue?.(inputValue || '')} placeholder="Enter value here" id={id} value={inputValue} onChange={(e:any)=>setInputValue?.(e.target.value)}/>
      {param.helpText && <p className="px-2 text-muted-foreground">{param.helpText}</p>}
    </div>
  )
}
