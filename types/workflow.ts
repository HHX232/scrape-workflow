import { LucideProps } from 'lucide-react'
import { TaskParam, TaskType } from './TaskType'
import { AppNode } from './appNode'

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

export type WorkflowTask = {
  label: string
  icon: React.FC<LucideProps>
  type: TaskType
  isEntryPoint?: boolean
  inputs: TaskParam[]
  outputs: TaskParam[]
  credits: number
  dynamicInputs?: boolean
  dynamicInputPrefix?: string
  dynamicOutputPrefix?: string
  extraDynamicInputs?: { prefix: string; addLabel?: string }
  // Toggle-controlled output sets: when node.data.inputs[flagInput] === 'true',
  // whenTrue outputs replace the ones listed in `replaces` (by name).
  conditionalOutputs?: { flagInput: string; whenTrue: TaskParam[]; replaces: string[] }[]
}

export type WorkflowExecutionPlanPhase = {
  phase: number
  nodes: AppNode[]
}

export type WorkflowExecutionPlan = WorkflowExecutionPlanPhase[]

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}
export enum WorkflowExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CREATED = 'CREATED',
  CANCELLED = 'CANCELLED'
}

export enum WorkflowExecutionTrigger {
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
  API = 'API',
  CRON = 'CRON'
}
