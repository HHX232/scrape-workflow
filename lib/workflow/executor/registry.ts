import { ExecutionEnviroment } from "@/types/Enviroment";
import { TaskType } from "@/types/TaskType";
import { WorkflowTask } from "@/types/workflow";
import { ClickElementExecutor } from "./ClickElementExecutor";
import { DeliverViaWebhookExecutor } from "./DeliverViaWebhookExecutor";
import { ExtractDataWithAIExecutor } from "./ExtractDataWithAIExecutor";
import { ExtractTextFromElementExecutor } from "./ExtractTextFromElementExecutor";
import { FillInputExecutor } from "./FillInputExecutor";
import { LaunchBrowserExecutor } from "./LaunchBrowserExecutor";
import { PageToHtmlExecutor } from "./PageToHtmlExecutor";
import { ReadPropertyFromJSONExecutor } from "./ReadPropertyFromJSONExecutor";
import { WaitForElementExecutor } from "./WaitForElementExecutor";
import { AddPropertyToJSONExecutor } from "./AddPropertyToJSONExecutor";

type ExecutorFn<T extends WorkflowTask> = (enviroment:ExecutionEnviroment<T>) => Promise<boolean>

type RegistryType = {
   [K in TaskType]: ExecutorFn<WorkflowTask & {type: K}>
}
export const ExecutorRegistry:RegistryType = {
   LAUNCH_BROWSER: LaunchBrowserExecutor,
   PAGE_TO_HTML:PageToHtmlExecutor,
   EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElementExecutor,
   FILL_INPUT: FillInputExecutor,
   CLICK_ELEMENT: ClickElementExecutor,
   WAIT_FOR_ELEMENT: WaitForElementExecutor,
   DELIVER_VIA_WEBHOOK: DeliverViaWebhookExecutor,
   EXTRACT_DATA_WITH_AI: ExtractDataWithAIExecutor,
   READ_PROPERTY_FROM_JSON: ReadPropertyFromJSONExecutor,
   ADD_PROPERTY_TO_JSON: AddPropertyToJSONExecutor
}