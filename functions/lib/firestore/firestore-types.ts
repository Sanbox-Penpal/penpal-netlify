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

export interface TempMessage {
  ref: string
  msgs: string[]
  processing: boolean
}

export interface ContentPage {
  admins: string[]
  allUsers: string[]
}

export enum Protocol {
  SIGN_UP = 'Signing up',
  TINDER = 'Match Making',
  GIFT = 'Gifting',
  DEREGISTER = 'Deregister',
  PROFILE = 'Profile',
}

export enum SignUpStage {
  PDPA = 'PDPA',
  PDPA_CALLBACK = 'PDPA Verification',
  PROGRAMMES = 'Adding Programmes',
  VERIFICATION_REQUEST = 'Verification Request',
  VERIFICATION_RESPONSE = 'Verification Response',
  APPROVING = 'Approval',
}

export interface SignUpStageStatics {
  PDPA: string
  PDPA_DECLINED: string
  PROGRAMMES: string[]
  ADD_PROGRAMMES: string
  VERIFICATION: string
  VERIFICATION_RECEIVED: string
  VERIFICATION_APPROVED: string
  VERIFICATION_REJECTED: string
}

export enum TinderStage {
  INITIALIZE = 'INITIALIZE',
  SWIPE = 'SWIPE',
}

export interface TinderStageStatics {
  NOT_CLEARED: string
  NO_LONGER_CLEARED: string
  SWIPE_CARD: string
  COMPLETED: string
  MATCH: string
}

export enum GiftStage {
  INITIALIZE = 'INITIALIZE',
}

export interface GiftStageStatics {}

export enum DeregisterStage {
  INITIALIZE = 'INITIALIZE',
  RESPONSE = 'RESPONSE',
}

export interface DeregisterStageStatics {
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

export interface ProfileStageStatics {
  NOT_CLEARED: string
  TEMPLATE: string
  INTRODUCTION: string
  HOBBIES: string
  INTERESTS: string
  END: string
}
