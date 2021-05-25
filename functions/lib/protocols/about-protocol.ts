import { getStatics } from '../firestore/firestore-interface'
import { TeleUser } from '../telegram/tele-types'
import { sendMsg } from '../telegram/telegram-extension'

export async function aboutProtocol(user: TeleUser) {
  const msgs = await getStatics.about
  return sendMsg(user.id, msgs.ABOUT)
}
