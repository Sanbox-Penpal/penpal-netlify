/* This js file is an extension to the multi-purpose telegram_interface js file
 * meant for this bot in particular */
import { getUserState } from '../firestore/firestore-interface'
import { Protocol, SignUpStage, State } from '../firestore/firestore-types'
import { signUpProtocol } from '../protocols/sign-up-protocol'
import {
  TeleCallbackQuery,
  TeleInlineKeyboard,
  TeleMessage,
  TeleMessageEntities,
  TeleReplyKeyboard,
} from './tele-types'

import {
  answerCallbackQuery,
  cleanseString,
  convertToHTML,
  sendMessage,
  genInlineUrlButtons,
  extractMetadata,
} from './telegram-inteface'
const CALLBACK_DELIMETER = '<>'
const BOT_KEY = process.env.TELE_BOT_KEY
const BOT_LINK = 'https://t.me/sanbox_penpal_tbot'

export async function processTeleMsg(message: TeleMessage) {
  let textMsgHtml = formatTeleTextToHtml(message.text, message.entities)

  // Commands
  if (_isCommand(textMsgHtml)) return _runCommand(textMsgHtml, message)

  // Prevent group use
  if (message.from.id !== message.chat.id) {
    return
  }

  // Plain Text
  const userState = await getUserState(message.from.id.toString())
  if (!userState) return
  switch (userState.protocol) {
    case Protocol.SIGN_UP:
      return signUpProtocol(message.from, userState, message)
    case Protocol.VERIFY:
    case Protocol.TINDER:
    default:
  }
}

export async function processTeleCallback(callback: TeleCallbackQuery) {
  const metadata = extractMetadata(
    formatTeleTextToHtml(callback.message.text, callback.message.entities),
  )
  let state: State
  if (!metadata) {
    state = await getUserState(callback.from.id.toString())
    if (!state)
      return answerCallbackQuery(BOT_KEY, callback.id, 'Incorrect state', false)
  } else {
    state = {
      protocol: metadata.protocol,
      stateStage: metadata.stage,
      stateData: metadata.data,
    }
  }

  const data = callback.data ? callback.data.split(CALLBACK_DELIMETER) : null

  switch (state.protocol) {
    case Protocol.SIGN_UP:
      return signUpProtocol(callback.from, state, callback.message, data)
    case Protocol.VERIFY:
    case Protocol.TINDER:
    default:
  }

  // TODO: Disseminate callback query answer down to protocols
  await answerCallbackQuery(BOT_KEY, callback.id, 'Thank you', false)
}

async function _runCommand(htmlMsg: string, message: TeleMessage) {
  // Prevent group use
  if (message.from.id !== message.chat.id) {
    const btns = genInlineUrlButtons(
      [['Go to Bot']],
      ['group-link'],
      [BOT_LINK],
    )
    return sendMsg(
      message.chat.id,
      'Sorry, this bot does not work in groups',
      btns,
    )
  }
  // Command List
  if (
    _identifyCommand('/start', htmlMsg) ||
    _identifyCommand('/register', htmlMsg)
  ) {
    const newSignUpState: State = {
      protocol: Protocol.SIGN_UP,
      stateStage: SignUpStage.PDPA,
      stateData: null,
    }
    return signUpProtocol(message.from, newSignUpState, message)
  } else if (_identifyCommand('/identify', htmlMsg)) {
    // Identifying chat Id
    return sendMsg(message.chat.id, message.chat.id.toString())
  } else if (_identifyCommand('/test', htmlMsg)) {
    // const msg = embedMetadata(
    //   { function: 'test', hello: 123 },
    //   'Sup nothing to see here',
    // )
    // const btns = genInlineButtons([['test']], ['test'])
    // return sendMsg(message.from.id, msg, btns)
  } else {
    return sendMsg(message.from.id, 'Unrecognized command')
  }
}

// Helper functions
function _identifyCommand(command: string, textMsg: string) {
  return textMsg.indexOf(command) >= 0
}

function _isCommand(textMsg: string) {
  return textMsg.indexOf('/') >= 0
}

// Wrapper for telegram_interface.js sendMessage()
export async function sendMsg(
  id: number | string,
  msg: string,
  reply_markup:
    | TeleInlineKeyboard
    | TeleReplyKeyboard = {} as TeleInlineKeyboard,
) {
  await sendMessage(BOT_KEY, id, msg, reply_markup)
}

// Helper functions
export function formatTeleTextToHtml(
  textMsg: string,
  formatting: [TeleMessageEntities],
) {
  if (!textMsg) return 'empty'
  // malice removal
  textMsg = cleanseString(textMsg)
  textMsg = textMsg.replace(/\"/g, "'")
  if (formatting) {
    textMsg = convertToHTML(textMsg, formatting)
  }
  return textMsg
}

export async function informAdmins(
  admins: string[],
  msgText: string,
  btns: TeleInlineKeyboard = {} as TeleInlineKeyboard,
) {
  let promises = []
  admins.forEach((admin) => {
    promises.push(sendMsg(parseInt(admin), msgText, btns))
  })
  await Promise.all(promises)
}
