/* This js file is an extension to the multi-purpose telegram_interface js file
 * meant for this bot in particular */
import { getStatics, getUser } from '../firestore/firestore-interface'
import {
  DeregisterStage,
  ProfileStage,
  Protocol,
  SignUpStage,
  TinderStage,
  User,
  UserStatus,
} from '../firestore/firestore-types'
import { aboutProtocol } from '../protocols/about-protocol'
import { deregisterProtocol } from '../protocols/deregister-protocol'
import { giftProtocol } from '../protocols/gift-protocol'
import { profileProtocol } from '../protocols/profile-protocol'
import { createNewState, createNewUser } from '../protocols/protocol-utils'
import { signUpProtocol } from '../protocols/sign-up-protocol'
import { tinderProtocol } from '../protocols/tinder-protocol'
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
  const user = await getUser(message.from.id.toString())
  if (!user || !user.state) return
  switch (user.state.protocol) {
    case Protocol.SIGN_UP:
      return signUpProtocol(message.from, user, message)
    case Protocol.PROFILE:
      return profileProtocol(user, message)
    case Protocol.TINDER:
      break
    default:
  }
}

export async function processTeleCallback(callback: TeleCallbackQuery) {
  console.log(
    formatTeleTextToHtml(callback.message.text, callback.message.entities),
  )
  const metadata = extractMetadata(
    formatTeleTextToHtml(callback.message.text, callback.message.entities),
  )
  console.log(metadata)

  let user: User
  if (metadata && metadata.referencedUser) {
    user = await getUser(metadata.referencedUser)
  } else {
    user = await getUser(callback.from.id.toString())
  }

  if (!user)
    return answerCallbackQuery(
      BOT_KEY,
      callback.id,
      'Referenced User not found',
      false,
    )

  if (metadata) {
    user.state = createNewState(
      metadata.protocol,
      metadata.stage,
      metadata.data,
    )
  }

  const msg = callback.message
  const data = callback.data ? callback.data.split(CALLBACK_DELIMETER) : null

  switch (user.state.protocol) {
    case Protocol.SIGN_UP:
      return signUpProtocol(callback.from, user, msg, callback.id, data)
    case Protocol.PROFILE:
      return profileProtocol(user, msg, callback.id, data)
    case Protocol.TINDER:
      return tinderProtocol(user, msg, msg.message_id, callback.id, data)
    case Protocol.DEREGISTER:
      return deregisterProtocol(user, msg, callback.id, data)
    case Protocol.GIFT:
      return giftProtocol(user, msg, callback.id, data)
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
  // -- Register
  if (
    _identifyCommand('/start', htmlMsg) ||
    _identifyCommand('/register', htmlMsg)
  ) {
    let newUser = await getUser(message.from.id.toString())
    if (newUser) {
      if (await bounceUser(newUser)) return
    }
    newUser = createNewUser(
      message.from.id,
      message.from.first_name,
      message.from.username,
    )
    return signUpProtocol(message.from, newUser, message)
    // -- Profile
  } else if (_identifyCommand('/profile', htmlMsg)) {
    let user = await getUser(message.from.id.toString())
    if (!user || user.status != UserStatus.APPROVED)
      return sendMsg(message.from.id, 'You are not registered with Sanbox yet.')
    user.state = createNewState(Protocol.PROFILE, ProfileStage.INITIALIZE)
    return profileProtocol(user, message)
    // -- Tinder
  } else if (_identifyCommand('/find_penpal', htmlMsg)) {
    let user = await getUser(message.from.id.toString())
    if (!user || user.status != UserStatus.APPROVED)
      return sendMsg(message.from.id, 'You are not registered with Sanbox yet.')
    user.state = createNewState(Protocol.TINDER, TinderStage.INITIALIZE)
    return tinderProtocol(user, message)
    // -- Deregister
  } else if (_identifyCommand('/deregister', htmlMsg)) {
    let user = await getUser(message.from.id.toString())
    if (!user)
      return sendMsg(message.from.id, 'You are not registered with Sanbox yet.')
    user.state = createNewState(Protocol.DEREGISTER, DeregisterStage.INITIALIZE)
    return deregisterProtocol(user, message)
    // About
  } else if (_identifyCommand('/about', htmlMsg)) {
    return aboutProtocol(message.from)
    //
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

// /register command bounce
async function bounceUser(user: User) {
  const msgs = await getStatics.sign_up
  switch (user.status) {
    case UserStatus.PENDING:
      if (user.state.stateStage == SignUpStage.VERIFICATION_RESPONSE) {
        await sendMsg(user.id, msgs.BOUNCE_PENDING)
        return true
      }
      return false
    case UserStatus.APPROVED:
      await sendMsg(user.id, msgs.BOUNCE_ACCEPTED)
      return true
    case UserStatus.REJECTED:
      await sendMsg(user.id, msgs.BOUNCE_REJECTED)
      return true
    default:
      return false
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
): Promise<TeleMessage> {
  return sendMessage(BOT_KEY, id, msg, reply_markup)
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
