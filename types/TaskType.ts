export enum TaskType {
   LAUNCH_BROWSER = 'LAUNCH_BROWSER',
   PAGE_TO_HTML = 'PAGE_TO_HTML',
    EXTRACT_TEXT_FROM_ELEMENT = 'EXTRACT_TEXT_FROM_ELEMENT'
}
export enum TaskParamType {
   STRING = 'STRING',
   NUMBER = 'NUMBER',
   BOOLEAN = 'BOOLEAN',
   BROWSER_INSTANCE = 'BROWSER_INSTANCE',
  
}

export interface TaskParam {
   name:string
   type:TaskParamType
   helpText?:string
   required?:boolean
   hideHandle?:boolean
   value?:string
   [key:string]:any
}