import { AxiosError } from 'axios'
export interface TeleResponse {
  ok: boolean
  description?: string
  result: any
}

export interface TeleError {
  errorCode: number
  errorDescription?: string
}

export interface TeleUpdate {
  update_id: number
  message?: TeleMessage
  chat_member?: TeleMemberUpdate
  callback_query?: TeleCallbackQuery
  pre_checkout_query?: TelePreCheckoutQuery
  // Below are not yet used and so not implemented
  /*
  edited_message?: TeleMessage
  channel_post?: TeleMessage
  edited_channel_post?: TeleMessage
  inline_query?: TeleInlineQuery
  chosen_inlline_result?: TeleChosenInlineResult
  poll?: TelePoll
  poll_answer?: TelePollAnswer
  my_chat_member?: TeleSelfMembershipUpdate
  */
}

export interface TeleCallbackQuery {
  id: string
  from: TeleUser
  message?: TeleMessage
  inline_message_id?: string
  chat_instance: string
  data?: string
  game_short_name?: string
}

export interface TeleMessage {
  message_id: number
  from?: TeleUser // Empty for channels
  sender_chat?: TeleChat // For channels
  date: number // Unix time
  chat: TeleChat
  forward_from?: TeleUser
  forward_from_chat?: TeleChat
  forward_from_message_id?: number
  forward_signature?: string
  forward_sender_name?: string
  forward_date?: number // Unix time
  reply_to_message: TeleMessage
  via_bot?: TeleUser
  edit_date?: number
  media_group_id?: string
  author_signature?: string
  text?: string
  reply_markup?: TeleInlineKeyboard
  entities?: [TeleMessageEntities]
  new_chat_members?: [TeleUser]
  left_chat_member?: TeleUser
  caption?: string
  caption_entities?: [TeleMessageEntities]
  document?: TeleDocument
  photo?: [TelePhotoSize]
  successful_payment?: TeleReceipt

  // Below are not yet used and so not implemented
  /*
  animation: TeleAnimation
  audio?: TeleAudio
  sticker?: TeleSticker
  video?: TeleVideo
  video_note?: TeleVideoNote
  voice?: TeleVoice
  contact?: TeleContact
  dice?: TeleDice
  game?: TeleGame
  poll?: TelePoll
  venue?: TeleVenue
  location?: TeleLocation
  new_chat_title?: string
  new_chat_photo?: [PhotoSize]
  delete_chat_photo?: boolean
  group_chat_created?: boolean
  supergroup_chat_created?: boolean
  channel_chat_created?: boolean
  */
}

export interface TeleUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  // for bots, getMe only
  can_join_groups?: boolean
  can_read_all_group_messages?: boolean
  supports_inline_queries?: boolean
}

export interface TeleChat {
  id: number
  type: string // enum: private/group/supergroup/channel
  title?: string
  username?: string
  first_name: string
  last_name?: string
}

export interface GetChatTeleChat extends TeleChat {
  // photo: TeleChatPhoto
  bio?: string
  description?: string
  invite_link?: string
  pinned_message?: TeleMessage
  // permissions: TeleChatPermissions
  slow_mode_delay?: number
  message_auto_delete_time?: number
  sticker_set_name?: string
  can_set_sticker_set?: boolean
  linked_chat_id?: number
  // location: TeleChatLocation
}

export interface TeleMemberUpdate {
  chat: TeleChat
  from: TeleUser // Performer of the change
  date: number // Unix time
  old_chat_member: TeleChatMember // Old member info
  new_chat_member: TeleChatMember // New member info
  invite_link?: ChatInviteLink
}

export interface TeleChatMember {
  user: TeleUser
  status: string // enum: creator, administrator, member, restricted, left, kicked
  custom_title?: string // owner/admin only
  is_anonymous?: boolean
  can_be_edited?: boolean // edit admin privileges
  can_manage_chat?: boolean
  can_post_messages?: boolean // channel only
  can_edit_messages?: boolean // channel only
  can_delete_messages?: boolean
  can_manage_voice_chats?: boolean
  can_restrict_members?: boolean
  can_promote_members?: boolean
  can_change_info?: boolean
  can_invite_users?: boolean
  can_pin_messages?: boolean
  is_member?: boolean // Restricted only
  can_send_messages?: boolean
  can_send_media_messages?: boolean
  can_send_polls?: boolean
  can_send_other_messages?: boolean
  can_add_web_page_previews?: boolean
  until_date?: number // Unix time
}

export interface ChatInviteLink {
  invite_link: string
  creator: TeleUser
  is_primary: boolean
  is_revoked: boolean
  expire_date?: number
  member_limit?: number
}

export interface TeleInlineKeyboard {
  inline_keyboard: [[TeleInlineKeyboardButton]]
}

export interface TeleInlineKeyboardButton {
  text: string
  callback_data?: string
  url?: string
  //login_url?: LoginUrl
  switch_inline_query?: string
  switch_inline_query_current_chat?: string
  // callback_game?: CallbackGame
  pay: boolean
}

export interface TeleReplyKeyboard {
  keyboard: Array<Array<TeleKeyboardButton>>
  resize_keyboard?: boolean
  one_time_keyboard?: boolean
  selective?: boolean
}

export interface TeleKeyboardButton {
  text: string
  request_contact?: boolean
  request_location?: boolean
  // request_poll?: TeleKeyboardButtonPoll
}

export interface TeleMessageEntities {
  type: string // enum: mention/hashtag/bot_command/url/email/phone_number/bold/italic/underline/strikethrough/code/pre/text_link/text_mention
  offset: number // Offset in UTF-16 code units to the start of the entity
  length: number // Length of the entity in UTF-16 code units
  url?: string // Optional. For “text_link” only, url that will be opened after user taps on the text
  user?: TeleUser // Optional. For “text_mention” only, the mentioned user
  language?: string // Optional. For “pre” only, the programming language of the entity text
}

export interface TeleDocument {
  file_id: string
  file_unique_id: string
  thumb?: TelePhotoSize
  file_name?: string
  mime_type?: string
  file_size?: number
}

export interface TelePhotoSize {
  file_id: string
  file_unique_id: string
  width: number
  height: number
  file_size?: number
}

export interface TeleInvoice {
  title: string
  description: string
  start_parameter: string
  currency: string
  total_amount: number
}

export interface TelePrice {
  label: string
  amount: number // in cents
}

export interface TeleShippingOption {
  id: string
  title: string
  prices: TelePrice[]
}

export interface TeleShippingAddress {
  country_code: string
  state: string
  city: string
  street_line1: string
  street_line2: string
  post_code: string
}

export interface TeleOrderInfo {
  name?: string
  phone_number?: string
  email?: string
  address?: TeleShippingAddress
}

export interface TeleShippingQuery {
  id: string
  from: TeleUser
  invoice_payload: string
  shipping_addresss: TeleShippingAddress
}

export interface TelePreCheckoutQuery {
  id: string
  from: TeleUser
  currency: string
  total_amount: number
  invoice_payload: string
  shipping_option_id?: string
  order_info?: TeleOrderInfo
}

// Alias of successful_payment
export interface TeleReceipt {
  currency: string
  total_amount: number
  invoice_payload: string
  shipping_option_id?: string
  order_info?: TeleOrderInfo
  telegram_payment_charge_id: string
  provider_payment_charge_id: string
}

export const ERROR_CODES = {
  0: 'default',
  1: 'Missing Bot Key',
  2: 'Message (to delete) not found',
  3: 'Message (to edit) not found',
  4: 'Message cannot be edited',
  5: 'Missing chat_id',
  6: 'Message to be updated is exactly the same',
  7: 'User has blocked/deleted the bot or has not activated the bot',
}

// --- Error parsing function
export function convertError(err: AxiosError): TeleError {
  if (err.response && err.response.data.description == 'Not Found') {
    return { errorCode: 1, errorDescription: ERROR_CODES[1] }
  } else if (
    err.response &&
    err.response.data.description == 'Bad Request: message to delete not found'
  ) {
    return { errorCode: 2, errorDescription: ERROR_CODES[2] }
  } else if (
    err.response &&
    err.response.data.description == 'Bad Request: message to edit not found'
  ) {
    return { errorCode: 3, errorDescription: ERROR_CODES[3] }
  } else if (
    err.response &&
    err.response.data.description == "Bad Request: message can't be edited"
  ) {
    return { errorCode: 4, errorDescription: ERROR_CODES[4] }
  } else if (
    err.response &&
    err.response.data.description == 'Bad Request: chat_id is empty'
  ) {
    return { errorCode: 5, errorDescription: ERROR_CODES[5] }
  } else if (
    err.response &&
    err.response.data.description ==
      'Bad Request: message is not modified: specified new ' +
        'message content and reply markup are exactly the same ' +
        'as a current content and reply markup of the message'
  ) {
    return { errorCode: 6, errorDescription: ERROR_CODES[6] }
  } else if (
    err.response &&
    err.response.data.description == 'Forbidden: bot was blocked by the user'
  ) {
    return { errorCode: 7, errorDescription: ERROR_CODES[7] }
  } else {
    return { errorCode: 0, errorDescription: err.response.data.description }
  }
}
