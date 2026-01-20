'use client'
import {
   Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import { TaskType } from '@/types/TaskType'
import { CoinsIcon } from 'lucide-react'

export default function TaskMenu() {
   
  return <aside className='w-[340px] min-w-[340px] max-w-[340px] border-r-2 border-separate h-full p-2 overflow-y-auto'>
<Accordion type='multiple' className='w-full' defaultValue={['extraction', 'interactions','timing', 'results', 'data storage']}>
   <AccordionItem value='extraction'>
      <AccordionTrigger className='font-bold'>Extraction</AccordionTrigger>
      <AccordionContent className='flex flex-col gap-1'>
         <TaskMenuBtn taskType={TaskType.PAGE_TO_HTML}></TaskMenuBtn>
         <TaskMenuBtn taskType={TaskType.EXTRACT_TEXT_FROM_ELEMENT}></TaskMenuBtn>
         <TaskMenuBtn taskType={TaskType.EXTRACT_DATA_WITH_AI}></TaskMenuBtn>
          <TaskMenuBtn taskType={TaskType.EXTRACT_TEXT_FROM_ELEMENTS}></TaskMenuBtn>
          {/* <TaskMenuBtn taskType={TaskType.DOWNLOAD_IMAGES}></TaskMenuBtn>
          <TaskMenuBtn taskType={TaskType.SAVE_SCREENSHOT}></TaskMenuBtn> */}

        
      </AccordionContent>
   </AccordionItem>
   {/* --------- */}
   <AccordionItem value='interactions'>
      <AccordionTrigger className='font-bold'>User interactions</AccordionTrigger>
      <AccordionContent className='flex flex-col gap-1'>
         <TaskMenuBtn taskType={TaskType.FILL_INPUT}></TaskMenuBtn>
         <TaskMenuBtn taskType={TaskType.NAVIGATE_URL}></TaskMenuBtn>
         <TaskMenuBtn taskType={TaskType.CLICK_ELEMENT}></TaskMenuBtn>
         <TaskMenuBtn taskType={TaskType.SCROLL_TO_ELEMENT}></TaskMenuBtn>
         {/* <TaskMenuBtn taskType={TaskType.TAKE_SCREENSHOT}></TaskMenuBtn> */}
        
         
      </AccordionContent>
   </AccordionItem>
    {/* --------- */}
   <AccordionItem value='timing'>
      <AccordionTrigger className='font-bold'>Timing controls</AccordionTrigger>
      <AccordionContent className='flex flex-col gap-1'>
         <TaskMenuBtn taskType={TaskType.WAIT_FOR_ELEMENT}></TaskMenuBtn>
      </AccordionContent>
   </AccordionItem>
   <AccordionItem value='data storage'>
      <AccordionTrigger className='font-bold'>Data storage</AccordionTrigger>
      <AccordionContent className='flex flex-col gap-1'>
         <TaskMenuBtn taskType={TaskType.READ_PROPERTY_FROM_JSON}></TaskMenuBtn>
         <TaskMenuBtn taskType={TaskType.ADD_PROPERTY_TO_JSON}></TaskMenuBtn>
      </AccordionContent>
   </AccordionItem>
   <AccordionItem value='results'>
      <AccordionTrigger className='font-bold'>Result delivery</AccordionTrigger>
      <AccordionContent className='flex flex-col gap-1'>
         <TaskMenuBtn taskType={TaskType.DELIVER_VIA_WEBHOOK}></TaskMenuBtn>
      </AccordionContent>
   </AccordionItem>
</Accordion>
  </aside>
}

function TaskMenuBtn({taskType}: {taskType: TaskType}) {
   const task = TaskRegistry[taskType]
   const onDragStart = (event: any, taskType: TaskType) => {
      event?.dataTransfer?.setData('application/reactflow', taskType)
      event.dataTransfer.effectAllowed = 'move'
   }
   return <Button onDragStart={event => onDragStart(event, taskType)} draggable variant={'secondary'} className='flex justify-between items-center gap-2 border w-full'>
   <div className="flex gap-2">
      {task?.icon && <task.icon size={20}/>}
      {task?.label}
      </div>
      <Badge variant={'outline'} className='gap-2 flex items-center'>
      <CoinsIcon size={16}/>
      {task?.credits}
      </Badge>
   </Button>
}