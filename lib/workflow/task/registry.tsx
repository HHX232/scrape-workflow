import { TaskType } from "@/types/TaskType";
import { WorkflowTask } from "@/types/workflow";
import { AddPropertyToJSONTask } from "./AddPropertyToJSON";
import { ClickElementTask } from "./ClickElement";
import { DeliverViaWebhookTask } from "./DeliverViaWebhook";
import { DownloadImages } from "./DownloadImages";
import { ExtractDataWithAITask } from "./ExtractDataWithAI";
import { ExtractTextFromElement } from "./ExtractTextFromElement";
import { ExtractTextFromElements } from "./ExtractTextFromElements";
import { FillInputTask } from "./Fill_Input";
import { LaunchBrowserTask } from "./LaunchBrowser";
import { NavigateUrlTask } from "./NavigateUrl";
import { PageToHtmlTask } from "./PageToHtml";
import { ReadPropertyFromJSONTask } from "./ReadPropertyFromJSON";
import { ScrollToElementTask } from "./ScrollToElement";
import { TakeScreenshot } from "./TakeScreenshot";
import { WaitForElementTask } from "./WaitForElement";
import { SaveScreenshot } from "./SaveScreenshot";

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
   [TaskType.ADD_PROPERTY_TO_JSON]: AddPropertyToJSONTask,
   [TaskType.NAVIGATE_URL]: NavigateUrlTask,
   [TaskType.SCROLL_TO_ELEMENT]: ScrollToElementTask,
   [TaskType.EXTRACT_TEXT_FROM_ELEMENTS]: ExtractTextFromElements,
   [TaskType.TAKE_SCREENSHOT]: TakeScreenshot,
   [TaskType.DOWNLOAD_IMAGES]: DownloadImages,
   [TaskType.SAVE_SCREENSHOT]: SaveScreenshot
}
   
