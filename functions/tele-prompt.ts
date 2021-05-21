import { TeleUpdate } from './lib/tele-types'
import { processTeleCallback, processTeleMsg } from './lib/telegram-extension'
import { getContentPage } from './lib/firestore-interface'
import {
  embedMetadata,
  extractMetadata,
  sendMessage,
} from './lib/telegram-inteface'
const TELE_BOT_KEY = process.env.TELE_BOT_KEY

export async function handler(event, context) {
  var httpMethod = event.httpMethod
  switch (httpMethod) {
    case 'POST':
      const prompt = JSON.parse(event.body)
      await processTelePrompt(prompt)
      break
    case 'GET':
      var test = await getContentPage()
      console.log(test)
      await sendMessage(TELE_BOT_KEY, 90554672, 'hello')
      break
    default:
  }

  return {
    statusCode: 200,
    body: 'done',
  }
}
async function processTelePrompt(prompt: TeleUpdate) {
  if (prompt.message) {
    await processTeleMsg(prompt.message)
  } else if (prompt.callback_query) {
    await processTeleCallback(prompt.callback_query)
  }
}
