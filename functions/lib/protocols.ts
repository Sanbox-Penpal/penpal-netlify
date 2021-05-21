import {
  embedMetadata,
  genInlineButtons,
  sendDocument,
  sendPhoto,
  updateMessage,
} from './telegram-inteface'
import {
  sendMsg,
  formatTeleTextToHtml,
  informAdmins,
} from './telegram-extension'
import {
  State,
  User,
  Protocol,
  SignUpStage,
  SignUpStageStatics,
  UserStatus,
} from './firestore-types'
import { createNewUser } from './protocol-utils'
import { TeleMessage, TeleUser } from './tele-types'
import { ProtocolMetadata } from './types'
import {
  getAdmins,
  getStaticMSgs,
  getUser,
  registerUser,
  updateUser,
  updateUserProgrammes,
  updateUserState,
  updateUserStatus,
} from './firestore-interface'
const BOT_KEY = process.env.TELE_BOT_KEY

async function _defaultResponse(chatId: number, protocol: Protocol) {
  const btns = genInlineButtons([['Reset']], ['resetStage'])
  return sendMsg(
    chatId,
    `Hmm you're currently in the middle of ${protocol}. Would you like to reset?`,
    btns,
  )
}

export async function signUpProtocol(
  user: TeleUser,
  state: State,
  msg: TeleMessage,
  callbackData?: string[],
) {
  const msgText = formatTeleTextToHtml(msg.text, msg.entities)
  const msgId = msg.message_id
  const msgs = await getStaticMSgs(Protocol.SIGN_UP)
  switch (state.stateStage) {
    case SignUpStage.PDPA:
      return _pdpaStage(msgs, user)
    case SignUpStage.PDPA_CALLBACK:
      return _pdpaCallback(msgs, state, user, msgId, msgText, callbackData)
    case SignUpStage.PROGRAMMES:
      return _addProgrammesCallback(msgs, user, msgId, msgText, callbackData)
    case SignUpStage.VERIFICATION_REQUEST:
      return _verificationReply(msgs, user, msg)
    case SignUpStage.VERIFICATION_RESPONSE:
      return _verificationCallback(msgs, user, msg, state, callbackData)
    default:
  }
}

async function _pdpaStage(msgs: SignUpStageStatics, user: TeleUser) {
  const newUser: User = createNewUser(user.id, user.first_name)
  let msgText = msgs.PDPA
  const btns = genInlineButtons([['Accept', 'Decline']], [`Accept`, `Decline`])
  await registerUser(newUser)
  return sendMsg(user.id, msgText, btns)
}

async function _pdpaCallback(
  msgs: SignUpStageStatics,
  state: State,
  user: TeleUser,
  msgId: number,
  msgText: string,
  callbackData: string[],
) {
  const choice = callbackData[0]
  if (choice == 'Accept') {
    msgText += '\n\nYou have <b>accepted</b> the agreement'
    await updateMessage(BOT_KEY, user.id, msgId, msgText)
    state.stateStage = SignUpStage.PROGRAMMES
    await updateUserState(user.id.toString(), state)
    const btns = genInlineButtons(
      [msgs.PROGRAMMES],
      msgs.PROGRAMMES.map((val, index) => index.toString()),
    )
    return sendMsg(user.id, msgs.ADD_PROGRAMMES, btns)
  } else {
    await updateMessage(BOT_KEY, user.id, msgId, msgs.PDPA_DECLINED)
  }
}

async function _addProgrammesCallback(
  msgs: SignUpStageStatics,
  teleUser: TeleUser,
  msgId: number,
  msgText: string,
  callbackData: string[],
) {
  let user = await getUser(teleUser.id.toString())
  const programmes = msgs.PROGRAMMES
  const selectedProgrammeIndex = parseInt(callbackData[0])
  const selectedProgramme = programmes[selectedProgrammeIndex]

  if (selectedProgramme == 'Done') {
    await updateMessage(BOT_KEY, teleUser.id, msgId, msgText)
    user.state.stateStage = SignUpStage.VERIFICATION_REQUEST
    await updateUserState(user.id, user.state)
    return await sendMsg(teleUser.id, msgs.VERIFICATION)
  }

  if (selectedProgramme == 'Clear') {
    user.programmes = []
  } else if (user.programmes.includes(selectedProgramme)) {
    user.programmes = user.programmes.filter(
      (elem) => elem == selectedProgramme,
    )
  } else {
    user.programmes.push(selectedProgramme)
  }
  await updateUserProgrammes(user.id, user.programmes)
  msgText = msgs.ADD_PROGRAMMES
  user.programmes.forEach((p) => (msgText += ` - ${p}\n`))
  const btns = genInlineButtons(
    [msgs.PROGRAMMES],
    msgs.PROGRAMMES.map((val, index) => index.toString()),
  )
  return updateMessage(BOT_KEY, teleUser.id, msgId, msgText, btns)
}

async function _verificationReply(
  msgs: SignUpStageStatics,
  user: TeleUser,
  msg: TeleMessage,
) {
  if (!msg.document && !msg.photo) return sendMsg(user.id, msgs.VERIFICATION)
  await sendMsg(user.id, msgs.VERIFICATION_RECEIVED)
  await updateUserStatus(user.id.toString(), UserStatus.PENDING)

  const unverifiedUser = await getUser(user.id.toString())
  const admins = await getAdmins()
  if (unverifiedUser == null)
    return informAdmins(
      admins,
      `Error obtaining User ${unverifiedUser.username} for Verification`,
    )
  unverifiedUser.state.stateStage = SignUpStage.VERIFICATION_RESPONSE
  await updateUserState(unverifiedUser.id, unverifiedUser.state)

  var adminMsg =
    '<b>📬 New User!</b>\n' +
    `\n<b>Name:</b> ${unverifiedUser.name}` +
    `\n<b>Username:</b> @${unverifiedUser.username}` +
    '\n<b>Programmes:</b> \n'
  for (let programme of unverifiedUser.programmes) {
    adminMsg += `\n - ${programme}`
  }
  const metadata: ProtocolMetadata = {
    protocol: Protocol.SIGN_UP,
    stage: SignUpStage.VERIFICATION_RESPONSE,
    data: unverifiedUser.id,
  }
  adminMsg = embedMetadata(metadata, adminMsg)
  const adminBtns = genInlineButtons(
    [['Accept', 'Reject']],
    ['Accept', 'Reject'],
  )
  for (let admin of admins) {
    if (msg.document) {
      await sendDocument(
        BOT_KEY,
        admin,
        msg.document.file_unique_id,
        adminMsg,
        adminBtns,
      )
    } else if (msg.photo) {
      await sendPhoto(
        BOT_KEY,
        admin,
        msg.photo[0].file_unique_id,
        adminMsg,
        adminBtns,
      )
    }
  }
}

async function _verificationCallback(
  msgs: SignUpStageStatics,
  user: TeleUser,
  msg: TeleMessage,
  state: State,
  callbackData: string[],
) {
  const unverifiedUserId: string = state.stateData
  let unverifiedUser = await getUser(unverifiedUserId)
  let msgText = formatTeleTextToHtml(msg.text, msg.entities)

  if (unverifiedUser.status != UserStatus.PENDING) {
    let admin = await getUser(unverifiedUser.verifierId)
    return updateMessage(
      BOT_KEY,
      msg.chat.id,
      msg.message_id,
      msgText +
        `This user has already been ${unverifiedUser.status} by @${
          admin != null ? admin.username : 'unknown'
        }`,
    )
  }

  if (
    unverifiedUser.state.protocol != Protocol.SIGN_UP ||
    unverifiedUser.state.stateStage != SignUpStage.VERIFICATION_RESPONSE
  ) {
    return updateMessage(
      BOT_KEY,
      msg.chat.id,
      msg.message_id,
      msgText + 'The user has withdrawn his application',
    )
  }

  const decision = callbackData[0]
  if (decision == 'Accept') {
    unverifiedUser.status = UserStatus.APPROVED
    unverifiedUser.verifierId = user.id.toString()
    msgText += `\n\n<b>Approved by: @${user.username}</b>`
    await sendMsg(unverifiedUser.id, msgs.VERIFICATION_APPROVED)
  } else if (decision == 'Reject') {
    unverifiedUser.status = UserStatus.REJECTED
    unverifiedUser.verifierId = user.id.toString()
    msgText += `\n\n<b>Rejected by: @${user.username}</b>`
    await sendMsg(unverifiedUser.id, msgs.VERIFICATION_REJECTED)
  }
  unverifiedUser.state = null
  await updateUser(unverifiedUser.id, unverifiedUser)
  await updateMessage(BOT_KEY, msg.chat.id, msg.message_id, msgText)
}
