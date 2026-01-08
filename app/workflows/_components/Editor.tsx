'use client'
import {FlowValidationContentProvider} from '@/components/context/FlowValidationContext'
import {Workflow} from '@/lib/generated/prisma'
import {ReactFlowProvider} from '@xyflow/react'
import FlowEditor from './FlowEditor'
import TaskMenu from './TaskMenu'
import Topbar from './topbar/Topbar'

export default function Editor({workflow}: {workflow: Workflow}) {
  return (
    <FlowValidationContentProvider>
      <ReactFlowProvider>
        <div className='flex flex-col h-full overflow-hidden'>
          <Topbar title={'Workflow Editor'} subtitle={workflow.name} workflowId={workflow.id} />
          <section className='flex h-full w-full overflow-auto'>
            <TaskMenu />
            <FlowEditor workflow={workflow} />
          </section>
        </div>
      </ReactFlowProvider>
    </FlowValidationContentProvider>
  )
}
