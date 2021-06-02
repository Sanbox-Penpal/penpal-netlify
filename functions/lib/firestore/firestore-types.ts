export interface User {
  id: string
  status: UserStatus
  verifierId?: string
  name: string
  username?: string
  address?: string
  introduction?: string
  interests: string[]
  hobbies: string[]
  programmes: string[]
  state: State
  swiperQueue: string[]
  likedUsers: string[]
}

export enum UserStatus {
  UNAPPROVED = 'Unapproved',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  DELETED = 'Deleted',
}

export interface State {
  protocol: Protocol
  stateStage: SignUpStage | string
  stateData: any
}

export interface ContentPage {
  admins: string[]
  allUsers: string[]
  giftCards: string[]
}

export interface GiftCard {
  url: string
  title: string
  description: string
  price: number
  left?: number
}

export enum Protocol {
  SIGN_UP = 'Signing Up',
  TINDER = 'Match Making',
  GIFT = 'Gifting',
  DEREGISTER = 'Deregister',
  PROFILE = 'Profile',
  ABOUT = 'About',
  ADDRESS = 'Address',
}

export type GeneralStaticDocument = { [key: string]: string | string[] }

export enum SignUpStage {
  PDPA = 'PDPA',
  PDPA_CALLBACK = 'PDPA Verification',
  PROGRAMMES = 'Adding Programmes',
  VERIFY_ADDRESS = 'Verify Address',
  VERIFICATION_REQUEST = 'Verification Request',
  VERIFICATION_RESPONSE = 'Verification Response',
  APPROVING = 'Approval',
}

export interface SignUpStageStatics extends GeneralStaticDocument {
  PDPA: string
  PDPA_DECLINED: string
  PROGRAMMES: string[]
  ADD_PROGRAMMES: string
  REQUEST_ADDRESS: string
  VERIFY_ADDRESS: string
  VERIFICATION: string
  VERIFICATION_RECEIVED: string
  VERIFICATION_APPROVED: string
  VERIFICATION_REJECTED: string
  BOUNCE_REJECTED: string
  BOUNCE_PENDING: string
  BOUNCE_ACCEPTED: string
}

export enum TinderStage {
  INITIALIZE = 'INITIALIZE',
  SWIPE = 'SWIPE',
}

export interface TinderStageStatics extends GeneralStaticDocument {
  NOT_CLEARED: string
  NO_LONGER_CLEARED: string
  SWIPE_CARD: string
  COMPLETED: string
  MATCH: string
}

export enum GiftStage {
  INITIALIZE = 'INITIALIZE',
  SELECT_CARD = 'SELECT_CARD',
  PAYMENT = 'PAYMENT',
}

export interface GiftStageStatics extends GeneralStaticDocument {
  INITIALIZE: string
  TEMPLATE: string
  ADMIN_RECEIPT: string
}

export enum DeregisterStage {
  INITIALIZE = 'INITIALIZE',
  RESPONSE = 'RESPONSE',
}

export interface DeregisterStageStatics extends GeneralStaticDocument {
  REQUEST_CONFIRMATION: string
  CONFIRM_DELETE: string
  ABORT_DELETE: string
}

export enum ProfileStage {
  INITIALIZE = 'INITIALIZE',
  INTRODUTION = 'Setting Introduction',
  INTERESTS = 'Setting Interests',
  HOBBIES = 'Setting Hobbies',
}

export interface ProfileStageStatics extends GeneralStaticDocument {
  NOT_CLEARED: string
  TEMPLATE: string
  INTRODUCTION: string
  HOBBIES: string
  INTERESTS: string
  END: string
  START_TINDER: string
}

export enum AboutStage {
  ABOUT = 'ABOUT',
  TERMS = 'TERMS',
}

export interface AboutStageStatics extends GeneralStaticDocument {
  ABOUT: string
  TERMS: string
}

export enum AddressStage {
  INITIALIZE = 'INITIALIZE',
  VERIFY_ADDRESS = 'Verifying Address',
}

export interface AddressStageStatics extends GeneralStaticDocument {
  INITIALIZE: string
  VERIFY_ADDRESS: string
}
