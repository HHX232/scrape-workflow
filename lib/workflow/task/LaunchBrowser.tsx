import { TaskParamType, TaskType } from "@/types/TaskType";
import { WorkflowTask } from "@/types/workflow";
import { GlobeIcon, LucideProps } from "lucide-react";

export const LaunchBrowserTask = {
   type: TaskType.LAUNCH_BROWSER,
   label: 'Launch Browser',
   icon:(props: LucideProps)=><GlobeIcon className="stroke-pink-400" {...props}/>,
   isEntryPoint: true,
   credits:5,
   inputs:[{
      name:'Website Url',
      type:TaskParamType.STRING,
      helpText:'eg: https://www.google.com',
      required:true,
      hideHandle:true
   }],
   outputs:[{name:'Web page html', type:TaskParamType.BROWSER_INSTANCE}]
} satisfies WorkflowTask;