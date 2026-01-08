import { GetWorkflowExecutionWithPhases } from "@/actions/workflows/GetWorkflowExecutionWithPhases"
import Topbar from "@/app/workflows/_components/topbar/Topbar"
import { auth } from "@clerk/nextjs/server"
import { Loader2Icon } from "lucide-react"
import { Suspense } from "react"
import ExecutionViewer from "../../_components/ExecutionViewer"

export default function ExecutionViewerPage({params}:{
   params:{
      executionId:string
      workflowId:string
   }
}) {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar title="Workflow run details" subtitle={`Run ID: ${params.executionId}`} hideButtons={true} workflowId={params.workflowId}/>
      <section className="flex h-full overflow-auto">
<Suspense fallback={<div className="flex w-full items-center justify-center">
  <Loader2Icon className="h-10 w-10 animate-spin stroke-primary"></Loader2Icon>
</div>}>
  <ExecutionViewerWrapper executionId={params.executionId} >

  </ExecutionViewerWrapper>
</Suspense>
      </section>
    </div>
  )
}
async function ExecutionViewerWrapper({executionId}: {executionId: string}) {
  const {userId} = auth()
  if(!userId) {
    return (
      <div>
        <h1>Execution Viewer Not Found</h1>
      </div>
    )
  }
  const workflowExecution = await GetWorkflowExecutionWithPhases(executionId)

  if(!workflowExecution){
    return <div>Not Found</div>
  }

  return (
  <ExecutionViewer initialData={workflowExecution}/>
  )
}