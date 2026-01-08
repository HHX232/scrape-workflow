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
  FAILED = 'FAILED'
}
export enum WorkflowExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CREATED = 'CREATED'
}

export enum WorkflowExecutionTrigger {
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
  API = 'API'
}
