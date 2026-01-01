'use client'
import {
   Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import { TaskType } from '@/types/TaskType'

export default function TaskMenu() {
   
  return <aside className='w-[340px] min-w-[340px] max-w-[340px] border-r-2 border-separate h-full p-2'>
<Accordion type='multiple' className='w-full' defaultValue={['extraction']}>
   <AccordionItem value='extraction'>
      <AccordionTrigger className='font-bold'>Extraction</AccordionTrigger>
      <AccordionContent className='flex flex-col gap-1'>
         <TaskMenuBtn taskType={TaskType.PAGE_TO_HTML}></TaskMenuBtn>
         <TaskMenuBtn taskType={TaskType.EXTRACT_TEXT_FROM_ELEMENT}></TaskMenuBtn>
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
      <task.icon size={20}/>
      {task.label}
      </div>
   </Button>
}