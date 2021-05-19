import { genInlineButtons, sendMessage } from './telegram-inteface'
import {
  State,
  User,
  Protocol,
  SignUpStage,
  SignUpStageStatics,
} from './firestore-types'
import { createNewUser } from './protocol-utils'
import { TeleUser } from './tele-types'
import { getStaticMSgs } from './firestore-interface'
const BOT_KEY = process.env.TELE_BOT_KEY

async function _defaultResponse(chatId: number, protocol: Protocol) {
  const btns = genInlineButtons([['Reset']], ['resetStage'])
  return sendMessage(
    BOT_KEY,
    chatId,
    `Hmm you're currently in the middle of ${protocol}. Would you like to reset?`,
    btns,
  )
}

export async function signUpProtocol(user: TeleUser, state: State) {
  const msgs = await getStaticMSgs(Protocol.SIGN_UP)
  switch (state.stateStage) {
    case SignUpStage.PDPA:
      return _pdpaStage(msgs, user)
    case SignUpStage.PROGRAMMES:
    case SignUpStage.VERIFICATION:
    case SignUpStage.APPROVING:
    default:
  }
}

async function _pdpaStage(msgs: SignUpStageStatics, user: TeleUser) {
  const newUser: User = createNewUser(user.id, user.first_name)
}
