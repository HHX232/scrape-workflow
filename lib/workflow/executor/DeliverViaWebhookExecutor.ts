import { ExecutionEnviroment } from '@/types/Enviroment'
import { DeliverViaWebhookTask } from '../task/DeliverViaWebhook'

export async function DeliverViaWebhookExecutor(
  enviroment: ExecutionEnviroment<typeof DeliverViaWebhookTask>
): Promise<boolean> {
  try {
    const body = enviroment.getInput('Body')
    if (!body) {
      enviroment.log.error('input -> Body is not defined')
      return false
    }
    const targetUrl = enviroment.getInput('Target Url')
    if (!targetUrl) {
      enviroment.log.error('input -> targetUrl is not defined')
      return false
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const statusCode = response.status
    if (statusCode !== 200) {
      enviroment.log.error(`Error fetch body with status code: ${statusCode}`)
      return false
    }
    const responseBody = await response.json()
    enviroment.log.info(`Response body: ${JSON.stringify(responseBody, null, 4)}`)
    return true
  } catch (error) {
    enviroment.log.error('Error fetching body')
    return false
  }
}
