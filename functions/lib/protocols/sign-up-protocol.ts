import {
  answerCallbackQuery,
  embedMetadata,
  genInlineButtons,
  sendDocument,
  sendPhoto,
  updateCaption,
  updateMessage,
} from '../telegram/telegram-inteface'
import {
  sendMsg,
  formatTeleTextToHtml,
  informAdmins,
} from '../telegram/telegram-extension'
import {
  User,
  Protocol,
  SignUpStage,
  SignUpStageStatics,
  UserStatus,
  ProfileStage,
} from '../firestore/firestore-types'
import { TeleMessage, TeleUser } from '../telegram/tele-types'
import { ProtocolMetadata } from './types'
import {
  getAdmins,
  getStatics,
  getUser,
  recordVerifiedUser,
  registerUser,
  updateUser,
  updateUserProgrammes,
  updateUserState,
  updateUserStatus,
} from '../firestore/firestore-interface'
const BOT_KEY = process.env.TELE_BOT_KEY

export async function signUpProtocol(
  teleUser: TeleUser,
  user: User,
  msg: TeleMessage,
  callbackId?: string,
  callbackData?: string[],
) {
  const state = user.state
  const msgText = formatTeleTextToHtml(msg.text, msg.entities)
  const msgId = msg.message_id
  const msgs = await getStatics.sign_up
  switch (state.stateStage) {
    case SignUpStage.PDPA:
      return _pdpaStage(msgs, user)
    case SignUpStage.PDPA_CALLBACK:
      return _pdpaCallback(msgs, user, msgId, msgText, callbackData)
    case SignUpStage.PROGRAMMES:
      return _addProgrammesCallback(
        msgs,
        user,
        msgId,
        msgText,
        callbackId,
        callbackData,
      )
    case SignUpStage.VERIFICATION_REQUEST:
      return _verificationReply(msgs, user, msg)
    case SignUpStage.VERIFICATION_RESPONSE:
      return _verificationCallback(msgs, user, teleUser, msg, callbackData)
    default:
  }
}

async function _pdpaStage(msgs: SignUpStageStatics, newUser: User) {
  newUser.state.stateStage = SignUpStage.PDPA_CALLBACK
  let msgText = msgs.PDPA
  const btns = genInlineButtons([['Accept', 'Decline']], [`Accept`, `Decline`])
  await registerUser(newUser)
  return sendMsg(newUser.id, msgText, btns)
}

async function _pdpaCallback(
  msgs: SignUpStageStatics,
  user: User,
  msgId: number,
  msgText: string,
  callbackData: string[],
) {
  const choice = callbackData[0]
  if (choice == 'Accept') {
    msgText += '\n\nYou have <b>accepted</b> the agreement'
    await updateMessage(BOT_KEY, user.id, msgId, msgText)
    user.state.stateStage = SignUpStage.PROGRAMMES
    await updateUserState(user.id.toString(), user.state)
    const btns = genInlineButtons(
      msgs.PROGRAMMES.map((prog) => [prog]),
      msgs.PROGRAMMES.map((val, index) => index.toString()),
    )
    return sendMsg(user.id, msgs.ADD_PROGRAMMES, btns)
  } else {
    await updateUserState(user.id.toString(), null)
    await updateMessage(BOT_KEY, user.id, msgId, msgs.PDPA_DECLINED)
  }
}

async function _addProgrammesCallback(
  msgs: SignUpStageStatics,
  user: User,
  msgId: number,
  msgText: string,
  callbackId: string,
  callbackData: string[],
) {
  const programmes = msgs.PROGRAMMES
  const selectedProgrammeIndex = parseInt(callbackData[0])
  const selectedProgramme = programmes[selectedProgrammeIndex]

  if (selectedProgramme == 'Done') {
    await updateMessage(BOT_KEY, user.id, msgId, msgText)
    user.state.stateStage = SignUpStage.VERIFICATION_REQUEST
    await updateUserState(user.id, user.state)
    return sendMsg(user.id, msgs.VERIFICATION)
  }

  if (selectedProgramme == 'Clear') {
    user.programmes = []
    answerCallbackQuery(BOT_KEY, callbackId, 'Programmes Cleared', false)
  } else if (user.programmes.includes(selectedProgramme)) {
    user.programmes = user.programmes.filter(
      (elem) => elem != selectedProgramme,
    )
    answerCallbackQuery(
      BOT_KEY,
      callbackId,
      `${selectedProgramme} removed`,
      false,
    )
  } else {
    user.programmes.push(selectedProgramme)
    answerCallbackQuery(
      BOT_KEY,
      callbackId,
      `${selectedProgramme} added`,
      false,
    )
  }
  await updateUserProgrammes(user.id, user.programmes)
  msgText = msgs.ADD_PROGRAMMES
  user.programmes.forEach((p) => (msgText += ` - ${p}\n`))
  const btns = genInlineButtons(
    programmes.map((prog) => [prog]),
    programmes.map((val, index) => index.toString()),
  )
  return updateMessage(BOT_KEY, user.id, msgId, msgText, btns)
}

async function _verificationReply(
  msgs: SignUpStageStatics,
  user: User,
  msg: TeleMessage,
) {
  if (!msg.document && !msg.photo) return sendMsg(user.id, msgs.VERIFICATION)
  await sendMsg(user.id, msgs.VERIFICATION_RECEIVED)
  await updateUserStatus(user.id, UserStatus.PENDING)

  const unverifiedUser = await getUser(user.id)
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
    '\n<b>Programmes:</b>'
  for (let programme of unverifiedUser.programmes) {
    adminMsg += `\n - ${programme}`
  }
  const metadata: ProtocolMetadata = {
    protocol: Protocol.SIGN_UP,
    stage: SignUpStage.VERIFICATION_RESPONSE,
    referencedUser: unverifiedUser.id,
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
        msg.document.file_id,
        adminMsg,
        adminBtns,
      )
    } else if (msg.photo) {
      await sendPhoto(BOT_KEY, admin, msg.photo[0].file_id, adminMsg, adminBtns)
    }
  }
}

async function _verificationCallback(
  msgs: SignUpStageStatics,
  unverifiedUser: User,
  verifier: TeleUser,
  msg: TeleMessage,
  callbackData: string[],
) {
  let msgText = formatTeleTextToHtml(msg.caption, msg.caption_entities)

  if (unverifiedUser.status == UserStatus.DELETED) {
    return updateCaption(
      BOT_KEY,
      msg.chat.id,
      msg.message_id,
      msgText + 'The user has withdrawn his application',
    )
  } else if (unverifiedUser.status != UserStatus.PENDING) {
    let admin = await getUser(unverifiedUser.verifierId)
    return updateCaption(
      BOT_KEY,
      msg.chat.id,
      msg.message_id,
      msgText +
        `This user has already been ${unverifiedUser.status} by @${
          admin != null ? admin.username : 'unknown'
        }`,
    )
  }

  const decision = callbackData[0]
  if (decision == 'Accept') {
    unverifiedUser.status = UserStatus.APPROVED
    unverifiedUser.verifierId = verifier.id.toString()
    msgText += `\n\n<b>Approved by: @${verifier.username}</b>`
    await recordVerifiedUser(unverifiedUser.id)
    const metadata: ProtocolMetadata = {
      protocol: Protocol.PROFILE,
      stage: ProfileStage.INITIALIZE,
    }
    const btns = genInlineButtons([['Set up my profile!']], ['Profile'])
    await sendMsg(
      unverifiedUser.id,
      embedMetadata(metadata, msgs.VERIFICATION_APPROVED),
      btns,
    )
  } else if (decision == 'Reject') {
    unverifiedUser.status = UserStatus.REJECTED
    unverifiedUser.verifierId = verifier.id.toString()
    msgText += `\n\n<b>Rejected by: @${verifier.username}</b>`
    await sendMsg(unverifiedUser.id, msgs.VERIFICATION_REJECTED)
  }
  unverifiedUser.state = null
  await updateUser(unverifiedUser.id, unverifiedUser)
  return updateCaption(BOT_KEY, msg.chat.id, msg.message_id, msgText)
}
