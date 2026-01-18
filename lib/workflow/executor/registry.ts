import { ExecutionEnviroment } from "@/types/Enviroment";
import { TaskType } from "@/types/TaskType";
import { WorkflowTask } from "@/types/workflow";
import { ExtractTextFromElementExecutor } from "./ExtractTextFromElementExecutor";
import { LaunchBrowserExecutor } from "./LaunchBrowserExecutor";
import { PageToHtmlExecutor } from "./PageToHtmlExecutor";


type ExecutorFn<T extends WorkflowTask> = (enviroment:ExecutionEnviroment<T>) => Promise<boolean>

type RegistryType = {
   [K in TaskType]: ExecutorFn<WorkflowTask & {type: K}>
}
export const ExecutorRegistry:RegistryType = {
   LAUNCH_BROWSER: LaunchBrowserExecutor,
   PAGE_TO_HTML:PageToHtmlExecutor,
   EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElementExecutor
}