import axios from 'axios'
import {
  TeleResponse,
  convertError,
  TeleInlineKeyboardButton,
  TeleInlineKeyboard,
  TeleMessageEntities,
  TeleReplyKeyboard,
} from './tele-types'
import { ProtocolMetadata } from '../protocols/types'

const TELE_API = 'https://api.telegram.org/bot'

/**
 * Sends a http response back to the Bot to acknowledge a CallbackQuery
 * Required for better UI/UX
 * @param bot_key string
 * @param callback_query_id string referencing a callback_query
 * @param text string to be shown to user as notification/alert
 * @param show_alert boolean
 */
export async function answerCallbackQuery(
  bot_key: string,
  callback_query_id: string,
  text: string,
  show_alert: boolean,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post<TeleResponse>(TELE_API + bot_key + '/answerCallbackQuery', {
        callback_query_id: callback_query_id,
        text: text,
        show_alert: show_alert,
      })
      .then((res) => {
        console.log(`Callback ${callback_query_id}`)
        resolve(res.data)
      })
      .catch((err) => {
        let convertedError = convertError(err)
        convertedError.errorDescription = 'default'
        reject(convertedError)
      })
  })
}

/**
 * Sends a message via the bot
 * @param bot_key
 * @param chat_id
 * @param text
 * @param reply_markup
 * @returns
 */
export async function sendMessage(
  bot_key: string,
  chat_id: number | string,
  text: string,
  reply_markup:
    | TeleInlineKeyboard
    | TeleReplyKeyboard = {} as TeleInlineKeyboard,
) {
  return new Promise((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/sendMessage', {
        chat_id: chat_id,
        text: text,
        parse_mode: 'HTML',
        reply_markup: reply_markup,
      })
      .then((res) => {
        const msgDetails = res.data.result
        console.log(`Message posted (id: ${msgDetails.message_id})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

/**
 * Deletes a message
 * Bot must be an admin in a group (see other reqs: https://core.telegram.org/bots/api#deletemessage)
 * @param bot_key string
 * @param chat_id integer
 * @param msg_id integer
 */
export async function deleteMessage(
  bot_key: string,
  chat_id: number,
  msg_id: number,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/deleteMessage', {
        chat_id,
        message_id: msg_id,
      })
      .then((res) => {
        console.log(`Message Deleted [chat: ${chat_id}]: (msg_id: ${msg_id})})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

/**
 * Generates the Telegram parameter for Inline Keyboard Markup
 * @param buttonArr array of rows containing an array of button labels (rows, cols)
 * @param callbackArr single array of callback data matching buttonArr (for each row, for each col)
 * @returns  Parameter Object for posting Inline (callback_query) Buttons
 */
export function genInlineButtons(
  buttonArr: Array<Array<string>>,
  callbackArr: Array<string>,
) {
  var result = []
  var counter = 0
  for (var i = 0; i < buttonArr.length; ++i) {
    var rowArr = []
    for (var buttonLabel of buttonArr[i]) {
      rowArr.push({
        text: buttonLabel,
        callback_data: callbackArr[counter],
      } as TeleInlineKeyboardButton)
      counter += 1
    }
    result.push(rowArr)
  }
  return { inline_keyboard: result } as TeleInlineKeyboard
}

/**
 * Generates the Telegram parameter for Inline Keyboard Markup
 * @param buttonArr array of rows containing an array of button labels (rows, cols)
 * @param callbackArr single array of callback data matching buttonArr (for each row, for each col)
 * @param urlArr single array of url links matching buttonArr (for each row, for each col)
 * @returns Telegram Parameter Object for posting Inline Url Buttons
 */
export function genInlineUrlButtons(
  buttonArr: Array<Array<string>>,
  callbackArr: Array<string>,
  urlArr: Array<string>,
) {
  var result = []
  var counter = 0
  for (var i = 0; i < buttonArr.length; ++i) {
    var rowArr = []
    for (var buttonLabel of buttonArr[i]) {
      rowArr.push({
        text: buttonLabel,
        callback_data: callbackArr[counter],
        url: urlArr[counter],
      } as TeleInlineKeyboardButton)
      counter += 1
    }
    result.push(rowArr)
  }
  return { inline_keyboard: result } as TeleInlineKeyboard
}

/**
 * Updates a message
 * @param bot_key string
 * @param chat_id integer | string
 * @param msg_id integer
 * @param text string
 * @param reply_markup Telegram Object
 */
export async function updateMessage(
  bot_key: string,
  chat_id: number | string,
  msg_id: number,
  text: string,
  reply_markup: TeleInlineKeyboard = {} as TeleInlineKeyboard,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/editMessageText', {
        chat_id: chat_id,
        message_id: msg_id,
        text: text,
        parse_mode: 'HTML',
        reply_markup: reply_markup,
      })
      .then((res) => {
        console.log(`Message Updated (id: ${res.data.result.message_id})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

/**
 * Sends a photo via the bot
 * @param bot_key string
 * @param chat_id integer | string
 * @param photo_file_id file_id of image on Telegram Server or alternatively string url of photo (not guaranteed to work)
 * @param caption string
 * @param reply_markup buttons
 */
export async function sendPhoto(
  bot_key: string,
  chat_id: number | string,
  photo_file_id: string,
  caption: string,
  reply_markup:
    | TeleInlineKeyboard
    | TeleReplyKeyboard = {} as TeleInlineKeyboard,
) {
  return new Promise<TeleResponse>((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/sendPhoto', {
        chat_id: chat_id,
        photo: photo_file_id,
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: reply_markup,
      })
      .then((res) => {
        const msgDetails = res.data.result
        console.log(`Photo posted (id: ${msgDetails.message_id})`)
        resolve(res.data)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

/**
 * Sends a document via the bot
 * @param bot_key string
 * @param chat_id integer | string
 * @param document_id file_id of document on Telegram Server or alternatively url of a gif, pdf or zip file
 * @param caption string
 * @param reply_markup buttons
 */
export async function sendDocument(
  bot_key: string,
  id: number | string,
  document_id: string,
  caption: string,
  reply_markup:
    | TeleInlineKeyboard
    | TeleReplyKeyboard = {} as TeleInlineKeyboard,
) {
  return new Promise((resolve, reject) => {
    axios
      .post(TELE_API + bot_key + '/sendDocument', {
        chat_id: id,
        document: document_id,
        caption: caption,
        reply_markup: reply_markup,
      })
      .then((res) => {
        const msgDetails = res.data.result
        console.log(`Document posted (id: ${msgDetails.message_id})`)
        resolve(msgDetails)
      })
      .catch((err) => {
        reject(convertError(err))
      })
  })
}

//--- Formating Functions

/**
 * Converts Telegram's formats of the text to include HTML formatting
 * Created when I was using javascript and didn't know the below enums
 * enum: mention/hashtag/bot_command/url/email/phone_number/bold/italic/underline/strikethrough/code/pre/text_link/text_mention
 * @param textMsg text containing html markup such as <b>
 * @param formatting formatting [{0: offsetFromStart, 1: length, 2: formatType}]
 */
export function convertToHTML(
  textMsg: string,
  formatting: [TeleMessageEntities],
) {
  if (!formatting) return textMsg
  // Converts from array of objects to array of arrays
  var sortedFormatting = []
  for (format of formatting) {
    sortedFormatting.push(Object.values(format))
    //console.log();
  }
  // https://stackoverflow.com/questions/50415200/sort-an-array-of-arrays-in-javascript
  sortedFormatting.sort(function (a, b) {
    if (a[0] == b[0]) {
      return a[1] - b[1]
    }
    return a[0] - b[0]
  })
  var reference = []
  var delimeterFront = ''
  var delimeterEnd = ''
  for (var format of sortedFormatting) {
    // Decide the delimeter
    switch (format[2]) {
      case 'bold':
        delimeterFront = '<b>'
        delimeterEnd = '</b>'
        break
      case 'italic':
        delimeterFront = '<i>'
        delimeterEnd = '</i>'
        break
      case 'underline':
        delimeterFront = '<u>'
        delimeterEnd = '</u>'
        break
      case 'code':
        delimeterFront = '<code>'
        delimeterEnd = '</code>'
        break
      case 'strikethrough':
        delimeterFront = '<s>'
        delimeterEnd = '</s>'
        break
      case 'text_link':
        delimeterFront = '<a href="' + format[3] + '">'
        delimeterEnd = '</a>'
        break
      default:
        delimeterFront = ''
        delimeterEnd = ''
    }
    var start = format[0]
    var end = format[0] + format[1] // non-inclusive

    // Amend the indexes due to past edits
    var startCopy = start
    var endCopy = end
    for (var i = 0; i < reference.length; ++i) {
      var x = reference[i]
      if (start > x[0] || (start == x[0] && x[2] == 'tail')) {
        startCopy += x[1].length
      }
      if (end > x[0] || (end == x[0] && start == reference[i - 1][0])) {
        endCopy += x[1].length
      }
    }

    // Amend the texts
    var msgCopy = textMsg
    msgCopy = textMsg.slice(0, startCopy) + delimeterFront
    msgCopy += textMsg.slice(startCopy, endCopy) + delimeterEnd
    msgCopy += textMsg.slice(endCopy)
    textMsg = msgCopy

    // Track the new edits
    reference.push([start, delimeterFront, 'head'])
    reference.push([end, delimeterEnd, 'tail'])
  }
  return textMsg
}

// helper function that prevents html/css/script malice
export const cleanseString = function (string: string): string {
  if (!string) return
  return string.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function embedMetadata(metadata: ProtocolMetadata, text: string) {
  text += `<a href="tg://metadata/${JSON.stringify(metadata)
    .split('"')
    .join("'")}/end">\u200b</a>`
  return text
}

export function extractMetadata(htmlText: string): ProtocolMetadata {
  var res = htmlText.split('tg://metadata/')[1]
  if (!res) return null
  res = res.split('/end')[0]
  res = res.split("'").join('"')
  return JSON.parse(res.split('/end')[0])
}
