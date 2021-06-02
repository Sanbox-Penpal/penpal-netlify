import {
  getStatics,
  updateUser,
  updateUserState,
} from '../firestore/firestore-interface'
import {
  AddressStage,
  AddressStageStatics,
  Protocol,
  User,
} from '../firestore/firestore-types'
import { TeleMessage } from '../telegram/tele-types'
import { formatTeleTextToHtml, sendMsg } from '../telegram/telegram-extension'
import { genInlineButtons, updateMessage } from '../telegram/telegram-inteface'
import { createNewState } from './protocol-utils'
const BOT_KEY = process.env.TELE_BOT_KEY

export async function addressProtocol(
  user: User,
  msg: TeleMessage,
  callbackId?: string,
) {
  const msgs = await getStatics.address
  switch (user.state.stateStage) {
    case AddressStage.INITIALIZE:
      return _initialize(msgs, user)
    case AddressStage.VERIFY_ADDRESS:
      if (callbackId) return _verifyAddressCallback(user, msg)
      return _addressReply(msgs, user, msg)
    default:
  }
}

async function _initialize(msgs: AddressStageStatics, user: User) {
  user.state = createNewState(Protocol.ADDRESS, AddressStage.VERIFY_ADDRESS)
  await updateUserState(user.id, user.state)
  return sendMsg(user.id, msgs.INITIALIZE)
}

async function _verifyAddressCallback(user: User, msg: TeleMessage) {
  const msgId = msg.message_id
  let msgText = formatTeleTextToHtml(msg.text, msg.entities)
  msgText += '\n\n<b>Address Saved</b>'
  await updateMessage(BOT_KEY, user.id, msgId, msgText) // Remove button
  user.state = null
  return updateUserState(user.id, user.state)
}

async function _addressReply(
  msgs: AddressStageStatics,
  user: User,
  msg: TeleMessage,
) {
  const btns = genInlineButtons([['Verify']], ['Verify'])
  let textMsg = msgs.VERIFY_ADDRESS
  user.address = msg.text
  textMsg = textMsg.replace('$address', user.address)
  if (!user.state.stateData) {
    const sentMsg = await sendMsg(user.id, textMsg, btns)
    user.state.stateData = sentMsg.message_id
    return updateUser(user.id, user)
  }
  await updateUser(user.id, user)
  return updateMessage(BOT_KEY, user.id, user.state.stateData, textMsg, btns)
}
