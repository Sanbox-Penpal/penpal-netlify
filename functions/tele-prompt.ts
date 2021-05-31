import { TeleUpdate } from './lib/telegram/tele-types'
import {
  processTeleCallback,
  processTeleMsg,
  processTelePrecheckout,
  processTeleReceipt,
} from './lib/telegram/telegram-extension'

export async function handler(event, context) {
  var httpMethod = event.httpMethod
  switch (httpMethod) {
    case 'POST':
      const prompt = JSON.parse(event.body)
      await processTelePrompt(prompt)
      break
    case 'GET':
      break
    default:
  }

  return {
    statusCode: 200,
    body: 'done',
  }
}
async function processTelePrompt(prompt: TeleUpdate) {
  try {
    if (prompt.message) {
      if (prompt.message.successful_payment != null) {
        console.log(prompt.message)
        return processTeleReceipt(prompt.message)
      }
      return processTeleMsg(prompt.message)
    } else if (prompt.callback_query) {
      return processTeleCallback(prompt.callback_query)
    } else if (prompt.pre_checkout_query) {
      return processTelePrecheckout(prompt.pre_checkout_query)
    }
  } catch (e) {
    console.log(e)
  }
}
