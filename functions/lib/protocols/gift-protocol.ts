import {
  GiftCard,
  GiftStage,
  GiftStageStatics,
  User,
} from '../firestore/firestore-types'
import {
  getAllGiftCards,
  getCard,
  getStatics,
  updateUserState,
} from '../firestore/firestore-interface'
import {
  answerCallbackQuery,
  deleteMessage,
  genInlineButtons,
  sendInvoice,
  sendPhoto,
  updateMedia,
  updateMessage,
} from '../telegram/telegram-inteface'
import { TeleInvoice, TeleMessage, TelePrice } from '../telegram/tele-types'
import { sendMsg } from '../telegram/telegram-extension'

const BOT_KEY = process.env.TELE_BOT_KEY

export async function giftProtocol(
  user: User,
  msg: TeleMessage,
  callbackId?: string,
  callbackData?: string[],
) {
  const msgs = await getStatics.gift
  switch (user.state.stateStage) {
    case GiftStage.INITIALIZE:
      return _initialize(msgs, user, msg, callbackId)
    case GiftStage.SELECT_CARD:
      return _swipeCard(msgs, user, msg, callbackData[0], callbackId)
    default:
  }
}

enum SwipeDirection {
  SELECT = 'Select',
  BACK = 'Back',
  NEXT = 'Next',
  INITIALIZE = 'Initialize',
}

async function _initialize(
  msgs: GiftStageStatics,
  user: User,
  msg: TeleMessage,
  callbackId?: string,
) {
  if (callbackId)
    await updateMessage(BOT_KEY, user.id, msg.message_id, msgs.INITIALIZE)
  else await sendMsg(user.id, msgs.INITIALIZE)
  user.state.stateStage = GiftStage.SELECT_CARD
  return _swipeCard(msgs, user, msg, SwipeDirection.INITIALIZE)
}

async function _swipeCard(
  msgs: GiftStageStatics,
  user: User,
  msg: TeleMessage,
  direction: string,
  callbackId?: string,
) {
  const cards = await getAllGiftCards()
  let gifteeId = user.state.stateData[0]
  let gifteeName = user.state.stateData[1]
  let userIndex = user.state.stateData[2]
  switch (direction) {
    case SwipeDirection.SELECT:
      await answerCallbackQuery(BOT_KEY, callbackId, 'Card Selected', false)
      await deleteMessage(BOT_KEY, user.id, msg.message_id)
      user.state.stateStage = GiftStage.PAYMENT
      const selectedCardId = cards[userIndex]
      const selectedCard = await getCard(selectedCardId)
      selectedCard.url = selectedCard.url.replace('.webp', '.png')
      const newInvoice: TeleInvoice = {
        title: selectedCard.title,
        description: `Sending this card to: ${gifteeName}`,
        start_parameter: null,
        currency: 'SGD',
        total_amount: selectedCard.price, // doesn't matter
      }
      const priceBreakdown: TelePrice[] = [
        {
          label: 'Card Price',
          amount: selectedCard.price * 100,
        },
      ]
      return sendInvoice(
        BOT_KEY,
        process.env.STRIPE_TOKEN,
        user.id,
        newInvoice,
        `${selectedCardId}_for_${gifteeId}`,
        priceBreakdown,
        selectedCard.url,
      )
    case SwipeDirection.BACK:
      userIndex = _cycleIndex(cards.length, userIndex, false)
      user.state.stateData[2] = userIndex
      break
    case SwipeDirection.NEXT:
      userIndex = _cycleIndex(cards.length, userIndex)
      user.state.stateData[2] = userIndex
      break
    case SwipeDirection.INITIALIZE:
      userIndex = 0
      user.state.stateData[2] = userIndex
      break
    default:
      return
  }

  const cardId = cards[userIndex]
  const card = await getCard(cardId)
  card.url = card.url.replace('.webp', '.png')
  const msgText = _fillTemplate(msgs.TEMPLATE, card, user.state.stateData[1])
  const btns = genInlineButtons(
    [['Select'], ['Back', 'Next']],
    [SwipeDirection.SELECT, SwipeDirection.BACK, SwipeDirection.NEXT],
  )
  if (direction != SwipeDirection.INITIALIZE || callbackId) {
    await answerCallbackQuery(BOT_KEY, callbackId, 'Changed card', false)
    await updateUserState(user.id, user.state)
    return updateMedia(
      BOT_KEY,
      user.id,
      msg.message_id,
      msgText,
      'photo',
      card.url,
      btns,
    )
  }
  await updateUserState(user.id, user.state)
  return sendPhoto(BOT_KEY, user.id, card.url, msgText, btns)
}

function _cycleIndex(total: number, index: number, forward = true) {
  if (forward) index += 1
  else index -= 1
  if (index == -1) index = total - 1
  return index % total
}

function _fillTemplate(template: string, card: GiftCard, giftingTo: string) {
  let res = template.replace('$giftee', giftingTo)
  res = res.replace('$title', card.title ? card.title : '')
  res = res.replace('$description', card.description ? card.description : '')
  res = res.replace('$price', card.price ? `$${card.price.toFixed(2)}` : '')
  res = res.replace(
    '$left',
    card.left ? `<i>Pieces Left: ${card.left}</i>` : '',
  )
  return res
}
