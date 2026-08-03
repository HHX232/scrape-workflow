import {AppNode} from '@/types/appNode'
import {Enviroment, ExecutionEnviroment} from '@/types/Enviroment'
import {LogCollector} from '@/types/log'
import {TaskParamType, TaskType} from '@/types/TaskType'
import {ExecutionStatus, WorkflowExecutionStatus} from '@/types/workflow'
import {Edge} from '@xyflow/react'
import {revalidatePath} from 'next/cache'
import {Browser, Page} from 'puppeteer'
import 'server-only'
import {ExecutionPhase} from '../generated/prisma'
import {createLogCollector} from '../log'
import prisma from '../prisma'
import {ExecutorRegistry} from './executor/registry'
import {TaskRegistry} from './task/registry'

export async function ExecuteWorkflow(executionId: string, nextRunAt?: Date) {
  const execution = await prisma.workflowExecution.findUnique({
    where: {id: executionId},
    include: {phases: {orderBy: {number: 'asc'}}, workflow: true}
  })
  if (!execution) throw new Error('Workflow execution not found')

  const enviroment: Enviroment = {phases: {}}

  await initializeWorkflowExecution(executionId, execution.workflowId, nextRunAt)
  await initializePhasesStatuses(execution)

  let creditsConsumed = 0
  let executionFailed = false
  let executionCancelled = false
  const edges = JSON.parse(execution.definition).edges as Edge[]

  const phases = execution.phases  // already ordered by number via Prisma orderBy

  // Cancellation is checked before every phase and every ForEach iteration.
  // Hitting the (remote) DB on every single check adds up fast in tight
  // loops — throttle it to once a second; a 1s-stale "stop" is fine.
  const CANCEL_CHECK_INTERVAL_MS = 1000
  let lastCancelCheckAt = 0
  let cachedCancelled = false
  const checkCancelled = async (): Promise<boolean> => {
    const now = Date.now()
    if (now - lastCancelCheckAt < CANCEL_CHECK_INTERVAL_MS) return cachedCancelled
    const status = await prisma.workflowExecution.findUnique({
      where: {id: executionId},
      select: {status: true}
    })
    lastCancelCheckAt = now
    cachedCancelled = status?.status === WorkflowExecutionStatus.CANCELLED
    return cachedCancelled
  }

  try {
  let i = 0
  while (i < phases.length) {
    if (await checkCancelled()) {
      executionCancelled = true
      break
    }
    const phase = phases[i]
    const node = JSON.parse(phase.node) as AppNode

    if (node.data.type === TaskType.FOR_EACH) {
      setupEnviromentForPhase(node, enviroment, edges)
      const cachedForEachInputs = { ...enviroment.phases[node.id].inputs }
      const itemsRaw = cachedForEachInputs['Items'] ?? ''

      let items: string[] = []
      try {
        items = JSON.parse(itemsRaw)
        if (!Array.isArray(items)) items = []
      } catch {
        items = []
      }

      if (items.length === 0) {
        const logCollector = createLogCollector()
        logCollector.info('ForEach: Items array is empty, skipping loop')
        await finalizePhase(phase.id, true, {}, logCollector, 0)
        i++
        continue
      }

      const loopPhaseIndices = getLoopPhaseIndices(phases, node.id, edges, i + 1)

      if (loopPhaseIndices.length === 0) {
        const logCollector = createLogCollector()
        logCollector.info('ForEach: no downstream phases found in loop body, skipping')
        await finalizePhase(phase.id, true, {}, logCollector, 0)
        i++
        continue
      }

      // ── Execute the loop ─────────────────────────────────────────────────
      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        // Respect manual stop between iterations (not just between top-level phases)
        if (await checkCancelled()) {
          executionCancelled = true
          break
        }

        // Set the index so ForEachExecutor knows which item to expose.
        ;(enviroment as any).__forEachIndex = itemIndex

        // (Re-)execute the FOR_EACH node itself to set Current Item / Index outputs.
        // Pass cached inputs so setupEnviromentForPhase cannot overwrite Items
        // with a stale value from a source node that the loop body already mutated.
        const forEachResult = await executeWorkflowPhase(phase, enviroment, edges, execution.userId, cachedForEachInputs)
        creditsConsumed += forEachResult.creditsConsumed
        if (!forEachResult.success) {
          executionFailed = true
          break
        }

        // Execute all loop-body phases, supporting nested ForEach. A failure
        // inside the body is not fatal — it just ends this one iteration
        // early (see executeLoopBody) and the loop moves on to the next item.
        const bodyResult = await executeLoopBody(
          loopPhaseIndices, phases, enviroment, edges, execution.userId
        )
        creditsConsumed += bodyResult.creditsConsumed
      }

      if (executionFailed || executionCancelled) break

      // Skip past all loop-body phases since we already executed them.
      const lastLoopIdx = Math.max(...loopPhaseIndices)
      i = lastLoopIdx + 1
    } else if (isInsideAnyLoop(node.id, phases, edges, i)) {
      // This phase is a loop body that was already handled above — skip.
      i++
    } else {
      // ── Normal phase ────────────────────────────────────────────────────
      const phaseExecution = await executeWorkflowPhase(phase, enviroment, edges, execution.userId)
      creditsConsumed += phaseExecution.creditsConsumed
      if (!phaseExecution.success) {
        executionFailed = true
        break
      }
      i++
    }
  }
  } catch (err) {
    console.error('Workflow execution crashed:', err)
    executionFailed = true
  }

  await finalizeWorkflowExecution(executionId, execution.workflowId, executionFailed, creditsConsumed, executionCancelled)
  await cleanupEnviroment(enviroment)
  revalidatePath(`/workflow/runs/`)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the indices (into `phases`) of all phases that are direct or
 * indirect descendants of `forEachNodeId` via the edge graph, starting
 * from `startIndex` in the phases array.
 *
 * We stop when we hit another FOR_EACH (nested loops not yet supported)
 * or when we run out of phases.
 */
function getLoopPhaseIndices(
  phases: ExecutionPhase[],
  forEachNodeId: string,
  edges: Edge[],
  startIndex: number
): number[] {
  // BFS from forEachNodeId to collect all reachable node IDs.
  const reachable = new Set<string>()
  const queue = [forEachNodeId]
  while (queue.length > 0) {
    const current = queue.shift()!
    for (const edge of edges) {
      if (edge.source === current && !reachable.has(edge.target)) {
        reachable.add(edge.target)
        queue.push(edge.target)
      }
    }
  }

  const indices: number[] = []
  for (let idx = startIndex; idx < phases.length; idx++) {
    const node = JSON.parse(phases[idx].node) as AppNode
    if (reachable.has(node.id)) {
      indices.push(idx)
    }
  }
  return indices
}

/**
 * Returns true if this node is downstream of any FOR_EACH node that
 * appears earlier in the phases array (i.e. it's a loop body).
 */
function isInsideAnyLoop(_nodeId: string, phases: ExecutionPhase[], edges: Edge[], currentIndex: number): boolean {
  for (let idx = 0; idx < currentIndex; idx++) {
    const candidate = JSON.parse(phases[idx].node) as AppNode
    if (candidate.data.type !== TaskType.FOR_EACH) continue

    const loopIndices = getLoopPhaseIndices(phases, candidate.id, edges, idx + 1)
    if (loopIndices.includes(currentIndex)) return true
  }
  return false
}

/**
 * Executes a sequence of loop-body phases (by their index in the phases array)
 * for ONE iteration of the enclosing loop. If any phase is itself a FOR_EACH,
 * it is executed as a nested loop with its own independent index counter; its
 * body phases are then skipped in the outer scan.
 *
 * A phase failure is NOT fatal to the whole workflow: it just ends the
 * current iteration early (remaining body phases for this item are skipped,
 * since they'd be working off missing upstream data anyway) and the caller's
 * loop moves on to its next item. A failure inside a nested ForEach only
 * skips that nested loop's current iteration — it never propagates up to
 * abort the outer loop or the rest of the workflow.
 */
async function executeLoopBody(
  phaseIndices: number[],
  phases: ExecutionPhase[],
  enviroment: Enviroment,
  edges: Edge[],
  userId: string
): Promise<{creditsConsumed: number}> {
  let creditsConsumed = 0
  let i = 0

  while (i < phaseIndices.length) {
    const phaseIdx = phaseIndices[i]
    const phase = phases[phaseIdx]
    const node = JSON.parse(phase.node) as AppNode

    if (node.data.type === TaskType.FOR_EACH) {
      // Read inner items fresh (outer phases have already updated the source output)
      setupEnviromentForPhase(node, enviroment, edges)
      const cachedInnerInputs = { ...enviroment.phases[node.id].inputs }
      const innerItemsRaw = cachedInnerInputs['Items'] ?? ''

      let innerItems: string[] = []
      try {
        innerItems = JSON.parse(innerItemsRaw)
        if (!Array.isArray(innerItems)) innerItems = []
      } catch {}

      // Body phases of the inner ForEach — only those within this body set
      const innerBodyIndices = getLoopPhaseIndices(phases, node.id, edges, phaseIdx + 1)
        .filter(idx => phaseIndices.includes(idx))

      if (innerItems.length === 0) {
        const lc = createLogCollector()
        lc.info('ForEach (nested): Items is empty, skipping inner loop')
        await finalizePhase(phase.id, true, {}, lc, 0)
      } else {
        for (let ii = 0; ii < innerItems.length; ii++) {
          // Each inner iteration gets its own index — independent of outer
          ;(enviroment as any).__forEachIndex = ii

          const innerFE = await executeWorkflowPhase(phase, enviroment, edges, userId, cachedInnerInputs)
          creditsConsumed += innerFE.creditsConsumed
          if (!innerFE.success) {
            console.log(`[ExecuteWorkflow] Nested ForEach iteration ${ii + 1}/${innerItems.length} failed — skipping to next item`)
            continue
          }

          // Use executeLoopBody so nested ForEach nodes (3rd+ level) are handled recursively
          if (innerBodyIndices.length > 0) {
            const innerBodyResult = await executeLoopBody(innerBodyIndices, phases, enviroment, edges, userId)
            creditsConsumed += innerBodyResult.creditsConsumed
          }
        }
      }

      // Advance past the inner ForEach and all its body phases
      if (innerBodyIndices.length > 0) {
        const maxInner = Math.max(...innerBodyIndices)
        i = phaseIndices.indexOf(maxInner) + 1
      } else {
        i++
      }
    } else {
      const result = await executeWorkflowPhase(phase, enviroment, edges, userId)
      creditsConsumed += result.creditsConsumed
      if (!result.success) {
        console.log(`[ExecuteWorkflow] Phase "${phase.name}" failed inside loop body — skipping rest of this iteration`)
        break
      }
      i++
    }
  }

  return {creditsConsumed}
}

// ── Unchanged helpers from original executeWorkflow.ts ────────────────────────

async function initializeWorkflowExecution(executionId: string, workflowId: string, nextRunAt?: Date) {
  await prisma.workflowExecution.update({
    where: {id: executionId},
    data: {status: WorkflowExecutionStatus.RUNNING, startedAt: new Date()}
  })
  await prisma.workflow.update({
    where: {id: workflowId},
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
    where: {id: {in: execution.phases.map((phase: any) => phase.id)}},
    data: {status: ExecutionStatus.PENDING}
  })
}

async function finalizeWorkflowExecution(
  executionId: string,
  workflowId: string,
  executionFailed: boolean,
  creditsConsumed: number,
  executionCancelled = false
) {
  const finalStatus = executionCancelled
    ? WorkflowExecutionStatus.CANCELLED
    : executionFailed ? WorkflowExecutionStatus.FAILED : WorkflowExecutionStatus.COMPLETED
  await prisma.workflowExecution.update({
    where: {id: executionId},
    data: {status: finalStatus, completedAt: new Date(), creditsConsumed}
  })
  await prisma.workflow
    .update({
      where: {id: workflowId, lastRunId: executionId},
      data: {lastRunStatus: finalStatus}
    })
    .catch(() => {})
}

async function executeWorkflowPhase(
  phase: ExecutionPhase,
  enviroment: Enviroment,
  edges: Edge[],
  userId: string,
  inputOverrides?: Record<string, string>
) {
  const logCollector = createLogCollector()
  const startedAt = new Date()
  const node = JSON.parse(phase.node) as AppNode
  setupEnviromentForPhase(node, enviroment, edges)
  if (inputOverrides) {
    Object.assign(enviroment.phases[node.id].inputs, inputOverrides)
  }

  const creditsRequired = TaskRegistry[node.data.type]?.credits || 0

  // Batched into one round trip instead of 3 sequential ones (mark RUNNING +
  // ensure balance row exists + deduct credits) — matters a lot on a remote DB.
  let success = true
  try {
    await prisma.$transaction([
      prisma.executionPhase.update({
        where: {id: phase.id},
        data: {
          status: ExecutionStatus.RUNNING,
          startedAt,
          inputs: JSON.stringify(enviroment.phases[node.id].inputs)
        }
      }),
      prisma.userBalance.upsert({
        where: {userId},
        create: {userId, credits: 100000000},
        update: {}
      }),
      prisma.userBalance.update({
        where: {userId, credits: {gte: creditsRequired}},
        data: {credits: {decrement: creditsRequired}}
      })
    ])
  } catch (error) {
    logCollector.error('Insufficient credits or balance error: ' + error)
    success = false
  }

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
  await prisma.$transaction(
    async (tx) => {
      await tx.executionPhase
        .update({
          where: {id: phaseId},
          data: {
            status: success ? ExecutionStatus.COMPLETED : ExecutionStatus.FAILED,
            completedAt: new Date(),
            outputs: JSON.stringify(outputs),
            creditsConsumed
          }
        })
        .catch((err) => console.error('Failed to save phase:', err))

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
    },
    // Large phase outputs (e.g. full page HTML) can take longer than the
    // 5s Prisma default to write over the remote libSQL connection — bump
    // the interactive transaction budget so that doesn't blow up the run.
    {timeout: 30000, maxWait: 10000}
  )
}

async function executePhase(
  _phase: ExecutionPhase,
  node: AppNode,
  enviroment: Enviroment,
  logCollector: LogCollector
): Promise<boolean> {
  const runFn = ExecutorRegistry[node.data.type]
  if (!runFn) {
    logCollector.error(`No executor found for task type ${node.data.type}`)
    return false
  }
  const executionEnviroment: ExecutionEnviroment<any> = createExecutionEnviroment(node, enviroment, logCollector)
  return runFn(executionEnviroment)
}

function setupEnviromentForPhase(node: AppNode, environment: Enviroment, edges: Edge[]) {
  environment.phases[node.id] = {inputs: {}, outputs: {}}
  const task = TaskRegistry[node.data.type]
  const inputs = task.inputs

  for (const input of inputs) {
    if (input.type === TaskParamType.BROWSER_INSTANCE) continue

    // Edge connections take priority over static node values so that wired-up
    // nodes always receive live data from upstream (e.g. a Buffer from DownloadPdf)
    // rather than a stale placeholder that was typed before the edge was connected.
    const connectEdge = edges.find(
      (edge) =>
        edge.target === node.id &&
        (edge.targetHandle === `${node.id}-input-${input.name}` || edge.targetHandle === input.name)
    )

    if (connectEdge) {
      const outputValue = environment.phases[connectEdge.source]?.outputs[connectEdge?.sourceHandle || '']
      environment.phases[node.id].inputs[input.name] = outputValue
      continue
    }

    const inputValue = node.data.inputs[input.name]
    if (inputValue) {
      environment.phases[node.id].inputs[input.name] = inputValue
      continue
    }

    console.error(`No connection found for input ${input.name} of node ${node.id}`)
  }

  // Extra dynamic inputs (e.g. exclusion selectors in GetAllLinksInBox)
  if ((task as any).extraDynamicInputs) {
    const excludeCount: number = node.data.excludeCount ?? 0
    ;(environment as any).__excludeCount = excludeCount
    const prefix: string = (task as any).extraDynamicInputs.prefix

    for (let i = 1; i <= excludeCount; i++) {
      const name = i === 1 ? prefix : `${prefix} ${i}`
      const staticValue = node.data.inputs?.[name]
      if (staticValue) {
        environment.phases[node.id].inputs[name] = staticValue
      }
    }
  }

  // Динамические входы (например, MergeArrays)
  if (task.dynamicInputs) {
    const count: number = node.data.dynamicInputCount ?? 1
    ;(environment as any).__dynamicInputCount = count
    const prefix = (task as any).dynamicInputPrefix ?? 'Array'

    for (let i = 1; i <= count; i++) {
      const name = i === 1 ? prefix : `${prefix} ${i}`
      const staticValue = node.data.inputs?.[name]
      if (staticValue) {
        environment.phases[node.id].inputs[name] = staticValue
        continue
      }
      const connectEdge = edges.find(
        (edge) =>
          edge.target === node.id &&
          (edge.targetHandle === `${node.id}-input-${name}` || edge.targetHandle === name)
      )
      if (!connectEdge) continue
      const outputValue = environment.phases[connectEdge.source]?.outputs[connectEdge?.sourceHandle || '']
      if (outputValue !== undefined) environment.phases[node.id].inputs[name] = outputValue
    }
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
    log: logCollector,
    // Expose accumulators and loop index so executors can use them
    get __forEachIndex() {
      return (enviroment as any).__forEachIndex
    },
    get __accumulators() {
      return (enviroment as any).__accumulators
    },
    set __accumulators(v) {
      ;(enviroment as any).__accumulators = v
    },
    get __dynamicInputCount() {
      return (enviroment as any).__dynamicInputCount
    }
  }
}

async function cleanupEnviroment(enviroment: Enviroment) {
  if (enviroment.browser) {
    await enviroment.browser.close().catch((error) => console.error('Cannot close browser:', error))
  }
}

