import { TaskParamType } from "@/types/TaskType";

export const colorForHandle:Record<TaskParamType, string> = {
   [TaskParamType.BROWSER_INSTANCE]: "!bg-sky-400",
   [TaskParamType.STRING]: '!bg-amber-400',
   [TaskParamType.NUMBER]: '!bg-emerald-400',
   [TaskParamType.BOOLEAN]: '!bg-rose-400'
}