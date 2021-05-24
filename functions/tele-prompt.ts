import { TeleUpdate } from './lib/telegram/tele-types'
import {
  processTeleCallback,
  processTeleMsg,
} from './lib/telegram/telegram-extension'
import { getStatics } from './lib/firestore/firestore-interface'
import { sendMessage } from './lib/telegram/telegram-inteface'
const TELE_BOT_KEY = process.env.TELE_BOT_KEY

export async function handler(event, context) {
  var httpMethod = event.httpMethod
  switch (httpMethod) {
    case 'POST':
      const prompt = JSON.parse(event.body)
      await processTelePrompt(prompt)
      break
    case 'GET':
      var test = await getStatics.sign_up
      await sendMessage(TELE_BOT_KEY, 90554672, test.PDPA)
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
      await processTeleMsg(prompt.message)
    } else if (prompt.callback_query) {
      await processTeleCallback(prompt.callback_query)
    }
  } catch (e) {
    console.log(e)
  }
}
