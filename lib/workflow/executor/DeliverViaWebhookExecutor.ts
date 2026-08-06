import { ExecutionEnviroment } from '@/types/Enviroment'
import { DeliverViaWebhookTask } from '../task/DeliverViaWebhook'
import { prepareWebhookBody } from './webhookBodyUtils'

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

    const bodyToSend = prepareWebhookBody(body)

    const response = await fetch(targetUrl, {
      method: 'POST',
      body: bodyToSend,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const statusCode = response.status
    if (statusCode < 200 || statusCode >= 300) {
      const errorBody = await response.text().catch(() => '')
      const sentPreview = truncateForLog(bodyToSend)
      const responsePreview = truncateForLog(errorBody)
      enviroment.log.error(`Webhook returned status ${statusCode}`)
      enviroment.log.error(`Sent body: ${sentPreview}`)
      enviroment.log.error(`Response body: ${responsePreview}`)
      console.log(`[DeliverViaWebhook] ${statusCode} error. sent:`, sentPreview, 'response:', responsePreview)
      return false
    }
    const responseBody = await response.json()
    enviroment.log.info(`Response body: ${JSON.stringify(responseBody, null, 4)}`)
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    enviroment.log.error(`Error fetching body: ${message}`)
    console.log('[DeliverViaWebhook] fetch error:', message)
    return false
  }
}

function truncateForLog(value: string, maxLength = 500): string {
  if (!value) return ''
  return value.length > maxLength ? value.slice(0, maxLength) + '…' : value
}
