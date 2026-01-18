import prisma from '@/lib/prisma'
import { symmetricDecrypt } from '@/lib/symmetricEncrypt'
import { ExecutionEnviroment } from '@/types/Enviroment'
import Groq from 'groq-sdk'
import { ExtractDataWithAITask } from '../task/ExtractDataWithAI'

export async function ExtractDataWithAIExecutor(
  enviroment: ExecutionEnviroment<typeof ExtractDataWithAITask>
): Promise<boolean> {
  try {
    const content = enviroment.getInput('Content')
    if (!content) {
      enviroment.log.error('input -> Content is not defined')
      return false
    }
    const credentials = enviroment.getInput('Credential')
    if (!credentials) {
      enviroment.log.error('input -> credentials is not defined')
      return false
    }
    const prompt = enviroment.getInput('Prompt')
    if (!prompt) {
      enviroment.log.error('input -> Prompt is not defined')
      return false
    }
    const credential = await prisma.credential.findUnique({
      where: {
        id: credentials
      }
    })
    if (!credential) {
      enviroment.log.error('Credential not found')
      return false
    }
    const plainCredentialValue = symmetricDecrypt(credential.value)
    if (!plainCredentialValue) {
      enviroment.log.error('Credential value is not defined')
      return false
    }

    const groq = new Groq({
      apiKey: plainCredentialValue
    })
    
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a webscraper helper that extracts data from HTML or text. You will be given a piece of text or HTML content as input and also the prompt with the data you have to extract. The response should always be only the extracted data as a JSON array or object, without any additional words or explanations. Analyze the input carefully and extract data precisely based on the prompt. If no data is found, return an empty JSON array. Work only with the provided content and ensure the output is always a valid JSON array without any surrounding text'
        },
        {role: 'user', content: content},
        {role: 'user', content: prompt}
      ],
      temperature: 1,
      max_tokens: 1000
    })
    
    enviroment.log.info('Prompt tokens: ' + `${response.usage?.prompt_tokens}`)
    enviroment.log.info('Completion tokens: ' + `${response.usage?.completion_tokens}`)
    
    const result = response.choices[0].message.content
    if (!result) {
      enviroment.log.error('No result found')
      return false
    }
    
    enviroment.setOutput('Extracted data', result)
    return true
  } catch (error) {
    enviroment.log.error('Error extracting data with AI: ' + (error instanceof Error ? error.message : String(error)))
    return false
  }
}