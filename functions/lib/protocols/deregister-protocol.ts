import {
  deleteUser,
  getStatics,
  updateUserState,
} from '../firestore/firestore-interface'
import {
  DeregisterStage,
  DeregisterStageStatics,
  Protocol,
  User,
} from '../firestore/firestore-types'
import { TeleMessage } from '../telegram/tele-types'
import { sendMsg } from '../telegram/telegram-extension'
import { genInlineButtons, updateMessage } from '../telegram/telegram-inteface'
import { createNewState } from './protocol-utils'

const BOT_KEY = process.env.TELE_BOT_KEY

export async function deregisterProtocol(
  user: User,
  msg: TeleMessage,
  callbackId?: string,
  callbackData?: string[],
) {
  const msgs = await getStatics.deregister
  switch (user.state.stateStage) {
    case DeregisterStage.INITIALIZE:
      return _initialize(msgs, user)
    case DeregisterStage.RESPONSE:
      return _responseCallback(msgs, user, msg.message_id, callbackData[0])
    default:
  }
}

async function _initialize(msgs: DeregisterStageStatics, user: User) {
  const btns = genInlineButtons([['Confirm', 'Cancel']], ['Confirm', 'Cancel'])
  user.state = createNewState(Protocol.DEREGISTER, DeregisterStage.RESPONSE)
  await updateUserState(user.id, user.state)
  return sendMsg(user.id, msgs.REQUEST_CONFIRMATION, btns)
}

async function _responseCallback(
  msgs: DeregisterStageStatics,
  user: User,
  msgId: number,
  choice: string,
) {
  await updateUserState(user.id, null)
  switch (choice) {
    case 'Confirm':
      await deleteUser(user.id)
      return updateMessage(BOT_KEY, user.id, msgId, msgs.CONFIRM_DELETE)
    case 'Cancel':
      return updateMessage(BOT_KEY, user.id, msgId, msgs.ABORT_DELETE)
    default:
  }
}
