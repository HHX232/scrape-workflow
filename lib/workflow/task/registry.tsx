import { LaunchBrowserTask } from "./LaunchBrowser";
import { PageToHtmlTask } from "./PageToHtml";
import { ExtractTextFromElement } from "./ExtractTextFromElement";
import { TaskType } from "@/types/TaskType";
import { WorkflowTask } from "@/types/workflow";

type Registry = {
   [K in TaskType]: WorkflowTask & {type: K}
}

export const TaskRegistry: Registry = {
   [TaskType.LAUNCH_BROWSER]: LaunchBrowserTask,
   [TaskType.PAGE_TO_HTML]: PageToHtmlTask,
   [TaskType.EXTRACT_TEXT_FROM_ELEMENT]: ExtractTextFromElement,
}
   
