export enum TaskType {
  LAUNCH_BROWSER = 'LAUNCH_BROWSER',
  PAGE_TO_HTML = 'PAGE_TO_HTML',
  EXTRACT_TEXT_FROM_ELEMENT = 'EXTRACT_TEXT_FROM_ELEMENT',
  FILL_INPUT = 'FILL_INPUT',
  CLICK_ELEMENT = 'CLICK_ELEMENT',
  WAIT_FOR_ELEMENT = 'WAIT_FOR_ELEMENT',
  DELIVER_VIA_WEBHOOK = 'DELIVER_VIA_WEBHOOK',
  EXTRACT_DATA_WITH_AI = 'EXTRACT_DATA_WITH_AI',
  READ_PROPERTY_FROM_JSON = 'READ_PROPERTY_FROM_JSON',
  ADD_PROPERTY_TO_JSON = 'ADD_PROPERTY_TO_JSON',
  NAVIGATE_URL = 'NAVIGATE_URL',
  SCROLL_TO_ELEMENT = 'SCROLL_TO_ELEMENT',
  EXTRACT_TEXT_FROM_ELEMENTS = 'EXTRACT_TEXT_FROM_ELEMENTS',
  TAKE_SCREENSHOT = 'TAKE_SCREENSHOT',
  DOWNLOAD_IMAGES = 'DOWNLOAD_IMAGES',
  SAVE_SCREENSHOT = 'SAVE_SCREENSHOT'
}
export enum TaskParamType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  BROWSER_INSTANCE = 'BROWSER_INSTANCE',
  SELECT = 'SELECT',
  CREDENTIAL = 'CREDENTIAL',
  IMAGE_FILE = 'IMAGE_FILE'
}

export interface TaskParam {
  name: string
  type: TaskParamType
  helpText?: string
  required?: boolean
  hideHandle?: boolean
  value?: string
  [key: string]: any
}

export interface ImageFile {
  data: string // base64 encoded image data
  format: 'png' | 'jpg' | 'jpeg' | 'webp' | 'gif'
  width?: number
  height?: number
  url?: string // original URL if downloaded from web
  filename?: string
  size?: number // size in bytes
}

export interface ImageMetadata {
  src: string
  alt?: string
  width?: string
  height?: string
  title?: string
}