import {
  getStatics,
  updateUserHobbies,
  updateUserInterests,
  updateUserIntroduction,
  updateUserState,
} from '../firestore/firestore-interface'
import {
  User,
  ProfileStage,
  UserStatus,
  ProfileStageStatics,
  Protocol,
} from '../firestore/firestore-types'
import { TeleInlineKeyboard, TeleMessage } from '../telegram/tele-types'
import { sendMsg } from '../telegram/telegram-extension'
import {
  answerCallbackQuery,
  genInlineButtons,
  updateMessage,
} from '../telegram/telegram-inteface'
import { createNewState } from './protocol-utils'

const BOT_KEY = process.env.TELE_BOT_KEY

export async function profileProtocol(
  user: User,
  msg: TeleMessage,
  callbackId?: string,
  callbackData?: string[],
) {
  const msgs = await getStatics.profile
  if (user!.status != UserStatus.APPROVED)
    return sendMsg(user.id, msgs.NOT_CLEARED)

  if (callbackId)
    return _processButtonPress(msgs, user, msg, callbackId, callbackData)
  switch (user.state.stateStage) {
    case ProfileStage.INITIALIZE:
      return _initialize(msgs, user)
    case ProfileStage.INTRODUTION:
      return _introductionReply(msgs, user, msg)
    case ProfileStage.HOBBIES:
      return _hobbiesReply(msgs, user, msg)
    case ProfileStage.INTERESTS:
      return _interestsReply(msgs, user, msg)
    default:
  }
}

async function _initialize(
  msgs: ProfileStageStatics,
  user: User,
  msgId?: number,
  callbackId?: string,
) {
  user.state = createNewState(Protocol.PROFILE, ProfileStage.INTRODUTION, msgId)
  let textMsg = _updateTemplate(msgs.TEMPLATE, user)
  textMsg += `\n\n\n${msgs.INTRODUCTION}`
  const btn = genInlineButtons([['Clear', 'Next']], ['Clear', 'Next'])
  if (callbackId) {
    await updateUserState(user.id, user.state)
    return updateMessage(BOT_KEY, user.id, msgId, textMsg, btn)
  }
  let msg = await sendMsg(user.id, textMsg, btn)
  user.state.stateData = msg.message_id
  return updateUserState(user.id, user.state)
}

async function _introductionReply(
  msgs: ProfileStageStatics,
  user: User,
  msg: TeleMessage,
) {
  user.introduction = msg.text
  await updateUserIntroduction(user.id, user.introduction)
  return _updateTelegramView(msgs, user, user.state.stateData)
}

async function _hobbiesReply(
  msgs: ProfileStageStatics,
  user: User,
  msg: TeleMessage,
) {
  user.hobbies.push(msg.text)
  await updateUserHobbies(user.id, user.hobbies)
  return _updateTelegramView(msgs, user, user.state.stateData)
}

async function _interestsReply(
  msgs: ProfileStageStatics,
  user: User,
  msg: TeleMessage,
) {
  user.interests.push(msg.text)
  await updateUserInterests(user.id, user.interests)
  return _updateTelegramView(msgs, user, user.state.stateData)
}

async function _processButtonPress(
  msgs: ProfileStageStatics,
  user: User,
  msg: TeleMessage,
  callbackId: string,
  callbackData: string[],
) {
  let callback = callbackData[0]
  if (callback == 'Initialize') {
    return _initialize(msgs, user, msg.message_id, callbackId)
  } else if (callback != 'Next' && callback != 'Clear')
    return answerCallbackQuery(
      BOT_KEY,
      callbackId,
      'You are currently setting your profile.',
      true,
    )
  if (callback == 'Next') {
    return _transitionStateCallback(msgs, user, callbackId)
  } else if (callback == 'Clear') {
    return _clearCallback(msgs, user, callbackId)
  }
}

async function _transitionStateCallback(
  msgs: ProfileStageStatics,
  user: User,
  callbackId: string,
) {
  const msgIdToEdit = user.state.stateData
  switch (user.state.stateStage) {
    case ProfileStage.INITIALIZE:
      user.state.stateStage = ProfileStage.INTRODUTION
      break
    case ProfileStage.INTRODUTION:
      user.state.stateStage = ProfileStage.HOBBIES
      break
    case ProfileStage.HOBBIES:
      user.state.stateStage = ProfileStage.INTERESTS
      break
    case ProfileStage.INTERESTS:
      user.state = null
      break
    default:
      return
  }
  await updateUserState(user.id, user.state)
  await answerCallbackQuery(BOT_KEY, callbackId, 'Field updated', false)
  return _updateTelegramView(msgs, user, msgIdToEdit)
}

async function _clearCallback(
  msgs: ProfileStageStatics,
  user: User,
  callbackId: string,
) {
  switch (user.state.stateStage) {
    case ProfileStage.INTRODUTION:
      user.introduction = null
      await updateUserIntroduction(user.id, user.introduction)
      break
    case ProfileStage.HOBBIES:
      user.hobbies = []
      await updateUserHobbies(user.id, user.hobbies)
      break
    case ProfileStage.INTERESTS:
      user.interests = []
      await updateUserInterests(user.id, user.interests)
      break
    default:
      return
  }
  await answerCallbackQuery(BOT_KEY, callbackId, 'Cleared', false)
  return _updateTelegramView(msgs, user, user.state.stateData)
}

async function _updateTelegramView(
  msgs: ProfileStageStatics,
  user: User,
  msgId: number,
) {
  let textMsg = _updateTemplate(msgs.TEMPLATE, user)
  let btns = genInlineButtons([['Clear', 'Next']], ['Clear', 'Next'])
  if (!user.state) {
    textMsg += `\n\n\n${msgs.END}`
    btns = {} as TeleInlineKeyboard
  } else {
    switch (user.state.stateStage) {
      case ProfileStage.INTRODUTION:
        textMsg += `\n\n\n${msgs.INTRODUCTION}`
        break
      case ProfileStage.HOBBIES:
        textMsg += `\n\n\n${msgs.HOBBIES}`
        break
      case ProfileStage.INTERESTS:
        textMsg += `\n\n\n${msgs.INTERESTS}`
        btns = genInlineButtons([['Clear', 'Finish']], ['Clear', 'Next'])
        break
      default:
        return
    }
  }
  return updateMessage(BOT_KEY, user.id, msgId, textMsg, btns)
}

/**
 * $name - user.name
 * $intro - user.introduction
 * $hobbies - user.hobbies
 * $interests - user.interests
 */
function _updateTemplate(template: string, user: User) {
  let res = template.replace('$name', user.name ? user.name : '')
  res = res.replace('$intro', user.introduction ? user.introduction : '')
  res = res.replace(
    '$hobbies',
    user.hobbies.length > 0 ? ' - ' + user.hobbies.join('\n - ') : '',
  )
  res = res.replace(
    '$interests',
    user.interests.length > 0 ? ' - ' + user.interests.join('\n - ') : '',
  )
  return res
}
