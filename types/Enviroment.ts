import { Browser, Page } from 'puppeteer'
import { LogCollector } from './log'
import { WorkflowTask } from './workflow'

export type Enviroment = {
  browser?: Browser
  page?:Page
  phases: Record<
    string,
    {
      inputs: Record<string, string>
      outputs: Record<string, string>
    }
  >
}

export type ExecutionEnviroment<T extends WorkflowTask> = {
  getInput(name: T["inputs"][number]['name']): string
  setOutput(name:T['outputs'][number]['name'], value:string | Buffer): void

  getBrowser(): Browser | undefined
  setBrowser(browser: Browser ): void
  getPage(): Page | undefined
  setPage(page:Page): void
 __forEachIndex?: number
  __accumulators?: Record<string, any>
  log: LogCollector;
}
