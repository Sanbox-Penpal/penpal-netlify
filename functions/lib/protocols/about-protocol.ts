import { getStatics } from '../firestore/firestore-interface'
import { AboutStage } from '../firestore/firestore-types'
import { TeleUser } from '../telegram/tele-types'
import { sendMsg } from '../telegram/telegram-extension'

export async function aboutProtocol(user: TeleUser, type: AboutStage) {
  const msgs = await getStatics.about
  switch (type) {
    case AboutStage.ABOUT:
      return sendMsg(user.id, msgs.ABOUT)
    case AboutStage.TERMS:
      return sendMsg(user.id, msgs.TERMS)
    default:
      return sendMsg(user.id, 'About Protocol Failed')
  }
}
