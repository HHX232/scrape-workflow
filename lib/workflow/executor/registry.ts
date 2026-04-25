import { ExecutionEnviroment } from "@/types/Enviroment";
import { TaskType } from "@/types/TaskType";
import { WorkflowTask } from "@/types/workflow";
import { AccumulateResultsExecutor } from "./AccumulateResultsExecutor";
import { AddPropertyToJSONExecutor } from "./AddPropertyToJSONExecutor";
import { ClickElementExecutor } from "./ClickElementExecutor";
import { DeliverViaWebhookExecutor } from "./DeliverViaWebhookExecutor";
import { DownloadPdfExecutor } from "./DownloadPdfExecutor";
import { ExtractDataWithAIExecutor } from "./ExtractDataWithAIExecutor";
import { ExtractImagesFromPdfExecutor } from "./ExtractImagesFromPdfExecutor";
import { ExtractLinksExecutor } from "./ExtractLinksExecutor";
import { ExtractTablesFromPdfExecutor } from "./ExtractTablesFromPdfExecutor";
import { ExtractTextFromElementExecutor } from "./ExtractTextFromElementExecutor";
import { ExtractTextFromElementsExecutor } from "./ExtractTextFromElementsExecutor";
import { ExtractTextFromPdfExecutor } from "./ExtractTextFromPdfExecutor";
import { FillInputExecutor } from "./FillInputExecutor";
import { ForEachExecutor } from "./ForEachExecutor";
import { LaunchBrowserExecutor } from "./LaunchBrowserExecutor";
import { MergeTextsToJsonExecutor } from "./MergeTextsToJsonExecutor";
import { NavigateUrlExecutor } from "./NavugateURLExecutor";
import { PageToHtmlExecutor } from "./PageToHtmlExecutor";
import { ReadPropertyFromJSONExecutor } from "./ReadPropertyFromJSONExecutor";
import { SaveImagesToZipExecutor } from "./SaveImagesToZipExecutor";
import { SaveScreenshotExecutor } from "./SaveScreenshotExecutor";
import { SaveTablesAsExcelExecutor } from "./SaveTablesAsExcelExecutor";
import { ScrollToElementExecutor } from "./ScrollToElementExecutor";
import { TakeScreenshotExecutor } from "./TakeScreenshotExecutor";
import { WaitForElementExecutor } from "./WaitForElementExecutor";
import { DownloadImagesExecutor } from "./DownloadImagesExecutor"
import { GetAllLinksInBoxExecutor } from "./GetAllLinksInBoxExecutor"
import { ClickWhileVisibleExecutor } from "./ClickWhileVisibleExecutor"
import { ExtractTableAsJsonExecutor } from "./ExtractTableAsJsonExecutor";

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
   DOWNLOAD_PDF: DownloadPdfExecutor,
   EXTRACT_TEXT_FROM_PDF: ExtractTextFromPdfExecutor,
   EXTRACT_TABLES_FROM_PDF: ExtractTablesFromPdfExecutor,
   EXTRACT_IMAGES_FROM_PDF: ExtractImagesFromPdfExecutor,
   SAVE_IMAGES_TO_ZIP: SaveImagesToZipExecutor,
   SAVE_TABLES_AS_EXCEL: SaveTablesAsExcelExecutor,
   ACCUMULATE_RESULTS:AccumulateResultsExecutor,
   FOR_EACH:ForEachExecutor,
   MERGE_TEXTS_TO_JSON:MergeTextsToJsonExecutor,
   EXTRACT_LINKS:ExtractLinksExecutor,
   SAVE_SCREENSHOT:SaveScreenshotExecutor,
   TAKE_SCREENSHOT:TakeScreenshotExecutor,
   DOWNLOAD_IMAGES:DownloadImagesExecutor,
   GET_ALL_LINKS_IN_BOX:GetAllLinksInBoxExecutor,
   CLICK_WHILE_VISIBLE:ClickWhileVisibleExecutor,
   EXTRACT_TABLE_AS_JSON:ExtractTableAsJsonExecutor,
}