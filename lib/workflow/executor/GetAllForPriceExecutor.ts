import { getAllForPrice } from '@/lib/helper/getAllForPrice'
import { ExecutionEnviroment } from '@/types/Enviroment'
import { GetAllForPriceTask } from '../task/GetAllForPrice'

export async function GetAllForPriceExecutor(
  enviroment: ExecutionEnviroment<typeof GetAllForPriceTask>
): Promise<boolean> {
  try {
    const priceStr = enviroment.getInput('Price')
    if (!priceStr) {
      enviroment.log.error('input -> Price is not defined')
      return false
    }

    const currencyStr = enviroment.getInput('Currency')
    if (!currencyStr) {
      enviroment.log.error('input -> Currency is not defined')
      return false
    }

    const unitStr = enviroment.getInput('Unit')
    if (!unitStr) {
      enviroment.log.error('input -> Unit is not defined')
      return false
    }

    const result = getAllForPrice(unitStr, priceStr, currencyStr)

    enviroment.setOutput('Price JSON', JSON.stringify(result))
    enviroment.setOutput('Value', String(result.value))
    enviroment.setOutput('Currency', result.currency)
    enviroment.setOutput('Unit', result.unit)

    return true
  } catch (error) {
    enviroment.log.error('Error parsing price data')
    return false
  }
}
