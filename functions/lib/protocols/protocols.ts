import { Protocol } from '../firestore/firestore-types'
import { sendMsg } from '../telegram/telegram-extension'
import { genInlineButtons } from '../telegram/telegram-inteface'

async function _defaultResponse(chatId: number, protocol: Protocol) {
  const btns = genInlineButtons([['Reset']], ['resetStage'])
  return sendMsg(
    chatId,
    `Hmm you're currently in the middle of ${protocol}. Would you like to reset?`,
    btns,
  )
}
