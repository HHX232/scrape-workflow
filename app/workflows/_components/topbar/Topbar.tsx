'use client'

import TooltipWrapper from '@/components/TooltipWrapper'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ExecuteBtn from './ExecuteBtn'
import NavigationTabs from './NavigationTabs'
import PublishBtn from './PublishBtn'
import SaveBtn from './SaveBtn'
import UnPublishBtn from './UnPublishBtn'

export default function Topbar({title, subtitle, workflowId, hideButtons = false, isPublished = false}: {title: string, subtitle?: string, workflowId: string, hideButtons?: boolean, isPublished?: boolean}) {
  const router = useRouter()

  return (
    <header className='flex p-2 border-b-2 border-separate justify-between w-full h-[60px] sticky top-0 bg-background z-10'>
      <div className="flex gap-1 flex-1">
        <TooltipWrapper content="Back">
          <Button variant={'ghost'} size={'icon'} onClick={()=>router.back()}>
            <ArrowLeftIcon size={20}/>
          </Button>
        </TooltipWrapper>
        <div className={`flex ${hideButtons && 'flex-col'}`}>
        <div className="font-bold text-xl text-ellipsis truncate">{title}</div>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
        </div>
      </div>
      <NavigationTabs workflowId={workflowId}/>
      <div className="flex gap-1 flex-1 justify-end">
      { !hideButtons && <>
        <ExecuteBtn workflowId={workflowId}/>
        {isPublished && <UnPublishBtn workflowId={workflowId}/>}
        {!isPublished && <>
        <SaveBtn workflowId={workflowId}/>
        <PublishBtn workflowId={workflowId}/>
        </>}
        </>}
      </div>
    </header>
  )
}
