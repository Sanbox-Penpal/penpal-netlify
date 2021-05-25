import {
  getAllUsers,
  getStatics,
  getUser,
  updateUser,
  updateUserState,
} from '../firestore/firestore-interface'
import {
  GiftStage,
  Protocol,
  TinderStage,
  TinderStageStatics,
  User,
  UserStatus,
} from '../firestore/firestore-types'
import { TeleInlineKeyboard, TeleMessage } from '../telegram/tele-types'
import { formatTeleTextToHtml, sendMsg } from '../telegram/telegram-extension'
import {
  answerCallbackQuery,
  embedMetadata,
  extractMetadata,
  genInlineButtons,
  updateMessage,
} from '../telegram/telegram-inteface'
import { ProtocolMetadata } from './types'

const BOT_KEY = process.env.TELE_BOT_KEY

export async function tinderProtocol(
  user: User,
  msg: TeleMessage,
  msgId?: number,
  callbackId?: string,
  callbackData?: string[],
) {
  const msgs = await getStatics.tinder
  switch (user.state.stateStage) {
    case TinderStage.INITIALIZE:
      return _initialize(msgs, user, msgId)
    case TinderStage.SWIPE:
      return _swipeCallback(msgs, user, msg, callbackData[0], callbackId)
    default:
  }
}

async function _initialize(
  msgs: TinderStageStatics,
  user: User,
  msgId?: number,
) {
  if (user!.status != UserStatus.APPROVED)
    return sendMsg(user.id, msgs.NOT_CLEARED)
  user.state.protocol = Protocol.TINDER
  user.state.stateStage = TinderStage.SWIPE
  user.state.stateData = null
  return _sendRandomCard(msgs, user, msgId)
}

async function _swipeCallback(
  msgs: TinderStageStatics,
  user: User,
  msg: TeleMessage,
  choice: string,
  callbackId: string,
) {
  const msgId = msg.message_id
  if (user!.status != UserStatus.APPROVED)
    return sendMsg(user.id, msgs.NO_LONGER_CLEARED)

  switch (choice) {
    case 'Swipe Yes':
      const metadata = extractMetadata(
        formatTeleTextToHtml(msg.text, msg.entities),
      )
      let likedUser = await getUser(metadata.data)
      if (!likedUser || likedUser.likedUsers.indexOf(user.id) < 0) {
        user.likedUsers.push(user.state.stateData)
        await answerCallbackQuery(
          BOT_KEY,
          callbackId,
          `${user.name} liked`,
          false,
        )
        return _sendRandomCard(msgs, user, msgId)
      }
      const proceedBtn = genInlineButtons([['Gift a card!']], ['Start'])
      const selfMetadata: ProtocolMetadata = {
        protocol: Protocol.GIFT,
        stage: GiftStage.INITIALIZE,
        referencedUser: user.id,
        data: likedUser.id,
      }
      let msgTextSelf = fillUserFields(user, msgs.MATCH)
      msgTextSelf = embedMetadata(selfMetadata, msgTextSelf)
      await updateUserState(user.id, null)
      await updateMessage(BOT_KEY, user.id, msgId, msgTextSelf, proceedBtn)

      const matchedMetadata: ProtocolMetadata = {
        protocol: Protocol.GIFT,
        stage: GiftStage.INITIALIZE,
        referencedUser: likedUser.id,
        data: user.id,
      }
      let msgTextMatched = fillUserFields(likedUser, msgs.MATCH)
      msgTextMatched = embedMetadata(matchedMetadata, msgTextMatched)
      return sendMsg(likedUser.id, msgTextMatched, proceedBtn)
    case 'Swipe No':
      return _sendRandomCard(msgs, user, msgId)
    case 'Swipe Done':
      await updateUserState(user.id, null)
      return updateMessage(BOT_KEY, user.id, msgId, msgs.COMPLETED)
    default:
  }
}

// Helper Functions
function fillUserFields(user: User, textMsg: string) {
  textMsg.replace('$name', user.name)
  textMsg.replace('$intro', user.introduction)
  textMsg.replace('$hobbies', ' - ' + user.hobbies.join('\n - '))
  textMsg.replace('$interests', ' - ' + user.hobbies.join('\n - '))
  return textMsg
}

async function _sendRandomCard(
  msgs: TinderStageStatics,
  user: User,
  msgId?: number,
) {
  if (user.swiperQueue.length == 0) {
    let allUsers = await getAllUsers()
    allUsers = allUsers != null ? allUsers : []
    let selfIndex = allUsers.indexOf(user.id)
    allUsers.splice(selfIndex, 1)
    shuffleArray(allUsers)
    user.swiperQueue = allUsers
  }
  let randomId = user.swiperQueue.pop()
  let msgText: string
  let btns: TeleInlineKeyboard
  if (randomId != null) {
    await updateUser(user.id, user) // Updates state, swiperQueue and likedUsers if any
    const matchedUser = await getUser(randomId)
    let msgText = fillUserFields(user, msgs.SWIPE_CARD)
    const metadata: ProtocolMetadata = {
      protocol: Protocol.TINDER,
      stage: TinderStage.SWIPE,
      referencedUser: user.id,
      data: matchedUser.id,
    }
    msgText = embedMetadata(metadata, msgText)
    btns = _genNavBtns()
  } else {
    msgText = 'You are the only one in the programme...sorry.'
    btns = {} as TeleInlineKeyboard
  }

  if (!msgId) {
    return sendMsg(user.id, msgText, btns)
  } else {
    return updateMessage(BOT_KEY, user.id, msgId, msgText, btns)
  }
}

function _genNavBtns() {
  return genInlineButtons(
    [['Swipe Yes', 'Nope Next'], ['Done']],
    [`Swipe Yes`, `Swipe No`, 'Swipe Done'],
  )
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array?page=1&tab=votes#tab-top
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}
