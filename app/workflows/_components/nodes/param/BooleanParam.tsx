'use client'

import { Label } from '@/components/ui/label'
import { ParamProps } from '@/types/appNode'
import { useId } from 'react'

export default function BooleanParam({ param, value, updateNodeParamValue, disabled }: ParamProps & { disabled?: boolean }) {
  const id = useId()
  const checked = value === 'true'

  return (
    <div className='flex items-center gap-2 p-1 w-full'>
      <input
        id={id}
        type='checkbox'
        disabled={disabled}
        checked={checked}
        onChange={e => updateNodeParamValue?.(e.target.checked ? 'true' : 'false')}
        className='h-4 w-4 accent-primary cursor-pointer'
      />
      <Label htmlFor={id} className='text-xs cursor-pointer select-none'>
        {param.name}
        {param.helpText && (
          <span className='ml-1 text-muted-foreground'>— {param.helpText}</span>
        )}
      </Label>
    </div>
  )
}
