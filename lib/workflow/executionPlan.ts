import { AppNode, AppNodeMissingInputs } from '@/types/appNode'
import { TaskParamType } from '@/types/TaskType'
import { WorkflowExecutionPlan, WorkflowExecutionPlanPhase } from '@/types/workflow'
import { Edge } from '@xyflow/react'
import { TaskRegistry } from './task/registry'

export enum FlowToExecutionPlanValidationError {
  NO_ENTRY_POINT = 'MISSING_ENTRY_POINT',
  INVALID_INPUTS = 'INVALID_INPUTS'
}

type FlowToExecutionPlanType = {
  executionPlan?: WorkflowExecutionPlan
  error?: {
    type: FlowToExecutionPlanValidationError
    invalidElements?: AppNodeMissingInputs[]
  }
}

export function FlowToExecutionPlan(nodes: AppNode[], edges: Edge[]): FlowToExecutionPlanType {
  const entryPoint = nodes.find((node) => TaskRegistry[node.data.type]?.isEntryPoint)

  if (!entryPoint) {
    return {error: {type: FlowToExecutionPlanValidationError.NO_ENTRY_POINT}}
  }

  const inputsWithErrors: AppNodeMissingInputs[] = []
  const planned = new Set<string>()

  const invalidInputs = getInvalidInputs(entryPoint, edges, planned)
  if(invalidInputs.length > 0) {
    inputsWithErrors.push({
      nodeId: entryPoint.id,
      missingInputs: invalidInputs
    })
  }

  const executionPlan: WorkflowExecutionPlan = [{phase: 1, nodes: [entryPoint]}]
  planned.add(entryPoint.id)

  for (let phase = 2; phase <= nodes?.length && planned.size < nodes?.length; phase++) {
    const nextPhase: WorkflowExecutionPlanPhase = {phase, nodes: []}
    
    for (const currentNode of nodes) {
      if (planned.has(currentNode.id)) {
        continue
      }

      // ✅ КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: проверяем, что ВСЕ зависимости выполнены
      const incomers = getIncomers(currentNode, nodes, edges)
      const allDependenciesPlanned = incomers.every((incomer) => planned.has(incomer.id))

      // Если есть зависимости, но не все выполнены - пропускаем эту ноду
      if (incomers.length > 0 && !allDependenciesPlanned) {
        continue
      }

      // Проверяем валидность входов
      const invalidInputs = getInvalidInputs(currentNode, edges, planned)

      if (invalidInputs?.length > 0) {
        if (allDependenciesPlanned) {
          // Все зависимости выполнены, но инпуты всё равно невалидны
          console.error('invalid inputs', currentNode.id, invalidInputs)
          inputsWithErrors.push({
            nodeId: currentNode.id,
            missingInputs: invalidInputs
          })
        }
        // Если не все зависимости выполнены, пропускаем (обработаем на следующей фазе)
        continue
      }

      // Добавляем ноду в текущую фазу
      nextPhase.nodes.push(currentNode)
    }

    // Отмечаем ноды как запланированные
    for (const node of nextPhase.nodes) {
      planned.add(node.id)
    }
    
    executionPlan.push(nextPhase)
  }

  if(inputsWithErrors.length > 0) {
    return {
      error: {
        type: FlowToExecutionPlanValidationError.INVALID_INPUTS,
        invalidElements: inputsWithErrors
      }
    }
  }

  return { executionPlan }
}

function getInvalidInputs(node: AppNode, edges: Edge[], planned: Set<string>) {
  const invalidInputs = []
  const inputs = TaskRegistry[node.data.type]?.inputs

  for (const input of inputs) {
    // Пропускаем FILE тип для валидации (они приходят через connections)
    if (input.type === TaskParamType.FILE) {
      continue
    }

    const inputValue = node.data.inputs[input.name]
    const inputValueProvided = inputValue?.length > 0

    // Находим входящее соединение
    const incomingEdges = edges.filter((edge) => edge.target === node.id)
    const inputLinkedToOutput = incomingEdges.find((edge) => {
      const handleInputName = edge.targetHandle?.split('-input-')[1]
      return handleInputName === input.name
    })

    const hasValidConnection = inputLinkedToOutput && planned.has(inputLinkedToOutput.source)

    // Валиден если есть значение ИЛИ есть connection
    if (inputValueProvided || hasValidConnection) {
      continue
    }

    // Не обязательный input без значения - OK
    if (!input.required) {
      continue
    }

    console.log(`    ❌ INVALID INPUT: "${input.name}"`)
    invalidInputs.push(input.name)
  }

  return invalidInputs
}


function getIncomers(node: AppNode, nodes:AppNode[], edges:Edge[]){
   if(!node.id) return []
   const incomersIds = new Set()
   edges.forEach(edge =>{
      if(edge.target === node.id) {
         incomersIds.add(edge.source)
      }
   })
   return nodes.filter(node => incomersIds.has(node.id))
}