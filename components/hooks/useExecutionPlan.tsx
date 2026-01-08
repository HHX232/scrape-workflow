import { FlowToExecutionPlan, FlowToExecutionPlanValidationError } from '@/lib/workflow/executionPlan'
import { AppNode } from '@/types/appNode'
import { useReactFlow } from '@xyflow/react'
import { useCallback } from 'react'
import { toast } from 'sonner'
import useFlowValidation from './useFlowValidation'

const useExecutionPlan = () => {
  const {toObject} = useReactFlow()
  const {setInvalidInputs, clearErrors} = useFlowValidation()
  const handleError = useCallback((error: any) => {
    console.error('Execution plan error:', error)
    switch (error.type) {
      case FlowToExecutionPlanValidationError.NO_ENTRY_POINT:
        toast.error('No entry point found in the workflow')
        break
      case FlowToExecutionPlanValidationError.INVALID_INPUTS:
        toast.error('Invalid inputs found in the workflow')
        console.log('---error', error)
        setInvalidInputs(error.invalidElements)
        break
      default:
        toast.error('An error occurred while generating the execution plan')
        break;
    }
  }, [])

  const generateExecutionPlan = useCallback(() => {
    const {nodes, edges} = toObject()
    const {executionPlan, error} = FlowToExecutionPlan(nodes as AppNode[], edges)
    if (error) {
      handleError(error)
      return null
    }
    clearErrors();
    return executionPlan
  }, [toObject, handleError, clearErrors])
  return generateExecutionPlan
}

export default useExecutionPlan
