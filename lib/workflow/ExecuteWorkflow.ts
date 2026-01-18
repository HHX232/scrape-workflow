import { AppNode } from '@/types/appNode'
import { Enviroment, ExecutionEnviroment } from '@/types/Enviroment'
import { LogCollector } from '@/types/log'
import { TaskParamType } from '@/types/TaskType'
import { ExecutionStatus, WorkflowExecutionStatus } from '@/types/workflow'
import { Edge } from '@xyflow/react'
import { revalidatePath } from 'next/cache'
import { Browser, Page } from 'puppeteer'
import 'server-only'
import { ExecutionPhase } from '../generated/prisma'
import { createLogCollector } from '../log'
import prisma from '../prisma'
import { ExecutorRegistry } from './executor/registry'
import { TaskRegistry } from './task/registry'

export async function ExecuteWorkflow(executionId: string, nextRunAt?: Date) {
  const execution = await prisma.workflowExecution.findUnique({
    where: {
      id: executionId
    },
    include: {
      phases: true,
      workflow: true
    }
  })
  if (!execution) {
    throw new Error('Workflow execution not found')
  }

  const enviroment: Enviroment = {phases: {}}

  await initializeWorkflowExecution(executionId, execution.workflowId, nextRunAt)
  await initializePhasesStatuses(execution)

  let creditsConsumed = 0
  let executionFailed = false
  const edges = JSON.parse(execution.definition).edges as Edge[]
  for (const phase of execution.phases) {
    //  TODO consume credits
    //  TODO execute phase
    const phaseExecution = await executeWorkflowPhase(phase, enviroment, edges, execution.userId)
    if (!phaseExecution.success) {
      executionFailed = true
      break
    }
    creditsConsumed += phaseExecution.creditsConsumed
  }
  await finalizeWorkflowExecution(executionId, execution.workflowId, executionFailed, creditsConsumed)

  await cleanupEnviroment(enviroment)
  revalidatePath(`/workflow/runs/`)
}

async function initializeWorkflowExecution(executionId: string, workflowId: string, nextRunAt?: Date) {
  await prisma.workflowExecution.update({
    where: {
      id: executionId
    },
    data: {
      status: WorkflowExecutionStatus.RUNNING,
      startedAt: new Date(),
    }
  })

  await prisma.workflow.update({
    where: {
      id: workflowId
    },
    data: {
      lastRunAt: new Date(),
      lastRunStatus: WorkflowExecutionStatus.RUNNING,
      lastRunId: executionId,
      ...(nextRunAt && {nextRunAt})
    }
  })
}

async function initializePhasesStatuses(execution: any) {
  await prisma.executionPhase.updateMany({
    where: {
      id: {
        in: execution.phases.map((phase: any) => phase.id)
      }
    },
    data: {
      status: ExecutionStatus.PENDING
    }
  })
}

async function finalizeWorkflowExecution(
  executionId: string,
  workflowId: string,
  executionFailed: boolean,
  creditsConsumed: number
) {
  const finalStatus = executionFailed ? WorkflowExecutionStatus.FAILED : WorkflowExecutionStatus.COMPLETED

  await prisma.workflowExecution.update({
    where: {
      id: executionId
    },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      creditsConsumed
    }
  })

  await prisma.workflow
    .update({
      where: {
        id: workflowId,
        lastRunId: executionId
      },
      data: {
        lastRunStatus: finalStatus
      }
    })
    .catch((err) => {
      // ignore, this means that we have triggered other runs for this workflow while an execution was running
    })
}

async function executeWorkflowPhase(phase: ExecutionPhase, enviroment: Enviroment, edges: Edge[], userId: string) {
  const logCollector = createLogCollector()
  const startedAt = new Date()
  const node = JSON.parse(phase.node) as AppNode
  setupEnviromentForPhase(node, enviroment, edges)
  await prisma.executionPhase.update({
    where: {
      id: phase.id
    },
    data: {
      status: ExecutionStatus.RUNNING,
      startedAt,
      inputs: JSON.stringify(enviroment.phases[node.id].inputs)
    }
  })

  const creditsRequired = TaskRegistry[node.data.type]?.credits || 0
  let success = await decrementCredits(userId, creditsRequired, logCollector)
  const creditsConsumed = success ? creditsRequired : 0
  if (success) {
    success = await executePhase(phase, node, enviroment, logCollector)
  }

  const outputs = enviroment.phases[node.id]?.outputs || {}
  await finalizePhase(phase.id, success, outputs, logCollector, creditsConsumed)
  return {success, creditsConsumed}
}

async function finalizePhase(
  phaseId: string,
  success: boolean,
  outputs: Record<string, string>,
  logCollector: LogCollector,
  creditsConsumed: number
) {
  const logs = logCollector.getAll()

  await prisma.$transaction(async (tx) => {
    await tx.executionPhase
      .update({
        where: {
          id: phaseId
        },
        data: {
          status: success ? ExecutionStatus.COMPLETED : ExecutionStatus.FAILED,
          completedAt: new Date(),
          outputs: JSON.stringify(outputs),
          creditsConsumed
        }
      })
      .catch((err) => {
        console.error('Failed to save logs:', err)
      })
    console.log(`Saving ${logs.length} logs for phase ${phaseId}`)
    if (logs.length > 0) {
      await tx.executionLog.createMany({
        data: logs.map((log) => ({
          message: log.message,
          timestamp: log.timestamp,
          logLevel: log.level,
          executionPhaseId: phaseId
        }))
      })
    }
  })
}

async function executePhase(
  phase: ExecutionPhase,
  node: AppNode,
  enviroment: Enviroment,
  logCollector: LogCollector
): Promise<boolean> {
  const runFn = ExecutorRegistry[node.data.type]
  if (!runFn) {
    return false
  }
  const executionEnviroment: ExecutionEnviroment<any> = createExecutionEnviroment(node, enviroment, logCollector)
  return runFn(executionEnviroment)
}

function setupEnviromentForPhase(node: AppNode, environment: Enviroment, edges: Edge[]) {
  environment.phases[node.id] = {inputs: {}, outputs: {}}

  const inputs = TaskRegistry[node.data.type].inputs

  for (const input of inputs) {
    if (input.type === TaskParamType.BROWSER_INSTANCE) continue
    const inputValue = node.data.inputs[input.name]

    if (inputValue) {
      environment.phases[node.id].inputs[input.name] = inputValue
      continue
    }

    // Get input value from outputs in the environment
    const connectEdge = edges.find(
      (edge) =>
        edge.target === node.id &&
        (edge.targetHandle === `${node.id}-input-${input.name}` || edge.targetHandle === input.name)
    )
    if (!connectEdge) {
      console.error(`No connection found for input ${input.name} of node ${node.id}`)
      continue
    }

    const outputValue = environment.phases[connectEdge.source].outputs[connectEdge?.sourceHandle || '']
    environment.phases[node.id].inputs[input.name] = outputValue
  }
}

function createExecutionEnviroment(
  node: AppNode,
  enviroment: Enviroment,
  logCollector: LogCollector
): ExecutionEnviroment<any> {
  return {
    getInput: (name: string) => enviroment.phases[node?.id]?.inputs[name],
    setOutput: (name: string, value: string) => {
      if (enviroment.phases[node?.id]?.outputs) {
        enviroment.phases[node?.id].outputs[name] = value
      }
    },
    getBrowser: () => enviroment.browser,
    setBrowser: (browser: Browser) => {
      enviroment.browser = browser
    },

    getPage: () => enviroment.page,
    setPage: (page: Page) => (enviroment.page = page),
    log: logCollector
  }
}

async function cleanupEnviroment(enviroment: Enviroment) {
  if (enviroment.browser) {
    await enviroment.browser.close().catch((error) => {
      console.error('Cannot close browser:', error)
    })
  }
}

async function decrementCredits(userId: string, amount: number, logCollector: LogCollector) {
  try {
    await prisma.userBalance.update({
      where: {userId, credits: {gte: amount}},
      data: {credits: {decrement: amount}}
    })
    return true
  } catch (error) {
    logCollector.error('Failed to decrement credits' + error)
    return false
  }
}
