import { TaskParamType, TaskType } from "@/types/TaskType";
import { WorkflowTask } from "@/types/workflow";
import { CodeIcon, LucideProps } from "lucide-react";

export const PageToHtmlTask = {
   type: TaskType.PAGE_TO_HTML,
   label: 'Get html for page',
   icon:(props: LucideProps)=><CodeIcon className="stroke-rose-400" {...props}/>,
   isEntryPoint: false,
   inputs:[{
      name:'Web page',
      type:TaskParamType.BROWSER_INSTANCE,
      required:true,
      hideHandle:false
   }],
   credits:2,
   outputs:[{name:'Html', type:TaskParamType.STRING},
      {name:"Web page", type:TaskParamType.BROWSER_INSTANCE}
   ]
} satisfies WorkflowTask