import {
  TeleCallbackQuery,
  TeleInlineKeyboard,
  TeleMessage,
  TeleMessageEntities,
  TeleReplyKeyboard,
} from './tele-types'

/* This js file is an extension to the multi-purpose telegram_interface js file
 * meant for this bot in particular */
import {
  answerCallbackQuery,
  cleanseString,
  convertToHTML,
  embedMetadata,
  genInlineButtons,
  sendMessage,
} from './telegram-inteface'
const CALLBACK_DELIMETER = '<>'
const BOT_KEY = process.env.TELE_BOT_KEY

export async function processTeleCallback(callback: TeleCallbackQuery) {
  let msgText = callback.message.text
  const formatting = callback.message.entities
  if (formatting) {
    msgText = convertToHTML(msgText, formatting)
  }
  const data = callback.data.split(CALLBACK_DELIMETER)
  let x = extractMetadata(msgText)
  console.log(x)
  console.log(JSON.stringify(x))
  await answerCallbackQuery(BOT_KEY, callback.id, 'Thank you', false)
}

export async function processTeleMsg(message: TeleMessage) {
  let textMsg = _formatText(message.text, message.entities)
  // -- Commands
  // Start/registration
  if (_identifyCommand('/start', textMsg)) {
    await sendMsg(message.from.id, 'No functionality available')
    // Identifying chat Id [send to personal chat]
  } else if (_identifyCommand('/identify', textMsg)) {
    await sendMsg(message.chat.id, message.chat.id.toString())
  } else if (_identifyCommand('/test', textMsg)) {
    const msg = embedMetadata(
      { function: 'test', hello: 123 },
      'Sup nothing to see here',
    )
    const btns = genInlineButtons([['test']], ['test'])
    await sendMsg(message.from.id, msg, btns)
  } else {
  }
}

function _identifyCommand(command: string, textMsg: string) {
  return textMsg.indexOf(command) >= 0
}

// Wrapper for telegram_interface.js sendMessage()
async function sendMsg(
  id: number,
  msg: string,
  reply_markup:
    | TeleInlineKeyboard
    | TeleReplyKeyboard = {} as TeleInlineKeyboard,
) {
  await sendMessage(BOT_KEY, id, msg, reply_markup)
}

// Helper functions
function _formatText(textMsg: string, formatting: [TeleMessageEntities]) {
  if (!textMsg) return 'empty'
  // malice removal
  textMsg = cleanseString(textMsg)
  textMsg = textMsg.replace(/\"/g, "'")
  if (formatting) {
    textMsg = convertToHTML(textMsg, formatting)
  }
  return textMsg
}
function extractMetadata(msgText: string) {
  throw new Error('Function not implemented.')
}
