import { TaskType } from "@/types/TaskType";
import { WorkflowTask } from "@/types/workflow";
import { ClickElementTask } from "./ClickElement";
import { DeliverViaWebhookTask } from "./DeliverViaWebhook";
import { ExtractDataWithAITask } from "./ExtractDataWithAI";
import { ExtractTextFromElement } from "./ExtractTextFromElement";
import { FillInputTask } from "./Fill_Input";
import { LaunchBrowserTask } from "./LaunchBrowser";
import { PageToHtmlTask } from "./PageToHtml";
import { ReadPropertyFromJSONTask } from "./ReadPropertyFromJSON";
import { WaitForElementTask } from "./WaitForElement";
import { AddPropertyToJSONTask } from "./AddPropertyToJSON";

type Registry = {
   [K in TaskType]: WorkflowTask & {type: K}
}

export const TaskRegistry: Registry = {
   [TaskType.LAUNCH_BROWSER]: LaunchBrowserTask,
   [TaskType.PAGE_TO_HTML]: PageToHtmlTask,
   [TaskType.EXTRACT_TEXT_FROM_ELEMENT]: ExtractTextFromElement,
   [TaskType.FILL_INPUT]: FillInputTask,
   [TaskType.CLICK_ELEMENT]: ClickElementTask,
   [TaskType.WAIT_FOR_ELEMENT]: WaitForElementTask,
   [TaskType.DELIVER_VIA_WEBHOOK]: DeliverViaWebhookTask,
   [TaskType.EXTRACT_DATA_WITH_AI]: ExtractDataWithAITask,
   [TaskType.READ_PROPERTY_FROM_JSON]: ReadPropertyFromJSONTask,
   [TaskType.ADD_PROPERTY_TO_JSON]: AddPropertyToJSONTask
}
   
