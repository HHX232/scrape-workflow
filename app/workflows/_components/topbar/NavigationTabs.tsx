'use client'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavigationTabs({workflowId}:{workflowId:string}) {
   const pathname = usePathname()
   const activeValue = pathname.toLowerCase().includes('editor') ? 'editor' : 'runs'
  return (
   <Tabs className='w-[400px]' value={activeValue}>
      <TabsList className='grid w-full grid-cols-2'>
         <Link href={`/workflows/editor/${workflowId}`}><TabsTrigger value={'editor' } className='w-full'>Editor</TabsTrigger></Link>
         <Link href={`/workflow/runs/${workflowId}`}><TabsTrigger className='w-full' value={'runs'}>Runs</TabsTrigger></Link>
      </TabsList>
   </Tabs>
  )
}
