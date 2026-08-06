import type {AppNode} from '@/types/appNode'
import type {Enviroment} from '@/types/Enviroment'
import type {TaskType} from '@/types/TaskType'
import type {Edge} from '@xyflow/react'

// Minimal shape needed from an ExecutionPhase row — kept local (instead of
// importing the generated Prisma type) so this module has zero runtime
// dependencies and can be unit-tested directly with plain node.
export type PhaseLike = {node: string}

/**
 * Same idea as the engine's getLoopPhaseIndices, but the BFS only starts from
 * edges whose source handle is one of `sourceHandles` — used for a
 * "Раздельные выходы" Coalesce (OR) node, where each output leads to a
 * disjoint branch of the graph.
 */
export function getBranchPhaseIndices(
  phases: PhaseLike[],
  sourceNodeId: string,
  sourceHandles: string[],
  edges: Edge[],
  startIndex: number
): number[] {
  const reachable = new Set<string>()
  const queue: string[] = []
  for (const edge of edges) {
    if (edge.source === sourceNodeId && sourceHandles.includes(edge.sourceHandle || '') && !reachable.has(edge.target)) {
      reachable.add(edge.target)
      queue.push(edge.target)
    }
  }
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
    if (reachable.has(node.id)) indices.push(idx)
  }
  return indices
}

export function isBranchingCoalesce(node: AppNode, coalesceType: TaskType): boolean {
  return node.data.type === coalesceType && node.data.inputs?.['Раздельные выходы'] === 'true'
}

/**
 * After a "Раздельные выходы" Coalesce phase has run, returns the phase
 * indices EXCLUSIVELY reachable from the output that was NOT taken. A shared
 * reconvergence point (e.g. a downstream OR merging Value A/Value B from
 * both branches) is reachable from BOTH outputs, so it's never included here
 * — it always runs, regardless of which branch fired.
 */
export function computeBranchSkipIndices(
  phases: PhaseLike[],
  node: AppNode,
  enviroment: Enviroment,
  edges: Edge[],
  startIndex: number,
  scopeIndices?: number[]
): number[] {
  const tookA = (enviroment.phases[node.id]?.outputs as any)?.__branch === 'A'
  const branchAAll = new Set(getBranchPhaseIndices(phases, node.id, ['Value Output A', 'Page Output A'], edges, startIndex))
  const branchBAll = new Set(getBranchPhaseIndices(phases, node.id, ['Value Output B', 'Page Output B'], edges, startIndex))
  let skip = tookA
    ? Array.from(branchBAll).filter(idx => !branchAAll.has(idx))
    : Array.from(branchAAll).filter(idx => !branchBAll.has(idx))
  if (scopeIndices) skip = skip.filter(idx => scopeIndices.includes(idx))
  return skip
}
