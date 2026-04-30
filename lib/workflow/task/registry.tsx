import { TaskType } from "@/types/TaskType";
import { WorkflowTask } from "@/types/workflow";
import { AccumulateResultsTask } from "./AccumulateResultsTask";
import { AddPropertyToJSONTask } from "./AddPropertyToJSON";
import { ClickElementTask } from "./ClickElement";
import { DeliverViaWebhookTask } from "./DeliverViaWebhook";
import { DownloadPdf } from "./DownloadPdf";
import { ExtractDataWithAITask } from "./ExtractDataWithAI";
import { ExtractImagesFromPdf } from "./ExtractImagesFromPdf";
import { ExtractLinksTask } from "./ExtractLinksTask";
import { ExtractTablesFromPdf } from "./ExtractTablesFromPdf";
import { ExtractTextFromElement } from "./ExtractTextFromElement";
import { ExtractTextFromElements } from "./ExtractTextFromElements";
import { ExtractTextFromPdf } from "./ExtractTextFromPdf";
import { FillInputTask } from "./Fill_Input";
import { ForEachTask } from "./ForEach";
import { LaunchBrowserTask } from "./LaunchBrowser";
import { MergeTextsToJsonTask } from "./MergeTextsToJsonTask";
import { NavigateUrlTask } from "./NavigateUrl";
import { PageToHtmlTask } from "./PageToHtml";
import { ReadPropertyFromJSONTask } from "./ReadPropertyFromJSON";
import { SaveImagesToZip } from "./SaveImagesToZip";
import { SaveScreenshot } from "./SaveScreenshot";
import { SaveTablesAsExcel } from "./SaveTablesAsExcel";
import { ScrollToElementTask } from "./ScrollToElement";
import { TakeScreenshot } from "./TakeScreenshot";
import { WaitForElementTask } from "./WaitForElement";
import { DownloadImages } from "./DownloadImages"
import { GetAllLinksInBoxTask } from "./GetAllLinksInBoxTask"
import { ClickWhileVisibleTask } from "./ClickWhileVisibleTask"
import { ExtractTableAsJsonTask } from "./ExtractTableAsJsonTask";
import { GetAllForPriceTask } from "./GetAllForPrice";
import { MergeArraysTask } from "./MergeArraysTask";
import { CoalesceTask } from "./CoalesceTask";

type Registry = {
   [K in TaskType]: WorkflowTask & {type: K}
}

export const TaskRegistry: Registry = {
   [TaskType.LAUNCH_BROWSER]: LaunchBrowserTask,
   [TaskType.PAGE_TO_HTML]: PageToHtmlTask,
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
   [TaskType.DOWNLOAD_PDF]: DownloadPdf,
   [TaskType.EXTRACT_TEXT_FROM_PDF]: ExtractTextFromPdf,
   [TaskType.EXTRACT_TABLES_FROM_PDF]: ExtractTablesFromPdf,
   [TaskType.EXTRACT_IMAGES_FROM_PDF]: ExtractImagesFromPdf,
   [TaskType.SAVE_IMAGES_TO_ZIP]: SaveImagesToZip,
   [TaskType.SAVE_TABLES_AS_EXCEL]: SaveTablesAsExcel,
    [TaskType.FOR_EACH]: ForEachTask,
  [TaskType.ACCUMULATE_RESULTS]: AccumulateResultsTask,
  [TaskType.MERGE_TEXTS_TO_JSON]: MergeTextsToJsonTask,
  [TaskType.EXTRACT_LINKS]: ExtractLinksTask,
  [TaskType.EXTRACT_TEXT_FROM_ELEMENT]: ExtractTextFromElement,
  [TaskType.SAVE_SCREENSHOT]: SaveScreenshot,
  [TaskType.TAKE_SCREENSHOT]: TakeScreenshot,
  [TaskType.DOWNLOAD_IMAGES]: DownloadImages,
  [TaskType.GET_ALL_LINKS_IN_BOX]: GetAllLinksInBoxTask,
  [TaskType.CLICK_WHILE_VISIBLE]: ClickWhileVisibleTask,
  [TaskType.EXTRACT_TABLE_AS_JSON]: ExtractTableAsJsonTask,
  [TaskType.GET_ALL_FOR_PRICE]: GetAllForPriceTask,
  [TaskType.MERGE_ARRAYS]: MergeArraysTask,
  [TaskType.COALESCE]: CoalesceTask,
}
   
