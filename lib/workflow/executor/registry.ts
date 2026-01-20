import { ExecutionEnviroment } from "@/types/Enviroment";
import { TaskType } from "@/types/TaskType";
import { WorkflowTask } from "@/types/workflow";
import { AddPropertyToJSONExecutor } from "./AddPropertyToJSONExecutor";
import { ClickElementExecutor } from "./ClickElementExecutor";
import { DeliverViaWebhookExecutor } from "./DeliverViaWebhookExecutor";
import { DownloadImagesExecutor } from "./DownloadImagesExecutor";
import { ExtractDataWithAIExecutor } from "./ExtractDataWithAIExecutor";
import { ExtractTextFromElementExecutor } from "./ExtractTextFromElementExecutor";
import { ExtractTextFromElementsExecutor } from "./ExtractTextFromElementsExecutor";
import { FillInputExecutor } from "./FillInputExecutor";
import { LaunchBrowserExecutor } from "./LaunchBrowserExecutor";
import { NavigateUrlExecutor } from "./NavugateURLExecutor";
import { PageToHtmlExecutor } from "./PageToHtmlExecutor";
import { ReadPropertyFromJSONExecutor } from "./ReadPropertyFromJSONExecutor";
import { ScrollToElementExecutor } from "./ScrollToElementExecutor";
import { TakeScreenshotExecutor } from "./TakeScreenshotExecutor";
import { WaitForElementExecutor } from "./WaitForElementExecutor";
import { SaveScreenshotExecutor } from "./SaveScreenshotExecutor";

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
   ADD_PROPERTY_TO_JSON: AddPropertyToJSONExecutor,
   NAVIGATE_URL: NavigateUrlExecutor,
   SCROLL_TO_ELEMENT: ScrollToElementExecutor,
   EXTRACT_TEXT_FROM_ELEMENTS: ExtractTextFromElementsExecutor,
   TAKE_SCREENSHOT: TakeScreenshotExecutor,
   DOWNLOAD_IMAGES: DownloadImagesExecutor,
   SAVE_SCREENSHOT: SaveScreenshotExecutor
}